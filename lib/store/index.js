const immutable = require('immutable')

const { validateTestingFile } = require('./validator')

module.exports = class Store {
  constructor() {
    this.account = null
    this._experiments = []
    this._rules = []
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

  // Public

  setTestingFile(testingFile) {
    validateTestingFile(testingFile, { throw: true })

    const { experiments, rules, account } = testingFile

    this.account = account
    this._experiments = immutable.fromJS(experiments)
    this._rules = immutable.fromJS(rules)
  }

  findExperiments({ experimentId, goalIdentifier }, opts = {}) {
    const predicate =
      goalIdentifier == null
        ? e => e.id === experimentId
        : e => e.goals.find(g => g.identifier === goalIdentifier)

    const experiments = this.experiments.filter(predicate)

    if (opts.single) {
      return experiments.length < 1 ? null : experiments[0]
    }

    return experiments
  }

  findRules({ ruleId }, opts = {}) {
    const predicate = r => r.get('id') === ruleId

    if (opts.single) {
      const rule = this._rules.find(predicate)
      return rule == null ? null : rule.toJS()
    }

    return this._rules.filter(predicate).toJS()
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
