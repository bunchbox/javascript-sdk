const assert = require('assert')

const { isString } = require('lib/util/is-type')

function stripBeginningAt(url, char) {
  var entityStartPosition = url.indexOf(char)
  var hasEntity = entityStartPosition !== -1
  return hasEntity ? url.substring(0, entityStartPosition) : url
}

function removeByRegExp(url, regexp) {
  return url.replace(regexp, '')
}

module.exports.simplifyUrl = url => {
  assert(isString(url), 'url must be a string')

  url = url.toLowerCase()
  url = stripBeginningAt(url, '?')
  url = stripBeginningAt(url, '#')
  url = removeByRegExp(url, /[/]+$/)
  url = removeByRegExp(url, /^https?:\/\//)
  url = removeByRegExp(url, /^www\./)

  return url
}
