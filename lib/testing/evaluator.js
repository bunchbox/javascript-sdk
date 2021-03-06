const dotize = require('../util/dotize')
const logger = require('../util/logger')
const { isString, isNumber } = require('../util/is-type')
const { simplifyUrl } = require('./url')

const {
  isRuleToken,
  isSegmentToken,
  isNonOperand,
  toStringReplacement
} = require('../token')

const OPPOSITES = {
  notRegex: 'regex',
  doesNotEqual: 'equals',
  doesNotContain: 'contains',
  doesNotBegin: 'begins',
  doesNotEnd: 'ends',
  doesNotExist: 'exists',
  listDoesNotContain: 'listContains',
  doesNotSimpleMatch: 'simpleMatches'
}

function buildComparator(comparator) {
  switch (comparator) {
    case 'exists':
      return comparatee => comparatee != null
    case 'regex':
      return (comparatee, value) => new RegExp(value).test(comparatee)
    case 'equals':
      return (comparatee, value) => String(value) === String(comparatee)
    case 'contains':
      return (comparatee, value) =>
        isString(comparatee) &&
        comparatee.toLowerCase().indexOf(String(value).toLowerCase()) !== -1
    case 'begins':
      return (comparatee, value) =>
        isString(comparatee) &&
        comparatee.toLowerCase().substr(0, value.length) ===
          String(value).toLowerCase()
    case 'ends':
      return (comparatee, value) =>
        isString(comparatee) &&
        comparatee.toLowerCase().substr(-value.length) ===
          String(value).toLowerCase()
    case 'isTrue':
      return comparatee => comparatee === true
    case 'isFalse':
      return comparatee => comparatee === false
    case 'isGreater':
      return (comparatee, value) => isNumber(comparatee) && comparatee > +value
    case 'isLess':
      return (comparatee, value) => isNumber(comparatee) && comparatee < +value
    case 'isGreaterOrEqual':
      return (comparatee, value) => isNumber(comparatee) && comparatee >= +value
    case 'isLessOrEqual':
      return (comparatee, value) => isNumber(comparatee) && comparatee <= +value
    case 'listContains':
      return (comparatee, value) =>
        Array.isArray(comparatee) && comparatee.indexOf(value) !== -1
    case 'listSizeIsGreater':
      return (comparatee, value) =>
        Array.isArray(comparatee) && comparatee.length > +value
    case 'listSizeIsLess':
      return (comparatee, value) =>
        Array.isArray(comparatee) && comparatee.length < +value
    case 'listSizeIsGreaterOrEqual':
      return (comparatee, value) =>
        Array.isArray(comparatee) && comparatee.length >= +value
    case 'listSizeIsLessOrEqual':
      return (comparatee, value) =>
        Array.isArray(comparatee) && comparatee.length <= +value
    case 'simpleMatches':
      return (comparatee, value) =>
        simplifyUrl(String(value)) === simplifyUrl(String(comparatee))

    default:
      throw Error(`Unkown comparator: ${comparator}`)
  }
}

function evaluateCondition(condition, params) {
  const comparatee = dotize.find(params, condition.key)

  const invert = OPPOSITES[condition.comparator] != null

  const comparator = invert
    ? OPPOSITES[condition.comparator]
    : condition.comparator

  const matches = buildComparator(comparator)(comparatee, condition.value)

  return invert ? !matches : matches
}

function evaluateRule(rule, params) {
  return rule.conditions[rule.match === 'all' ? 'every' : 'some'](condition =>
    evaluateCondition(condition, params)
  )
}

module.exports.formula = (tokens, params = {}, strict) => {
  if (tokens == null || tokens.length === 0) {
    return !strict
  }

  const evaluatee = tokens.map(token => {
    if (isRuleToken(token)) {
      return evaluateRule(token.rule, params)
    }

    if (isNonOperand(token)) {
      return toStringReplacement(token)
    }

    if (isSegmentToken(token)) {
      throw Error('Segments must be inlinend')
    }
  })

  try {
    return eval('(' + evaluatee.join('') + ');')
  } catch (err) {
    logger.error('Eval failed', { err })
  }

  return false
}
