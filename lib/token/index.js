const CONFIG = {}

CONFIG.types = {
  RULE: 1,
  SEGMENT: 32,
  OPENING_BRACKET: 2,
  CLOSING_BRACKET: 4,
  AND: 8,
  OR: 16
}

CONFIG.typeGroups = {
  BRACKET: CONFIG.types.OPENING_BRACKET | CONFIG.types.CLOSING_BRACKET,
  OPERATOR: CONFIG.types.AND | CONFIG.types.OR,
  OPERAND: CONFIG.types.RULE | CONFIG.types.SEGMENT
}

CONFIG.evalutionReplacements = {
  2: '(',
  4: ')',
  8: ' && ',
  16: ' || '
}

module.exports.isRuleToken = token => token.type & CONFIG.types.RULE

module.exports.isSegmentToken = token => token.type & CONFIG.types.SEGMENT

module.exports.isNonOperand = token =>
  token.type & (CONFIG.typeGroups.BRACKET | CONFIG.typeGroups.OPERATOR)

module.exports.toStringReplacement = token =>
  CONFIG.evalutionReplacements[token.type]

module.exports.createOpenBracket = () => ({
  type: CONFIG.types.OPENING_BRACKET
})

module.exports.createClosingBracket = () => ({
  type: CONFIG.types.CLOSING_BRACKET
})
