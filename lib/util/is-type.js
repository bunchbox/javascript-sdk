module.exports.isNumber = arg => {
  return toString.call(arg) === '[object Number]' && !isNaN(arg)
}

module.exports.isBoolean = arg => {
  return (
    arg === true || arg === false || toString.call(arg) === '[object Boolean]'
  )
}

module.exports.isString = arg => {
  return toString.call(arg) === '[object String]'
}

module.exports.isObject = arg => {
  return toString.call(arg) === '[object Object]'
}

module.exports.isObjectId = arg => {
  return new RegExp('^[0-9a-fA-F]{24}$').test(arg)
}
