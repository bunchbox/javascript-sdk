const { isBoolean, isNumber, isObject } = require('lib/util/is-type')
const dotize = require('lib/util/dotize')

const ECOMMERCE_DICT = {
  orderSize: 'coz',
  orderId: 'coi',
  productIds: 'cpi'
}

const PARAMS_DICT = {
  'device.browser': 'uab', // Opera|Chrome|Safari|Firefox|IE11|Edge|...
  'device.category': 'uac', // t|m|d
  'device.os': 'uao', // Windows|Mac OS X|Linux|iOS|Android
  'device.viewportHeight': 'bh',
  'device.viewportWidth': 'bw',
  'geo.city': 'gci',
  'geo.country': 'gco',
  'geo.countryCode': 'gcc',
  'geo.ip': 'gip',
  documentHeight: 'dh', // currently ignored
  documentWidth: 'dw', // currently ignored
  browserLanguage: 'ln', // according to BCP 47 (same as navigator.language)
  referrer: 're',
  screenHeight: 'sh', // currently ignored
  screenWidth: 'sw', // currently ignored
  url: 'ur',
  userAgent: 'ua'
}

const MAIN_DICT = {
  type: 't',
  id: 'id', // some ObjectId; currently ignored (!) but required
  experimentId: 'tex',
  userId: 'u',
  variantId: 'tva',
  conversionId: 'tco', // ObjectId
  goalId: 'tgo' // ObjectId
}

function encode(dict, params) {
  return Object.entries(dotize.convert(params)).reduce((acc, [key, value]) => {
    return dict[key] ? Object.assign(acc, { [dict[key]]: value }) : acc
  }, {})
}

module.exports.encodeEcommerceParams = encode.bind(null, ECOMMERCE_DICT)
module.exports.encodeMainParams = encode.bind(null, MAIN_DICT)
module.exports.encodeParams = encode.bind(null, PARAMS_DICT)

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
