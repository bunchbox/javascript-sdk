const generateObjectId = require('lib/util/object-id')

const {
  encodeAttributes,
  encodeEcommerceParams,
  encodeClientParams,
  encodeMainParams
} = require('./encoder')

// The userId acts as identifier for the participation. Users of the SDK should
// probably use some kind of Session Identifier as `userId` in order to allow
// multiple conversions per actual user. Otherwise, only the first conversion
// is used (although succeeding converson are recorded as well).
module.exports.createPayload = (
  type,
  { userId, experimentId, variantId, goalId },
  params
) => {
  const encodedEcommerceParams = encodeEcommerceParams(params.ecommerce || {})
  const encodedClientParams = encodeClientParams(params.client || {})
  const encodedAttributes = encodeAttributes(params.attributes || {})

  const id = generateObjectId() // TODO is still required by the collector
  const conversionId = generateObjectId()

  const mainParams = encodeMainParams({
    id,
    type,
    userId,
    conversionId,
    experimentId,
    variantId,
    goalId
  })

  const now = new Date()

  return Object.assign(
    mainParams,
    encodedClientParams,
    encodedEcommerceParams,
    encodedAttributes,
    {
      v: 2,
      tn: +now,
      tz: +now.getTimezoneOffset() / 60
    }
  )
}
