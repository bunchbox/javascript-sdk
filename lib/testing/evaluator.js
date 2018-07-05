const { isString, isNumber, isObject } = require('lib/util/is-type')
const dotize = require('lib/util/dotize')

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
  // TODO implicit contract 2 -> query parameter
  referrerParameters: 2,
  urlParameters: 2
}

const isCustomAttributeKey = key => KEYS[key] == null
module.exports.isCustomAttributeKey = isCustomAttributeKey

const isQueryParameter = key => KEYS[key] === 2
module.exports.isQueryParameter = isQueryParameter

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

  const { key } = condition
  let { value, comparator } = condition

  let matches = false
  let invert = false

  if (OPPOSITES[comparator] != null) {
    comparator = OPPOSITES[comparator]
    invert = true
  }

  // TODO should be done in initDefaultParams!
  for (const key of [
    'attributes',
    'device',
    'geo',
    'referrerParameters',
    'urlParameters'
  ])
    if (!isObject(params[key])) params[key] = {}

  const comparatee = dotize.find(params, key)

  switch (comparator) {
    case 'exists':
      matches = comparatee != null
      value = ''
      break
    case 'regex':
      matches = new RegExp(value).test(comparatee)
      break
    case 'equals':
      matches = String(value) === String(comparatee)
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
