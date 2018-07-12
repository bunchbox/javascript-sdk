/**
 * Takes 2 numbers and returns their sum.
 *
 *
 * @param   {number} a the first number
 * @param   {number} b the second number
 *
 * @returns {number} the sum of a and b
 */
const KEYS = {
  'device.browser': 1,
  'device.category': 1,
  'device.os': 1,
  'device.viewportHeight': 1,
  'device.viewportWidth': 1,
  'geo.city': 1,
  'geo.country': 1,
  'geo.countryCode': 1,
  'geo.ip': 1,
  browserLanguage: 1,
  cookie: 1,
  hour: 1,
  referrer: 1,
  url: 1,
  userAgent: 1,
  weekday: 1,
  referrerParameters: 2,
  urlParameters: 2
}

module.exports.isCustomAttributeKey = key => KEYS[key] == null

module.exports.isQueryParameter = key => KEYS[key] === 2
