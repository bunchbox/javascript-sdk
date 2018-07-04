const { isString, isNumber, isObject } = require('lib/util/is-type')

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
  referrerParameters: 1,
  url: 1,
  urlParameters: 1,
  userAgent: 1,
  weekday: 1
}

module.exports.isCustomAttributeKey = key => KEYS[key] == null

const CONFIG = {
  token: {
    types: {
      RULE: 1,
      OPENING_BRACKET: 2,
      CLOSING_BRACKET: 4,
      AND: 8,
      OR: 16
    },
    typeGroups: {
      BRACKET: 6,
      OPERATOR: 24,
      NOT_RULE: 30
    },
    evalutionReplacements: {
      2: '(',
      4: ')',
      8: ' && ',
      16: ' || '
    }
  }
}

const OPPOSITES = {
  notRegex: 'regex',
  doesNotEqual: 'equals',
  doesNotContain: 'contains',
  doesNotBegin: 'begins',
  doesNotEnd: 'ends',
  doesNotExist: 'exists',
  listDoesNotContain: 'listContains'
}

function evaluateRule(rule, params) {
  const validConditions = rule.conditions.reduce((acc, condition) => {
    return evaluateCondition(condition, params) ? acc + 1 : acc
  }, 0)

  return rule.match === 'all'
    ? validConditions == rule.conditions.length
    : validConditions > 0
}

function evaluateCondition(condition, params) {
  condition = Object.assign({}, condition) // Avoid accidental mutations
  params = Object.assign({}, params)

  const { key, parameter } = condition
  let { value, comparator } = condition

  let comparatee = null
  let matches = false
  let invert = false

  if (OPPOSITES[comparator] != null) {
    comparator = OPPOSITES[comparator]
    invert = true
  }

  for (const key of [
    'attributes',
    'device',
    'geo',
    'referrerParameters',
    'urlParameters'
  ])
    if (!isObject(params[key])) params[key] = {}

  switch (key) {
    case 'cookie':
      comparatee = params.cookie
      break
    case 'url':
      comparatee = params.url
      break
    case 'referrer':
      comparatee = params.referrer
      break
    case 'urlParameters': {
      let _urlParam = params.urlParameters[parameter]
      if (_urlParam === null) _urlParam = ''
      comparatee = _urlParam
      break
    }
    case 'referrerParameters': {
      let _refParam = params.referrerParameters[parameter]
      if (_refParam === null) _refParam = ''
      comparatee = _refParam
      break
    }
    case 'device.os':
      comparatee = params.device.os
      break
    case 'device.browser':
      comparatee = params.device.browser
      break
    case 'device.category':
      comparatee = params.device.category
      break
    case 'device.viewportHeight':
      comparatee = params.device.viewportHeight
      break
    case 'device.viewportWidth':
      comparatee = params.device.viewportWidth
      break
    case 'userAgent':
      comparatee = params.userAgent
      break
    case 'browserLanguage':
      comparatee = params.browserLanguage
      break
    case 'geo.ip':
      comparatee = params.geo.ip
      break
    case 'geo.countryCode':
      comparatee = params.geo.countryCode
      break
    case 'geo.city':
      comparatee = params.geo.city
      break
    case 'geo.country':
      comparatee = params.geo.country
      break
    case 'weekday':
      comparatee = params.weekday
      value = String(value)
      break
    case 'hour':
      comparatee = params.hour
      value = String(value)
      break
    default:
      comparatee = params.attributes[key]
  }

  switch (comparator) {
    case 'exists':
      matches = comparatee != null
      value = ''
      break
    case 'regex':
      matches = new RegExp(value).test(comparatee)
      break
    case 'equals':
      matches = value === String(comparatee)
      break
    case 'contains':
      matches =
        isString(comparatee) &&
        comparatee.toLowerCase().indexOf(String(value).toLowerCase()) !== -1
      break
    case 'begins':
      matches =
        isString(comparatee) &&
        comparatee.toLowerCase().substr(0, value.length) ===
          String(value).toLowerCase()
      break
    case 'ends':
      matches =
        isString(comparatee) &&
        comparatee.toLowerCase().substr(-value.length) ===
          String(value).toLowerCase()
      break
    case 'isTrue':
      matches = comparatee === true
      value = ''
      break
    case 'isFalse':
      matches = comparatee === false
      value = ''
      break
    case 'isGreater':
      matches = isNumber(comparatee) && comparatee > +value
      break
    case 'isLess':
      matches = isNumber(comparatee) && comparatee < +value
      break
    case 'isGreaterOrEqual':
      matches = isNumber(comparatee) && comparatee >= +value
      break
    case 'isLessOrEqual':
      matches = isNumber(comparatee) && comparatee <= +value
      break
    case 'listContains':
      matches = Array.isArray(comparatee) && comparatee.indexOf(value) !== -1
      break
    case 'listSizeIsGreater':
      matches = Array.isArray(comparatee) && comparatee.length > +value
      break
    case 'listSizeIsLess':
      matches = Array.isArray(comparatee) && comparatee.length < +value
      break
    case 'listSizeIsGreaterOrEqual':
      matches = Array.isArray(comparatee) && comparatee.length >= +value
      break
    case 'listSizeIsLessOrEqual':
      matches = Array.isArray(comparatee) && comparatee.length <= +value
      break
  }

  if (invert) {
    matches = !matches
  }

  return matches
}

module.exports.formula = (tokens, params, strict) => {
  params = params || {}

  if (tokens == null || tokens.length === 0) {
    return !strict
  }

  const evaluatee = tokens.map(token => {
    const type = token.type

    if (type & CONFIG.token.types.RULE) {
      return evaluateRule(token.rule, params)
    }

    if (type & CONFIG.token.typeGroups.NOT_RULE) {
      return CONFIG.token.evalutionReplacements[type]
    }
  })

  try {
    return eval('(' + evaluatee.join('') + ');')
  } catch (err) {
    console.error(err)
  }

  return false
}
