const { isObjectId } = require('lib/util/is-type')

class Store {
  constructor() {
    this.account = null
    this.experiments = []
    this.rules = []
  }

  setState(data) {
    const { experiments, rules, account } = data

    if (!isObjectId(account)) throw Error('account is not valid')
    if (!Array.isArray(experiments)) throw Error('experiments are not valid')
    if (!Array.isArray(rules)) throw Error('experiments are not valid')

    this.account = account
    this.experiments = experiments
    this.rules = rules
  }

  // get experiments() {
  //   return this.experiments
  // }
  // get rules() {
  //   return this.rules
  // }
}

module.exports = new Store()
