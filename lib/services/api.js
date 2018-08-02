const { isObject } = require('../util/is-type')
const request = require('../util/request')
const logger = require('../util/logger')
const { Failure } = require('../util/error')

const SUPPORTED_VERSION = 1

async function fetchTestingFile(token, opts = {}) {
  const { proto, host } = { host: 'bunchbox.local', proto: 'https', ...opts }
  const url = `${proto}://api.${host}/v1/testing-file`

  logger.debug('Requesting Testing File', { url })

  const { data: testingFile } = await request.get(url, { token }).catch(err => {
    if (err.respons && err.response.status === 403)
      throw Error('API access is forbidden (Invalid token?)')

    throw Failure.fromError(err)
  })

  if (!isObject(testingFile)) throw Error('Invalid TestingFile')

  if (testingFile.version !== SUPPORTED_VERSION)
    throw Error('Please upgrade the bunchbox-sdk')

  return testingFile
}

module.exports = { fetchTestingFile }
