// TODO format documentation (@private)

// A custom error intended as a common wrapper.
class BunchboxError extends Error {
  constructor(...params) {
    super(...params)
    this.name = 'BunchboxError'
    this.date = new Date()
  }

  static fromError(error) {
    return new BunchboxError(`${error.message}`)
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
