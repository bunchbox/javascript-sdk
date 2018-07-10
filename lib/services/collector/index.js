const assert = require('assert')
const querystring = require('querystring')

const request = require('lib/util/request')
const logger = require('lib/util/logger')
const { isObject } = require('lib/util/is-type')

const { createPayload } = require('./payload')

const defaultOpts = {
  baseUrl: 'http://collector.bunchbox.local' // 'https://collector.bunchbox.co'
}

async function track(type, params = {}, opts = {}) {
  assert(isObject(params), 'params must be an object')
  assert(isObject(opts), 'opts must be an object')

  const { baseUrl, token } = Object.assign({}, defaultOpts, opts)

  const url = `${baseUrl}/${params.accountId}`
  const payload = createPayload(type, params)

  logger.debug(`Tracking ${type}`, { url, payload })

  await request.post(url, querystring.stringify(payload), { token })
}

module.exports.trackConversion = async (params, opts) => {
  await track('conversion', params, opts)
}

module.exports.trackParticipation = async (params, opts) => {
  await track('participation', params, opts)
}
