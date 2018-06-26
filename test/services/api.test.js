require('rootpath')()

const test = require('ava')

const testServer = require('test/_test_server')
const api = require('lib/services/api')

const PORT = 5999

// In order to make each test unique, the test name (=title) is used as part of
// the host.
const baseUrl = ({ title }) => {
  return `http://${title.replace(new RegExp(' ', 'g'), '_')}.localhost:${PORT}`
}

test.before(() => {
  testServer.start('https://api.bunchbox.co', PORT)
})

test.after(() => {
  testServer.stop()
})

test('fetches the testing file', async t => {
  const testingFile = await api.fetchTestingFile(process.env.TOKEN, {
    baseUrl: baseUrl(t)
  })

  t.is(testingFile.account, '529dd741b822cc631f000002')
  t.is(testingFile.version, 1)
  t.is(typeof testingFile.revision, 'number')
  t.true(Array.isArray(testingFile.experiments))
  t.true(Array.isArray(testingFile.rules))
})

test('throws error if the token does not exist', async t => {
  const error = await t.throws(
    () => api.fetchTestingFile('0000000', { baseUrl: baseUrl(t) }),
    Error
  )

  t.is(error.message, 'Request failed with status code 403')
})
