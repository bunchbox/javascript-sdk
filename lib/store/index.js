const immutable = require('immutable')

const { validateTestingFile } = require('./validator')
const { normalizeCondtion } = require('lib/testing')

module.exports = class Store {
  constructor() {
    this.account = null

    this._experiments = immutable.List()
    this._rules = immutable.List()
  }

  // Getter

  get experiments() {
    return this._experiments.toJS().map(e => {
      const targeting = this._populateTokens(e.targeting)

      const steps = e.steps.map(step => {
        const tokens = this._populateTokens(step.tokens)
        return Object.assign(step, { tokens })
      })

      return Object.assign(e, { targeting, steps })
    })
  }

  get rules() {
    return this._rules.toJS()
  }

  // Setter

  set experiments(data) {
    this._experiments = immutable.fromJS(data)
  }

  set rules(data) {
    const rules = data.map(rule => {
      const conditions = rule.conditions.map(normalizeCondtion)
      return Object.assign(rule, { conditions })
    })

    this._rules = immutable.fromJS(rules)
  }

  // Public

  setTestingFile(testingFile) {
    validateTestingFile(testingFile, { throw: true })

    const { experiments, rules, account } = testingFile

    this.account = account
    this.experiments = experiments
    this.rules = rules
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

  findRules({ ruleId }, opts = {}) {
    const predicate = r => r.id === ruleId

    return opts.single
      ? this.rules.find(predicate)
      : this.rules.filter(predicate)
  }

  // Private

  _populateTokens(tokens) {
    return tokens.map(token => {
      return token.rule
        ? Object.assign(token, {
            rule: this.findRules({ ruleId: token.rule }, { single: true })
          })
        : token
    })
  }
}
