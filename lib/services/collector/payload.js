const generateObjectId = require('lib/util/object-id')

const {
  encodeAttributes,
  encodeEcommerceParams,
  encodeParams,
  encodeMainParams
} = require('./encoder')

// The userId acts as identifier for the participation. Users of the SDK should
// probably use some kind of Session Identifier as `userId` in order to allow
// multiple conversions per actual user. Otherwise, only the first conversion
// is used (although succeeding converson are recorded as well).

module.exports.createPayload = (type, params) => {
  const encodedEcommerceParams = encodeEcommerceParams(params.ecommerce || {})
  const encodedAttributes = encodeAttributes(params.attributes || {})
  const encodedParams = encodeParams(params)

  const id = generateObjectId()
  const conversionId = generateObjectId()

  const mainParams = encodeMainParams(
    Object.assign(params, { id, type, conversionId })
  )

  const now = new Date()

  return Object.assign(
    mainParams,
    encodedParams,
    encodedEcommerceParams,
    encodedAttributes,
    {
      v: 2,
      tn: +now,
      tz: +now.getTimezoneOffset() / 60
    }
  )
}
