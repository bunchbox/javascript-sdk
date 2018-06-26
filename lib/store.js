const { isObjectId } = require('lib/util/is-type')

class Store {
  setState({ experiments, rules, account }) {
    this._account = account
    this._experiments = experiments
    this._rules = rules
  }

  findOneExperimentById(eId) {
    return this.experiments.find(e => e.id === eId)
  }

  findExperimentsByGoalIdentifier(identifier) {
    return this.experiments.filter(e =>
      e.goals.find(g => g.identifier === identifier && g.active === true)
    )
  }

  // Setter

  set account(data) {
    if (!isObjectId(data)) throw Error('account is not valid')
    this._account = data
  }

  set experiments(data) {
    if (!Array.isArray(data)) throw Error('experiments are not valid')
    this._experiments = data
  }

  set rules(data) {
    if (!Array.isArray(data)) throw Error('experiments are not valid')
    this._rules = data
  }

  // Getter

  get account() {
    return this._account
  }

  get experiments() {
    return this._experiments.map(e => {
      const targeting = populateRules(e.targeting, this._rules)

      const steps = e.steps.map(step => {
        const tokens = populateRules(step.tokens, this._rules)
        return Object.assign({}, step, { tokens })
      })

      return Object.assign({}, e, { targeting, steps })
    })
  }
}

function populateRules(tokens, rules) {
  return tokens.map(token => {
    return token.rule
      ? Object.assign({}, token, { rule: rules.find(r => r.id === token.rule) })
      : token
  })
}

module.exports = new Store()
