const { isObject } = require('lib/util/is-type')
const request = require('lib/util/request')
const logger = require('lib/util/logger')

const defaultOpts = {
  baseUrl: 'http://api.bunchbox.local' // 'https://api.bunchbox.co'
}

const SUPPORTED_VERSION = 1

async function fetchTestingFile(token, opts = {}) {
  const { baseUrl } = Object.assign({}, defaultOpts, opts)

  const url = `${baseUrl}/v1/testing-file`

  logger.debug('Requesting Testing File', { url })

  const { data: testingFile } = await request.get(url, { token })

  if (!isObject(testingFile)) throw Error('Invalid TestingFile')

  if (testingFile.version !== SUPPORTED_VERSION)
    throw Error('Please upgrade the bunchbox-sdk')

  return testingFile
}

module.exports = { fetchTestingFile }
