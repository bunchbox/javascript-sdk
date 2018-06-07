const axios = require('axios')

const BunchboxError = require('./error')

const defaultOpts = {
  token: undefined
}

function wrapError(err) {
  throw new BunchboxError(`${err.message}`)
}

module.exports.get = async function(url, opts = defaultOpts) {
  const { data } = await axios
    .get(url, {
      headers: { Authorization: `Bearer ${opts.token}` }
    })
    .catch(wrapError)

  return data
}
