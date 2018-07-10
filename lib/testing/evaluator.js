const dotize = require('lib/util/dotize')
const logger = require('lib/util/logger')
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

module.exports.isRuleToken = token => token.type & CONFIG.token.types.RULE

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
    logger.error('Eval failed', { err })
  }

  return false
}
