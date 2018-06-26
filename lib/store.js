const { isObjectId } = require('lib/util/is-type')

const { inspect } = require('util')

class Store {
  constructor() {
    this.account = null
    this.experiments = []
    this.rules = []
  }

  setState(data) {
    const { experiments, rules, account } = data

    // console.log(inspect(data, { depth: null, colors: true }))

    // TODO validate data in depth
    if (!isObjectId(account)) throw Error('account is not valid')
    if (!Array.isArray(experiments)) throw Error('experiments are not valid')
    if (!Array.isArray(rules)) throw Error('experiments are not valid')

    this.account = account
    this.experiments = experiments
    this.rules = rules
  }

  getExperiment(experimentId) {
    const experiment = this.experiments.find(e => e.id === experimentId)

    if (experiment == null) return null

    const targeting = populateRules(experiment.targeting, this.rules)
    const steps = experiment.steps.map(step => {
      const tokens = populateRules(step.tokens, this.rules)
      return Object.assign({}, step, { tokens })
    })

    const populatedExperiment = Object.assign({}, experiment, {
      targeting,
      steps
    })

    console.log(inspect(populatedExperiment, { depth: null, colors: true }))

    return populatedExperiment
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
