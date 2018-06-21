const querystring = require('querystring')

const request = require('lib/util/request')

const { createPayload } = require('./payload')

const defaultOpts = {
  baseUrl: 'http://collector.bunchbox.local' // 'https://collector.bunchbox.co'
}

async function track(type, args, params = {}, opts = {}) {
  if (!['participation', 'conversion'].includes(type))
    throw Error(`type ${type} is not allowed`)

  const { baseUrl, token } = Object.assign({}, defaultOpts, opts)

  const payload = createPayload(type, args, params)

  await request.post(
    `${baseUrl}/${args.accountId}`,
    querystring.stringify(payload),
    { token }
  )
}

module.exports.trackConversion = async (args, params, opts) => {
  await track('conversion', args, params, opts)
}

module.exports.trackParticipation = async (args, params, opts) => {
  await track('participation', args, params, opts)
}
