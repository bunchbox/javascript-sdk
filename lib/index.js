require('rootpath')()

const api = require('lib/services/api')
const collector = require('lib/services/collector')
const store = require('lib/store')
const testing = require('lib/testing')
const { isString, isObject } = require('lib/util/is-type')

// # TODO
//
// ## BunchboxSdk.track/4
//
// * Implement
//
// ## Error Handling
//
// * Rename Error -> BunchboxError OR wrap all SDK errors and output a BunchboxSdkError
// * differentiate between non-recoverable Errors and Option::None responses
// * Retry if fetching of the testing file fails; block public methods in the meantime
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
// ## Webhooks
//
// * "Subscribe" to changes via Webhooks
//
// ## Documentation
//
// * Write documentation for public / top level methods methods
// * Update README
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

    const experiment = this.store.findOneExperimentById(experimentId)
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
   *
   * Sends conversion event.
   *
   * For convenience  the SDK user does not need to pass the experimentId.
   * Instead all experiments of the account are filtered by goalIdentifier.
   * Then, it is checked which variant the userId would be bucketed into.
   *
   * Note: optionally, it should be possible to directly give an experimentId
   * in order to skip the iteration of experiments. Also, it should be possible
   * to only pass the eId, effectively tracking all goals.
   *
   * @param  {string} eventKey
   * @param  {string} userId
   * @param  {string} attributes
   * @param  {Object} eventTags Values associated with the event.
   */
  async track({ experimentId, userId, goalIdentifier }, params) {
    await this.ready

    let payloads = []

    // Poor man's pattern matching :/
    switch ([experimentId == null, goalIdentifier == null].join(' ')) {
      case 'true false': {
        payloads = this.store
          .findExperimentsByGoalIdentifier(goalIdentifier)
          .map(e => {
            return {
              accountId: this.store.account,
              experimentId: e.id,
              variantId: testing.assignUser(e, null, userId, params).id,
              goalId: e.goals.find(g => g.identifier === goalIdentifier).id,
              userId
            }
          })

        if (payloads.length === 0)
          throw Error(`No experiment found for ${goalIdentifier}`)

        break
      }
      case 'false false': {
        const e = this.store.findOneExperimentById(experimentId)
        if (e == null) throw Error(`Experiment ${experimentId} not found`)

        const goalId = (() => {
          const goal = e.goals.find(g => g.identifier === goalIdentifier)
          if (goal == null)
            throw Error(
              `Experiment ${experimentId} has no goal with ${goalIdentifier}`
            )
          return goal.id
        })()

        const variantId = testing.assignUser(e, null, userId, params).id
        const accountId = this.store.account

        payloads = [{ accountId, experimentId, variantId, goalId, userId }]

        if (payloads.length === 0)
          throw Error(`No experiment found for ${goalIdentifier}`)

        break
      }
      case 'false true': {
        const p = []

        for (let e of this.store.experiments) {
          for (let g of e.goals.filter(g => g.active === true)) {
            p.push({
              accountId: this.store.account,
              experimentId: e.id,
              variantId: testing.assignUser(e, null, userId, params).id,
              goalId: g.id,
              userId
            })
          }
        }

        payloads = p
        break
      }
      default:
        throw Error('Expected at least goalIdentifier or experimentId')
    }

    return Promise.all(payloads.map(p => collector.trackConversion(p)))
  }
}
