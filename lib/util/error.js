class BunchboxError extends Error {
  constructor(...params) {
    super(...params)
    this.name = 'BunchboxError'
    this.date = new Date()
  }
}

function wrapError(err) {
  throw new BunchboxError(`${err.message}`)
}

module.exports = {
  BunchboxError,
  wrapError
}
