const request = require('../util/request')
const { BunchboxError } = require('../util/error')

const defaultOpts = {
  baseUrl: 'https://api.bunchbox.co'
}

async function fetchTestingFile(token, opts) {
  const { baseUrl } = Object.assign({}, defaultOpts, opts)

  const { data: testingFile } = await request.get(
    `${baseUrl}/v1/testing-file`,
    { token }
  )

  if (testingFile == null) throw BunchboxError('Invalid TestingFile')

  return testingFile
}

module.exports = { fetchTestingFile }
