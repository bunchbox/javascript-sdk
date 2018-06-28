require('rootpath')()

require('lib/util/flatMap-polyfill')

const api = require('lib/services/api')
const collector = require('lib/services/collector')
const store = require('lib/store')
const testing = require('lib/testing')
const { isString, isObject } = require('lib/util/is-type')

// # TODO
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
// * all goals are active (?)
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

    // Fetch the testing file with exponential backoff
    this.ready = new Promise((resolve, reject) => {
      const fetch = (failures = 0) => {
        if (failures > 14)
          return reject(Error('Could not fetch the testing file'))

        api
          .fetchTestingFile(token)
          .then(testingFile => this.store.setState(testingFile))
          .then(() => {
            if (failures > 0)
              console.log(`Fetching succeeded after ${failures} retries`)
            resolve()
          })
          .catch(err => {
            const backoff = Math.pow(2, failures)

            console.warn(
              'An error oucrred when fetching the testing file:\n' +
                `${err}\n` +
                `Retrying in ${backoff}s`
            )

            setTimeout(() => fetch(failures + 1), backoff * 1000)
          })
      }

      fetch()
    })
  }

  /**
   * Buckets visitor and sends impression event.
   * @param  {string}      experimentKey
   * @param  {string}      userId
   * @param  {Object}      attributes
   * @return {string|null} variation key
   */

  async activate({ userId, experimentId, stepIndex }, params = {}) {
    await this.ready

    const experiments = this.store.findExperiments({ experimentId })
    if (experiments.length != 1)
      throw Error(`Experiment ${experimentId} not found`)
    const experiment = experiments[0]

    const { id: variantId } = testing.assignUser(
      experiment,
      stepIndex,
      userId,
      params
    )

    await collector.trackParticipation(
      Object.assign(params, {
        variantId,
        experimentId,
        userId,
        accountId: this.store.account
      })
    )

    return variantId
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

    if (goalIdentifier == null) {
      const experiments =
        experimentId == null
          ? this.store.experiments
          : this.store.findExperiments({ experimentId })

      payloads = experiments.flatMap(e =>
        e.goals.map(g => ({ experiment: e, goal: g }))
      )
    } else {
      const experiments =
        experimentId == null
          ? this.store.findExperiments({ goalIdentifier })
          : this.store.findExperiments({ experimentId })

      payloads = experiments.map(e => {
        const goal = e.goals.find(g => g.identifier === goalIdentifier)
        return { experiment: e, goal }
      })
    }

    payloads = payloads.filter(({ goal }) => goal.active)

    if (payloads.length === 0)
      throw Error(`No experiment found for ${experimentId} ${goalIdentifier}`)

    return trackConversions(
      payloads,
      Object.assign(params, { accountId: this.store.account, userId })
    )
  }
}

async function trackConversions(payloads, params) {
  return Promise.all(
    payloads.map(({ experiment, goal }) => {
      const variant = testing.assignUser(
        experiment,
        null,
        params.userId,
        params
      )

      return collector.trackConversion(
        Object.assign(params, {
          experimentId: experiment.id,
          variantId: variant.id,
          goalId: goal.id
        })
      )
    })
  )
}
