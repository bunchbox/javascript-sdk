const { isBoolean, isNumber, isObject } = require('lib/util/is-type')

const ecommerceDict = {
  orderSize: 'coz',
  orderId: 'coi',
  productIds: 'cpi'
}

const clientDict = {
  documentHeight: 'dh', // currently ignored
  documentWidth: 'dw', // currently ignored
  viewportWidth: 'bw',
  viewportHeight: 'bh',
  screenWidth: 'sw', // currently ignored
  screenHeight: 'sh', // currently ignored
  userAgent: 'ua',
  browser: 'uab', // Opera|Chrome|Safari|Firefox|IE11|Edge|...
  category: 'uac', // t|m|d
  os: 'uao', // Windows|Mac OS X|Linux|iOS|Android
  language: 'ln', // according to BCP 47 (same as navigator.language)
  referrer: 're',
  id: 'id', // some ObjectId; currently ignored (!)
  url: 'ur',
  city: 'gci',
  country: 'gco',
  countryCode: 'gcc',
  ip: 'gip'
}

const mainDict = {
  type: 't',
  experimentId: 'tex',
  participation: 'tpa',
  variantId: 'tva',
  conversionId: 'tco', // ObjectId
  goalId: 'tgo' // ObjectId
}

function encode(dict, params) {
  return Object.entries(params).reduce((acc, [key, value]) => {
    return dict[key] ? Object.assign(acc, { [dict[key]]: value }) : acc
  }, {})
}

module.exports.encodeMainParams = encode.bind(null, mainDict)

module.exports.encodeClientParams = encode.bind(null, clientDict)

module.exports.encodeEcommerceParams = encode.bind(null, ecommerceDict)

module.exports.encodeAttributes = attributes => {
  if (!isObject(attributes)) attributes = {}

  const at = Object.entries(attributes).map(([key, value]) => {
    let encodedValue

    if (Array.isArray(value)) {
      encodedValue = `a:${value.map(encodeURIComponent).join(',')}`
    } else if (isBoolean(value)) {
      encodedValue = '!:' + +value
    } else if (isNumber(value)) {
      encodedValue = '+:' + value
    } else {
      encodedValue = 's:' + encodeURI(value)
    }

    return encodeURI(`${key}=${encodedValue}`)
  })

  return { at }
}
