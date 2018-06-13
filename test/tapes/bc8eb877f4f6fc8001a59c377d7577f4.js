var path = require('path')

/**
 * GET /v1/testing-file
 *
 * accept: application/json, text/plain, * / *
 * authorization: Bearer --redacted--
 * user-agent: axios/0.18.0
 * host: api.bunchbox.co
 * connection: close
 */

module.exports = function(req, res) {
  res.statusCode = 200

  res.setHeader('server', 'nginx')
  res.setHeader('date', 'Thu, 14 Jun 2018 13:28:50 GMT')
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('content-length', '1069')
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
  res.setHeader('etag', 'W/"42d-m9An4u8d4Fn8XvO/nCvZTfDZJ+w"')

  res.setHeader('x-yakbak-tape', path.basename(__filename, '.js'))

  res.write(
    new Buffer(
      'eyJkYXRhIjp7ImFjY291bnQiOiI1MjlkZDc0MWI4MjJjYzYzMWYwMDAwMDIiLCJ2ZXJzaW9uIjoxLCJyZXZpc2lvbiI6MiwiZXhwZXJpbWVudHMiOlt7Imhhc0N1c3RvbVZhcmlhbnREaXN0cmlidXRpb24iOmZhbHNlLCJuYW1lIjoiRXhwZXJpbWVudCBbc2VydmVyLXNpZGVdIiwicHJpb3JpdGl6YXRpb24iOjQsInN0YXR1cyI6ImFjdGl2ZSIsInRhcmdldGluZyI6W3sidHlwZSI6MSwicnVsZSI6IjU2MDMxYjEzYWRkMDI2MTcyOTUwYmI5MSJ9XSwidHJhZmZpY0FsbG9jYXRpb24iOjEsInR5cGUiOiJzZXJ2ZXItc2lkZSIsInZhcmlhbnRUYXJnZXRpbmdBY3RpdmUiOmZhbHNlLCJpZCI6IjViMTY0OWZiYWJmZWI1MzVlZTIwMmE0MiIsInN0ZXBzIjpbeyJlbnRyeSI6dHJ1ZSwiaWQiOiI1YjE2NDlmYmFiZmViNTM1ZWUyMDJhNDMiLCJ0b2tlbnMiOltdLCJ2YXJpYW50cyI6W3siYWN0aXZlIjp0cnVlLCJldmVudCI6ImJiX2V4cGVyaW1lbnRfZXhwZXJpbWVudF9bc2VydmVyLXNpZGVdX29yaWdpbmFsIiwibmFtZSI6Ik9yaWdpbmFsIiwidGFyZ2V0aW5nIjpbXSwidHlwZSI6Im9yaWdpbmFsIiwid2VpZ2h0IjpudWxsLCJpZCI6IjViMTY0OWZiYWJmZWI1MzVlZTIwMmE0NCJ9LHsiYWN0aXZlIjp0cnVlLCJldmVudCI6ImJiX2V4cGVyaW1lbnRfZXhwZXJpbWVudF9bc2VydmVyLXNpZGVdX3ZhcmlhbnRlXzIiLCJuYW1lIjoiVmFyaWFudGUgMiIsInRhcmdldGluZyI6W10sInR5cGUiOiJvcmlnaW5hbCIsIndlaWdodCI6bnVsbCwiaWQiOiI1YjE2NGEyYWFiZmViNTM1ZWUyMDJhNzQifV19XSwiZ29hbHMiOltdfV0sInJ1bGVzIjpbeyJjb25kaXRpb25zIjpbeyJrZXkiOiJ1cmwiLCJhdHRyaWJ1dGUiOiI0MGIxNjNkNzEzY2ZlZGM1ODZkZTZhNDMiLCJwYXJhbWV0ZXIiOiIiLCJjb21wYXJhdG9yIjoiY29udGFpbnMiLCJ2YWx1ZSI6ImNvbnZlcnNpb24ifSx7ImtleSI6InVybCIsImF0dHJpYnV0ZSI6IjQwYjE2M2Q3MTNjZmVkYzU4NmRlNmE0MyIsInBhcmFtZXRlciI6IiIsImNvbXBhcmF0b3IiOiJkb2VzTm90Q29udGFpbiIsInZhbHVlIjoibWFpbiJ9XSwibWF0Y2giOiJhbGwifV19fQ==',
      'base64'
    )
  )
  res.end()

  return __filename
}
