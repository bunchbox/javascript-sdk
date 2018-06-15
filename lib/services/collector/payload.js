const assert = require('assert')

const generateObjectId = require('lib/util/object-id')
const { isObject } = require('lib/util/is-type')

const {
  encodeAttributes,
  encodeEcommerceParams,
  encodeClientParams,
  encodeMainParams
} = require('./encoder')

module.exports.createConversionPayload = (
  experimentId,
  variantId,
  goalId,
  params
) => {
  const encodedEcommerceParams = encodeEcommerceParams(params.ecommerce || {})
  const encodedClientParams = encodeClientParams(params.client || {})
  const encodedAttributes = encodeAttributes(params.attributes || {})

  const conversionId = generateObjectId()

  const mainParams = encodeMainParams({
    type: 'conversion',
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
