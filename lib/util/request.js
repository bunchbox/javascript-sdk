const axios = require('axios')

const { wrapError } = require('lib/util/error')

const defaultOpts = {
  token: undefined,
  params: undefined
}

module.exports.get = async function(url, opts = defaultOpts) {
  const { token, params } = opts

  console.log('GET', url)

  const { data } = await axios
    .get(url, { params, headers: { Authorization: `Bearer ${token}` } })
    .catch(wrapError)

  return data
}

module.exports.post = async function(url, payload, opts = defaultOpts) {
  const { token } = opts

  console.log('POST', url, payload)

  const { data } = await axios
    .post(url, payload, { headers: { Authorization: `Bearer ${token}` } })
    .catch(wrapError)

  return data
}
