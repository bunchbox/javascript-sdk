const axios = require('axios')

const BunchboxError = require('lib/util/error')

const defaultOpts = {
  token: undefined,
  params: undefined
}

module.exports.get = async function(url, opts = defaultOpts) {
  const { token, params } = opts

  const { data } = await axios
    .get(url, { params, headers: { Authorization: `Bearer ${token}` } })
    .catch(BunchboxError.fromError)

  return data
}

module.exports.post = async function(url, payload, opts = defaultOpts) {
  const { token } = opts

  const { data } = await axios
    .post(url, payload, { headers: { Authorization: `Bearer ${token}` } })
    .catch(BunchboxError.fromError)

  return data
}
