require('./util/flatMap-polyfill')

const assert = require('assert')

const logger = require('./util/logger')
const { Failure } = require('./util/error')
const { isString, isNumber, isObject, isBoolean } = require('./util/is-type')
const timeout = require('./util/timeout')

const Store = require('./store')
const { api, collector } = require('./services')
const testing = require('./testing')

module.exports = class BunchboxSdk {
  /**
   * Creates a new instance of the Bunchbox SDK.
   *
   * During development it is recommended to reduce the log level to `debug`.
   *
   * @example
   *
   * const bb = new BunchboxSdk('$yourToken')
   *
   * @class BunchboxSdk
   * @param {string}   token                      the Bunchbox API token
   * @param {Object}   [opts]
   * @param {Boolean}  [opts.strict=true]         flag that controls how strict errors are handled
   * @param {Number}   [opts.timeout=5000]        timeout value (in milliseconds)
   * @param {Object}   [opts.logger]              all logging- related options
   * @param {Boolean}  [opts.logger.colors=true]  controls the color output
   * @param {string}   [opts.logger.level='info'] the supported levels are:<br>
   *                   - :trace - for very detailed debug-related messages<br>
   *                   - :debug - for debug-related messages<br>
   *                   - :info - for information of any kind<br>
   *                   - :warn - for warnings<br>
   *                   - :error - for errors
   *
   * @return {undefined}
   */
  constructor(token, opts = {}) {
    assert(isString(token), 'token must be a string')
    assert(isObject(opts), 'opts must be an object')

    opts = {
      host: 'bunchbox.co',
      strict: true,
      logger: { level: 'info' },
      timeout: 5000,
      ...opts
    }

    assert(isString(opts.host), 'opts.host must be a string')
    assert(isObject(opts.logger), 'opts.logger must be an object')
    assert(isBoolean(opts.strict), 'opts.strict must be a boolean')
    assert(isNumber(opts.timeout), 'opts.timeout must be a Number')

    this.token = token
    this.opts = opts
    this.store = new Store()

    logger.configure(opts.logger)

    this._loadTestingFile()
  }

  /**
   * Buckets visitor into a variant and sends participation event.
   *
   * If the referenced experiment has multiple steps an optional step index can
   * be given to skip the evaluation of the step targeting.
   *
   * Note: A given `clientId` will always be assigned to same variant of an
   * experiment.
   *
   * @example
   *
   * const bb = new BunchboxSdk('$yourToken')
   *
   * const variantId = await bb.activate({
   *   clientId: '43026325619819',
   *   experimentId: '5b475fb051ceab0190f68719'
   * })
   *
   * @param  {Object}        args
   * @param  {string}        args.clientId           the user id
   * @param  {string}        args.experimentId       the experiment id
   * @param  {number}        [args.stepIndex=null]   the step index
   * @param  {Object}        [params]                the (targeting) parameters
   *
   * @return {Promise<string|false>}  variation id
   */
  activate(args, params = {}) {
    assert(isObject(args), 'first argument must be an object')
    assert(isString(args.clientId), 'clientId must be a string')
    assert(isString(args.experimentId), 'experimentId must be a string')
    assert(
      isNumber(args.stepIndex) || args.stepIndex == null,
      'stepIndex must be a number'
    )
    assert(isObject(params), 'params must be an object')

    return timeout(
      () => this._doActivate(args, params),
      this.opts.timeout
    ).catch(err => this._handleFailure(err, args))
  }

  /**
   *
   * Sends a conversion event.
   *
   * For convenience neither the `experimentId` nor the `goalIdentifier` must be
   * present. If both arguments are omitted effectively all
   * experiments with all their goals are tracked. Passing in one or even both
   * parameter(s) limits the events being tracked accordingly.
   *
   * For example, passing in only an `experimentId` leads to all goals of the
   * respective experiment being tracked. On the other hand, passing in just a
   * `goalIdentifier` limits the result set to all experiments that have a goal
   * matching that identifier.
   *
   * @example
   *
   * const bb = new BunchboxSdk('$yourToken')
   *
   * await bb.track({ experimentId: '5b475fb051ceab0190f68719' })
   *
   * @param  {Object}    args
   * @param  {string}    args.clientId                the user id
   * @param  {string}    [arge.experimentId=null]     the experiment id
   * @param  {string}    [args.goalIdentifier=null]   the goal identifier
   * @param  {Object}    [params]                     the (targeting) parameters
   *
   * @return {Promise<Boolean>} the result
   */
  track(args, params = {}) {
    assert(isObject(args), 'first argument must be an object')
    assert(isString(args.clientId), 'clientId must be a string')
    assert(
      isString(args.experimentId) || args.experimentId == null,
      'experimentId must be a string'
    )
    assert(
      isString(args.goalIdentifier) || args.goalIdentifier == null,
      'goalIdentifier must be a number'
    )
    assert(isObject(params), 'params must be an object')

    return timeout(() => this._doTrack(args, params), this.opts.timeout).catch(
      err => this._handleFailure(err, args)
    )
  }

  /**
   * Triggers a reload of the testing file.
   *
   * @example
   *
   * const bb = new BunchboxSdk('$yourToken')
   * bb.reloadTestingFile()
   *
   * @return {undefined}
   */
  reloadTestingFile() {
    this._loadTestingFile()
  }

  // private

  async _doActivate({ clientId, experimentId, stepIndex }, params) {
    await this.ready

    const experiment = this.store.findExperiments(
      { experimentId },
      { single: true }
    )

    if (experiment == null)
      throw new Failure(`Experiment with id '${experimentId}' not found`)

    const variant = testing.assignUser(experiment, stepIndex, clientId, params)
    if (!variant) return false

    await collector.trackParticipation( { ...params, variantId: variant.id, experimentId, clientId, accountId: this.store.account }, this.opts)

    return {
      id: variant.id,
      name: variant.name
    }
  }

  async _doTrack({ experimentId, clientId, goalIdentifier }, params) {
    await this.ready

    let payloads = []
    let experiments = []
    let errorMsg

    if (goalIdentifier == null) {
      if (experimentId == null) {
        experiments = this.store.experiments
        errorMsg = 'No experiments found'
      } else {
        experiments = this.store.findExperiments({ experimentId })
        errorMsg = `No experiments found for experimentId ${experimentId}`
      }

      payloads = experiments.flatMap(e =>
        e.goals.map(g => ({ experiment: e, goal: g }))
      )
    } else {
      if (experimentId == null) {
        experiments = this.store.findExperiments({ goalIdentifier })
        errorMsg = `No experiments found with goalIdentifier ${goalIdentifier}`
      } else {
        experiments = this.store.findExperiments({ experimentId })
        errorMsg = `No experiments found for experimentId ${experimentId}`
      }

      payloads = experiments.map(e => {
        const goal = e.goals.find(g => g.identifier === goalIdentifier)
        return { experiment: e, goal }
      })
    }

    if (experiments.length === 0) {
      throw new Failure(errorMsg)
    }

    payloads = payloads.filter(({ goal }) => goal != null && goal.active)

    if (payloads.length === 0) {
      const data = []

      if (experimentId != null) {
        data.push(`for experimentId '${experimentId}'`)
      }

      if (goalIdentifier != null) {
        data.push(`with goalIdentifier '${goalIdentifier}'`)
      }

      throw new Failure(`No (active) goals found ${data.join(' ')}`)
    }

    await trackConversions(
      payloads,
      { ...params, accountId: this.store.account, clientId },
      this.opts
    )

    return true
  }

  async _loadTestingFile() {
    this.ready = new Promise((resolve, reject) => {
      const fetch = (failures = 0) => {
        if (failures > 14)
          return reject(Error('Could not fetch the testing file'))

        api
          .fetchTestingFile(this.token, this.opts)
          .then(testingFile => this.store.setTestingFile(testingFile))
          .then(() => {
            logger[failures < 1 ? 'debug' : 'info']('Fetched Testing File', {
              failures
            })

            resolve()
          })
          .catch(err => {
            if (!(err instanceof Failure)) return reject(err)
            const backoff = Math.pow(2, failures)
            logger.warn(`Fetching failed Retrying in ${backoff}s`, { err })
            setTimeout(() => fetch(failures + 1), backoff * 1000)
          })
      }

      fetch()
    })
  }

  _handleFailure(failure, args) {
    if (failure instanceof Failure && !this.opts.strict) {
      logger.error(failure.toString(), args)
      return false
    }

    throw failure
  }
}

async function trackConversions(payloads, params, opts) {
  return Promise.all(
    payloads.map(({ experiment, goal }) => {
      const variant = testing.assignUser(
        experiment,
        null,
        params.clientId,
        params
      )
      if (!variant) return false

      return collector.trackConversion(
        {
          ...params,
          experimentId: experiment.id,
          variantId: variant.id,
          goalId: goal.id
        },
        opts
      )
    })
  )
}
