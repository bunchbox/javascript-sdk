class Failure extends Error {
  constructor(message, stack, ...params) {
    super(message, stack, ...params)

    this.name = 'Failure'

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, Failure)
    }

    if (stack) this.stack = `${this.name}: ${stack}`
  }

  static fromError(error) {
    return new Failure(error.message, error.stack)
  }
}

module.exports = {
  Failure
}
