const immutable = require('immutable')

const { validateTestingFile } = require('./validator')
const { normalizeCondtion } = require('../testing')

const {
  isRuleToken,
  isSegmentToken,
  createOpenBracket,
  createClosingBracket
} = require('../token')

module.exports = class Store {
  constructor() {
    this.account = null

    this._experiments = immutable.List()
    this._rules = immutable.Map()
    this._segments = immutable.Map()

    this._cache = null
  }

  // Getter

  get experiments() {
    return (
      this._cache ||
      (() => {
        const experiments = this._experiments.toJS().map(e => {
          const targeting = this._populateTokens(e.targeting)

          const steps = e.steps.map(step => {
            const tokens = this._populateTokens(step.tokens)
            return { ...step, tokens }
          })

          return { ...e, targeting, steps }
        })

        this._cache = experiments

        return experiments
      })()
    )
  }

  get rules() {
    return this._rules.toJS()
  }

  get segments() {
    return this._segments.toJS()
  }

  // Setter

  set experiments(data) {
    this._flushCache()

    this._experiments = immutable.fromJS(data)
  }

  set rules(data) {
    this._flushCache()

    const rules = data.reduce((acc, rule) => {
      const conditions = rule.conditions.map(normalizeCondtion)
      return { ...acc, [rule.id]: { ...rule, conditions } }
    }, {})

    this._rules = immutable.fromJS(rules)
  }

  set segments(data) {
    this._flushCache()

    const segments = data.reduce((acc, segment) => {
      return { ...acc, [segment.id]: segment }
    }, {})

    this._segments = immutable.fromJS(segments)
  }

  // Public

  setTestingFile(testingFile) {
    validateTestingFile(testingFile, { throw: true })

    const { account, experiments, rules, segments } = testingFile

    this.account = account
    this.experiments = experiments
    this.rules = rules
    this.segments = segments
  }

  findExperiments({ experimentId, goalIdentifier }, opts = {}) {
    const predicate =
      goalIdentifier == null
        ? e => e.id === experimentId
        : e => e.goals.find(g => g.identifier === goalIdentifier)

    return opts.single
      ? this.experiments.find(predicate)
      : this.experiments.filter(predicate)
  }

  // Private

  _populateTokens(tokens) {
    return tokens.reduce((acc, token) => {
      if (isSegmentToken(token)) {
        const segment = this.segments[token.segment]

        const openBracket = createOpenBracket()
        const inlinedTokens = this._populateTokens(segment.tokens)
        const closingBracket = createClosingBracket()

        return acc.concat([openBracket, ...inlinedTokens, closingBracket])
      }

      if (isRuleToken(token)) {
        token.rule = this.rules[token.rule]
      }

      return acc.concat([token])
    }, [])
  }

  _flushCache() {
    this._cache = null
  }
}
