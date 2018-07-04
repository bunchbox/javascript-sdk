const { inspect } = require('util')

module.exports.info = (...args) => {
  return console.log.apply(
    console,
    args.map(arg => inspect(arg, { colors: true, depth: null }))
  )
}
