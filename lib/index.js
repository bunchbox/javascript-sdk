require('rootpath')()

require('lib/util/flatMap-polyfill')

const assert = require('assert')

const api = require('lib/services/api')
const collector = require('lib/services/collector')
const Store = require('lib/store')
const testing = require('lib/testing')
const { isString, isNumber, isObject, isBoolean } = require('lib/util/is-type')
const { Failure, BunchboxError } = require('lib/util/error')

// # TODO
//
// * What happens with  Conversions requests for which no previous
//   Participation requests were send?
//
// ## Error Handling
//
// * Rename Error -> BunchboxError OR wrap all SDK errors and output a BunchboxError
// * differentiate between non-recoverable Errors and Option::None responses
//
// ## Logging
//
// * Add logging statements
// * Log when DEBUG=true or something
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
    assert(isString(token), 'token must be a string')
    assert(isObject(opts), 'opts must be an object')

    opts = Object.assign({ host: 'bunchbox.co', strict: false }, opts)

    assert(isString(opts.host), 'opts.host must be a string')
    assert(isBoolean(opts.strict), 'opts.strict must be a boolean')

    this.opts = opts
    this.store = new Store()

    // Fetch the testing file with exponential backoff
    this.ready = new Promise((resolve, reject) => {
      const fetch = (failures = 0) => {
        if (failures > 14)
          return reject(Error('Could not fetch the testing file'))

        api
          .fetchTestingFile(token)
          .then(testingFile => this.store.setTestingFile(testingFile))
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

  activate(args, params = {}) {
    assert(isObject(args), 'first argument must be an object')
    assert(isString(args.userId), 'userId must be a string')
    assert(isString(args.experimentId), 'experimentId must be a string')
    assert(
      isNumber(args.stepIndex) || args.stepIndex == null,
      'stepIndex must be a number'
    )
    assert(isObject(params), 'params must be an object')

    return this._doActivate(args, params).catch(this._handleFailure.bind(this))
  }

  async _doActivate({ userId, experimentId, stepIndex }, params) {
    await this.ready

    const experiment = this.store.findExperiments(
      { experimentId },
      { single: true }
    )

    if (experiment == null)
      throw new Failure(`Experiment ${experimentId} not found`)

    const variant = testing.assignUser(experiment, stepIndex, userId, params)

    await collector.trackParticipation(
      Object.assign(params, {
        variantId: variant.id,
        experimentId,
        userId,
        accountId: this.store.account
      })
    )

    return variant.id
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
  track(args, params = {}) {
    assert(isObject(args), 'first argument must be an object')
    assert(isString(args.userId), 'userId must be a string')
    assert(
      isString(args.experimentId) || args.experimentId == null,
      'experimentId must be a string'
    )
    assert(
      isNumber(args.goalIdentifier) || args.stepIndex == null,
      'stepIndex must be a number'
    )
    assert(isObject(params), 'params must be an object')

    return this._doTrack(args, params).catch(this._handleFailure.bind(this))
  }

  async _doTrack({ experimentId, userId, goalIdentifier }, params) {
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
      throw new Failure(
        `No experiment found for ${experimentId} ${goalIdentifier}`
      )

    return trackConversions(
      payloads,
      Object.assign(params, { accountId: this.store.account, userId })
    )
  }

  _handleFailure(failure) {
    if (failure instanceof Failure && !this.opts.strict) {
      console.error(failure.toString()) // TODO use proper logger w/ metadata (userId, params)
      return false
    }

    throw BunchboxError.fromError(failure)
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
