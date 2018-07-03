const { isObjectId } = require('lib/util/is-type')
const { inspect } = require('util')

const { validateTestingFile } = require('./validator')

class Store {
  constructor() {
    this._account = null
    this._experiments = []
    this._rules = []
  }

  setTestingFile(testingFile) {
    validateTestingFile(testingFile, { throw: true })

    const { experiments, rules, account } = testingFile

    this._account = account
    this._experiments = experiments
    this._rules = rules
  }

  findExperiments({ experimentId, goalIdentifier }) {
    const predicate =
      goalIdentifier == null
        ? e => e.id === experimentId
        : e => e.goals.find(g => g.identifier === goalIdentifier)

    return this.experiments.filter(predicate)
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
