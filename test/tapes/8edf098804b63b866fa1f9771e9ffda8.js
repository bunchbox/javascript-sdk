var path = require('path')

/**
 * GET /v1/testing-file
 *
 * accept: application/json, text/plain, * / *
 * authorization: Bearer 0000000
 * user-agent: axios/0.18.0
 * host: api.bunchbox.co
 * connection: close
 */

module.exports = function(req, res) {
  res.statusCode = 403

  res.setHeader('server', 'nginx')
  res.setHeader('date', 'Thu, 14 Jun 2018 13:28:50 GMT')
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('content-length', '68')
  res.setHeader('connection', 'close')
  res.setHeader('vary', 'Accept-Encoding')
  res.setHeader('x-dns-prefetch-control', 'off')
  res.setHeader('x-frame-options', 'SAMEORIGIN')
  res.setHeader(
    'strict-transport-security',
    'max-age=15552000; includeSubDomains'
  )
  res.setHeader('x-download-options', 'noopen')
  res.setHeader('x-content-type-options', 'nosniff')
  res.setHeader('x-xss-protection', '1; mode=block')
  res.setHeader('set-cookie', [
    'lang=en; path=/; expires=Fri, 14 Jun 2019 13:28:50 GMT; domain=bunchbox.co'
  ])
  res.setHeader('etag', 'W/"44-CiSBwvIRw3ymqfvXCsXwTQ8leBE"')

  res.setHeader('x-yakbak-tape', path.basename(__filename, '.js'))

  res.write(
    new Buffer(
      'eyJzdWNjZXNzIjpmYWxzZSwiZXJyb3IiOiJJbnZhbGlkIHRva2VuIiwiZXJyb3JzIjpbIkludmFsaWQgdG9rZW4iXX0=',
      'base64'
    )
  )
  res.end()

  return __filename
}
