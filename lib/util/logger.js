const { isString, isObject, isBoolean } = require('lib/util/is-type')

const { inspect } = require('util')
const assert = require('assert')

const COLORS = Object.entries(inspect.colors).reduce(
  (acc, [color, [l, r]]) =>
    Object.assign(acc, { [color]: str => `\x1b[${l}m${str}\x1b[${r}m` }),
  {}
)

const LEVELS = {
  trace: { i: 0, color: 'grey' },
  debug: { i: 1, color: 'grey' },
  info: { i: 2, color: 'white' },
  warn: { i: 3, color: 'yellow' },
  error: { i: 4, color: 'red' },
  silent: { i: 5, color: null }
}

class Logger {
  constructor(opts = {}) {
    this.configure(opts)
  }

  configure(opts) {
    assert(isObject(opts), 'opts must be an object')

    this.opts = Object.assign({ colors: true, level: 'warn' }, opts, {
      depth: 4,
      breakLength: 80
    })

    assert(isString(this.opts.level), 'opts.level must be an object')
    assert(isBoolean(this.opts.colors), 'opts.colors must be an object')

    this._adjustLevel(this.opts.level)
  }

  // private

  _adjustLevel(level) {
    if (!isString(level) || LEVELS[level.toLowerCase()] == null)
      throw Error('Invalid level')

    for (const [methodName, { i }] of Object.entries(LEVELS)) {
      if (i >= LEVELS.silent.i) continue

      this[methodName] =
        i < LEVELS[level.toLowerCase()].i ? () => {} : this._bind(methodName)
    }
  }

  _format(data) {
    return inspect(data, this.opts)
  }

  _bind(methodName) {
    const label = COLORS[LEVELS[methodName].color](`[${methodName}]`)

    if (methodName === 'debug' || console[methodName] == null) {
      methodName = 'log'
    }

    return (message, metadata) => {
      const args = [label, this._format(message)]
      if (metadata != null) args.push('\n', this._format(metadata))
      return console[methodName].apply(console, args)
    }
  }
}

module.exports = new Logger()
