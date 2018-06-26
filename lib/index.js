require('rootpath')()

const api = require('lib/services/api')
const collector = require('lib/services/collector')
const store = require('lib/store')
const testing = require('lib/testing')
const { isString, isObject } = require('lib/util/is-type')

// # TODO
//
// ## Error Handling
//
// * Rename Error -> BunchboxError
// * differentiate between non-recoverable Errors and Option::None responses
//
// ## TrafficAllocation
//
// * implement and test
//
// ## Validation
//
// * empty steps, variants,
// * multiple steps w/o targetings
// * hasCustomVariantDistribution w/o variant weights
// * all steps must have entry: true
//

module.exports = class BunchboxSdk {
  constructor(token, opts = {}) {
    if (!isString(token)) throw Error(`Invalid token: ${token}`)
    if (!isObject(opts)) throw Error(`Invalid opts: ${opts}`)

    this.opts = { host: opts.host } // TODO
    this.store = opts.store || store

    this.ready = new Promise((resolve, reject) => {
      // TODO implement retries, timeout etc

      api
        .fetchTestingFile(token)
        .then(testingFile => this.store.setState(testingFile))
        .then(resolve)
        .catch(reject)
    })
  }

  /**
   * Buckets visitor and sends impression event.
   * @param  {string}      experimentKey
   * @param  {string}      userId
   * @param  {Object}      attributes
   * @return {string|null} variation key
   */

  async activate({ userId, experimentId, stepIndex }, params) {
    await this.ready // TODO maybe store.experiments should return a promise instead?

    const experiment = this.store.getExperiment(experimentId)
    if (experiment == null) throw Error(`Experiment ${experimentId} not found`)
    const variant = testing.assignUser(experiment, stepIndex, userId, params)

    return collector.trackParticipation({
      variantId: variant.id,
      experimentId,
      userId,
      accountId: this.store.account
    })
  }

  /**
   * Sends conversion event.
   * @param  {string} eventKey
   * @param  {string} userId
   * @param  {string} attributes
   * @param  {Object} eventTags Values associated with the event.
   */
  async track(eventKey, userId, attributes, eventTags) {
    await this.ready

    // For convenience  the SDK user does not need to pass the experimentId.
    // Instead all experiments of the account are filtered by goalIdentifier.
    // Then, it is checked which variant the userId would be bucketed into.
    //
    // Note: optionally, it should be possible to directly give an experimentId
    // in order to skip the iteration of experiments. Also, it should be
    // possible to only pass the eId, effectively tracking all goals.

    // const res = await conversion.track(experimentId, variantId, userId, 'g1')
  }
}

async function track(experimentId, variantId, userId, goalIdentifier) {
  const e = store.experiments.find(experiment => experiment.id === experimentId)
  const g = e.goals.find(goal => goal.identifier === goalIdentifier)

  if (!g) throw Error(`no goal found for identifier ${goalIdentifier}`)
  if (!g.active) throw Error('the selected goal is not active')

  return collector.trackConversion({
    accountId: store.account,
    experimentId,
    goalId: g.id,
    variantId,
    userId
  })
}
