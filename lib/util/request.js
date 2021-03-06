const axios = require('axios')

const defaultOpts = {
  token: undefined,
  params: undefined
}

module.exports.get = async function(url, opts = defaultOpts) {
  const { token, params, timeout } = opts

  const { data } = await axios.get(url, {
    params,
    headers: { Authorization: `Bearer ${token}` },
    timeout
  })

  return data
}

module.exports.post = async function(url, payload, opts = defaultOpts) {
  const { token, timeout } = opts

  const { data } = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${token}`, timeout }
  })

  return data
}
