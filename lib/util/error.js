module.exports = class BunchboxError extends Error {
  constructor(...params) {
    super(...params)
    this.name = 'BunchboxError'
    this.date = new Date()
  }
}
