require('rootpath')()

const test = require('ava')

const api = require('lib/services/api')

const testServer = require('test/_test_server')

const PORT = 5999

// In order to make each test unique, the test name (=title) is used as part of
// the host.
const host = ({ title }) =>
  `${title.replace(new RegExp(' ', 'g'), '_')}.localhost:${PORT}`
const proto = 'http'

test.before(() => {
  testServer.start('https://api.bunchbox.co', PORT)
})

test.after(() => {
  testServer.stop()
})

// api.fetchTestingFile/2

test('fetches the testing file', async t => {
  const testingFile = await api.fetchTestingFile(process.env.TOKEN, {
    host: host(t),
    proto
  })

  t.is(testingFile.account, '529dd741b822cc631f000002')
  t.is(testingFile.version, 1)
  t.is(typeof testingFile.revision, 'number')
  t.true(Array.isArray(testingFile.experiments))
  t.true(Array.isArray(testingFile.rules))
})

test('throws error if the token does not exist', async t => {
  const error = await t.throws(
    () => api.fetchTestingFile('0000000', { host: host(t), proto }),
    Error
  )

  t.is(error.message, 'Request failed with status code 403')
})
