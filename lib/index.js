require('rootpath')()

const api = require('lib/services/api')
const collector = require('lib/services/collector')
const store = require('lib/store')
const bucketer = require('lib/bucketer')
const { isString, isObject } = require('lib/util/is-type')

// TODO validate Testingfile:
// * check for empty steps, variants etc!

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
  async activate({ userId, experimentId, stepId }, attributes) {
    await this.ready // TODO maybe store.experiments should return a promise?

    if (attributes) throw Error('not yet implemented')

    const experiment = store.experiments.find(e => e.id === experimentId)
    if (experiment == null) throw Error(`Experiment ${experimentId} not found`)
    const variant = bucketer.pickVariant(experiment, {
      distributionKey: userId,
      stepId
    })

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
    // in order to skip the iteration of experiments.

    // const res = await conversion.track(experimentId, variantId, userId, 'g1')
  }
}

// TODO: should it be supported to only give the eId, effectively tracking all
// goals?
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
