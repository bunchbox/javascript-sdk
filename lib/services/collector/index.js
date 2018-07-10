const assert = require('assert')
const querystring = require('querystring')

const request = require('lib/util/request')
const { isObject } = require('lib/util/is-type')

const { createPayload } = require('./payload')

const defaultOpts = {
  baseUrl: 'http://collector.bunchbox.local' // 'https://collector.bunchbox.co'
}

async function track(type, params = {}, opts = {}) {
  assert(isObject(params), 'params must be an object')
  assert(isObject(opts), 'opts must be an object')

  const { baseUrl, token } = Object.assign({}, defaultOpts, opts)

  const payload = createPayload(type, params)

  await request.post(
    `${baseUrl}/${params.accountId}`,
    querystring.stringify(payload),
    { token }
  )
}

module.exports.trackConversion = async (params, opts) => {
  await track('conversion', params, opts)
}

module.exports.trackParticipation = async (params, opts) => {
  await track('participation', params, opts)
}
