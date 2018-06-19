const querystring = require('querystring')

const request = require('lib/util/request')

const { createConversionPayload } = require('./payload')

const defaultOpts = {
  baseUrl: 'https://collector.bunchbox.co'
}

module.exports.track = async (
  accountId,
  experimentId,
  variantId,
  goalId,
  params,
  opts
) => {
  const { baseUrl, token } = Object.assign({}, defaultOpts, opts)

  const payload = createConversionPayload(
    experimentId,
    variantId,
    goalId,
    params
  )

  await request.post(
    `${baseUrl}/${accountId}`,
    querystring.stringify(payload),
    { token }
  )
}
