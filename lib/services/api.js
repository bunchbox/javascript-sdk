const request = require('lib/util/request')

const defaultOpts = {
  baseUrl: 'http://api.bunchbox.local' // 'https://api.bunchbox.co'
}

const SUPPORTED_VERSION = 1

async function fetchTestingFile(token, opts) {
  const { baseUrl } = Object.assign({}, defaultOpts, opts)

  const { data: testingFile } = await request.get(
    `${baseUrl}/v1/testing-file`,
    { token }
  )

  if (testingFile == null) throw Error('Invalid TestingFile')

  if (testingFile.version !== SUPPORTED_VERSION)
    throw Error('Please upgrade the bunchbox-sdk')

  return testingFile
}

module.exports = { fetchTestingFile }
