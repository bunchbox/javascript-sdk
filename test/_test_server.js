const crypto = require('crypto')
const http = require('http')
const path = require('path')
const url = require('url')
const yakbak = require('yakbak')

const dirname = path.resolve('./test/tapes')

let server = null

function sort(obj) {
  var ret = {}

  Object.keys(obj)
    .sort()
    .forEach(function(key) {
      ret[key] = obj[key]
    })

  return ret
}

function removeSecrectsFromHeaders(headers) {
  return Object.assign({}, headers, { authorization: '--redacted--' })
}

function removeSecrectsFromQuery(query) {
  // query = query.replace(/sid=.+&/, '')
  return query
}

function hash(req, body) {
  const hash = crypto.createHash('md5')

  let { pathname, query } = url.parse(req.url, true)

  hash.update(req.httpVersion)
  hash.update(req.method)
  hash.update(pathname)
  hash.update(JSON.stringify(sort(removeSecrectsFromQuery(query))))
  hash.update(JSON.stringify(sort(removeSecrectsFromHeaders(req.headers))))
  hash.update(JSON.stringify(sort(req.trailers)))

  hash.write(body)

  return hash.digest('hex')
}

module.exports = {
  start: (url, port = 3000) => {
    server = http.createServer(yakbak(url, { dirname, hash })).listen(port)
  },

  stop: () => {
    server.close()
  }
}
