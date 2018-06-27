const { inspect } = require('util')

module.exports.log = () => {
  const args = Array.from(arguments).map(arg =>
    inspect(arg, { colors: true, depth: null })
  )

  return console.log.apply(console, args)
}
