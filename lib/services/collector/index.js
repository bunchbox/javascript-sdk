const assert = require('assert')
const querystring = require('querystring')

const { Failure } = require('../../util/error')
const request = require('../../util/request')
const logger = require('../../util/logger')
const { isObject } = require('../../util/is-type')

const { createPayload } = require('./payload')

async function track(type, params = {}, opts = {}) {
  assert(isObject(params), 'params must be an object')
  assert(isObject(opts), 'opts must be an object')

  const { proto, host, token } = {
    proto: 'https',
    host: 'bunchbox.local',
    ...opts
  }

  const url = `${proto}://collector.${host}/${params.accountId}`
  const payload = createPayload(type, params)

  logger.debug(`Tracking ${type}`, { url, payload })

  await request
    .post(url, querystring.stringify(payload), { token })
    .catch(err => {
      // If an error occurs here, it's pretty much guaranteed to be
      // non-critical / temporarily. Hence the conversion to a `Failure`.
      throw Failure.fromError(err)
    })
}

module.exports.trackConversion = async (params, opts) => {
  await track('conversion', params, opts)
}

module.exports.trackParticipation = async (params, opts) => {
  await track('participation', params, opts)
}
