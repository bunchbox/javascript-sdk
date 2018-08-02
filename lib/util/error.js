// A custom error intended as a common wrapper.
class BunchboxError extends Error {
  constructor(message, stack) {
    super(message)

    this.name = 'BunchboxError'
    this.date = new Date()

    if (stack) this.stack = `${this.name}: ${stack}`
  }

  static fromError(error) {
    return new BunchboxError(error.message, error.stack)
  }
}

// `Failure`s represent error values that valid, non-critical results of an
// operation.
class Failure extends Error {
  constructor(...params) {
    super(...params)
    this.name = 'Failure'
  }

  static fromError(error) {
    return new Failure(`${error.message}`)
  }
}

module.exports = {
  BunchboxError,
  Failure
}
