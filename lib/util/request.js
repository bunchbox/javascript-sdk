const axios = require('axios')

const { wrapError } = require('./error')

const defaultOpts = {
  token: undefined
}

module.exports.get = async function(url, opts = defaultOpts) {
  const { data } = await axios
    .get(url, { headers: { Authorization: `Bearer ${opts.token}` } })
    .catch(wrapError)

  return data
}
