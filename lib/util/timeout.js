const { promisify } = require('util')

const { Failure } = require('./error')

function timeoutAfter(t) {
  return promisify(setTimeout)(t).then(() => {
    throw new Failure(`timeout of ${t}ms exceeded`)
  })
}

module.exports = function timeout(fn, t = 5000) {
  return Promise.race([fn(), timeoutAfter(t)])
}
