const request = require('../util/request')
const BunchboxError = require('../util/error')

const baseURL = 'https://api.bunchbox.co'

async function fetchTestingFile(token) {
  const { data: testingFile } = await request.get(
    `${baseURL}/v1/testing-file`,
    { token }
  )

  if (testingFile == null) throw BunchboxError('Invalid TestingFile')

  return testingFile
}

module.exports = { fetchTestingFile }
