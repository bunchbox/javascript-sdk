const { isString, isNumber } = require('lib/util/is-type')

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
  const key = condition['key'] || condition['k']
  const parameter = condition['parameter'] || condition['p']
  const attribute = condition['attribute'] || condition['a']

  let value = condition['value'] || condition['v']
  let comparator = condition['comparator'] || condition['c']

  let comparatee = null
  let matches = false
  let invert = false

  if (OPPOSITES[comparator] != null) {
    comparator = OPPOSITES[comparator]
    invert = true
  }

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
      let _refParam = params.refParameters[parameter]
      if (_refParam === null) _refParam = ''
      comparatee = _refParam
      break
    }
    case 'device.os':
      comparatee = params.os
      break
    case 'device.browser':
      comparatee = params.browser
      break
    case 'device.category':
      comparatee = params.category
      break
    case 'device.viewportHeight':
      comparatee = params.viewportHeight
      break
    case 'device.viewportWidth':
      comparatee = params.viewportWidth
      break
    case 'userAgent':
      comparatee = params.userAgent
      break
    case 'browserLanguage':
      comparatee = params.language
      break
    case 'geo.ip':
      comparatee = params.ip
      break
    case 'geo.countryCode':
      comparatee = params.countryCode
      break
    case 'geo.city':
      comparatee = params.city
      break
    case 'geo.country':
      comparatee = params.country
      break
    case 'weekday':
      comparatee = params.weekday
      break
    case 'hour':
      comparatee = params.hour
      break
    default:
      if (attribute && params.attributes) {
        comparatee = params.attributes[key]
      }
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

module.exports.formula = function(tokens, params, strict) {
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

  let result = false

  try {
    result = eval('(' + evaluatee.join('') + ');')
  } catch (err) {
    console.error(err)
  }

  return result
}
