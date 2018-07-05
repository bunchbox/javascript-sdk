const { isObject } = require('./is-type')

module.exports.convert = obj => {
  return (function recurse(obj, acc = {}, path = []) {
    return Object.entries(obj).reduce(
      (_acc, [key, value]) =>
        isObject(value) && Object.keys(value).length > 0
          ? recurse(value, _acc, path.concat(key))
          : Object.assign(_acc, { [path.concat(key).join('.')]: value }),
      acc
    )
  })(obj)
}

module.exports.find = (obj, key) => {
  return key.split('.').reduce((acc, k) => (isObject(acc) ? acc[k] : acc), obj)
}
