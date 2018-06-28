const querystring = require('querystring')

const request = require('lib/util/request')

const { createPayload } = require('./payload')

const defaultOpts = {
  baseUrl: 'http://collector.bunchbox.local' // 'https://collector.bunchbox.co'
}

async function track(type, params = {}, opts = {}) {
  if (!['participation', 'conversion'].includes(type))
    throw Error(`type ${type} is not allowed`)

  // TODO assert required params

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
