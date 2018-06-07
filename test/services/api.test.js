const test = require('ava')

const api = require('../../lib/services/api')

test('fetches the testing file', async t => {
  const testingFile = await api.fetchTestingFile(process.env.TOKEN || '$token')
  t.is(testingFile.version, 1)
})
