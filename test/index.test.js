const test = require('ava')

const BunchboxSdk = require('..//lib')

// TODO: test more thoroughly, e.g. opts.host, opts.strict, BunchboxError etc

// BunchboxSdk.constructor/2

test('constructor: validates its input parameters', t => {
  let error

  // opts has a default value
  t.notThrows(() => new BunchboxSdk('token'))

  error = t.throws(() => new BunchboxSdk())
  t.is(error.message, 'token must be a string')

  error = t.throws(() => new BunchboxSdk('token', null))
  t.is(error.message, 'opts must be an object')

  error = t.throws(() => new BunchboxSdk('token', { host: null }))
  t.is(error.message, 'opts.host must be a string')

  error = t.throws(() => new BunchboxSdk('token', { strict: null }))
  t.is(error.message, 'opts.strict must be a boolean')
})

// BunchboxSdk.activate/2

test('activate: validates its input parameters', t => {
  const sdk = new BunchboxSdk('token')

  const clientId = '...'
  const experimentId = '...'

  let error

  error = t.throws(() => sdk.activate())
  t.is(error.message, 'first argument must be an object')

  error = t.throws(() => sdk.activate({ experimentId }))
  t.is(error.message, 'clientId must be a string')

  error = t.throws(() => sdk.activate({ clientId }))
  t.is(error.message, 'experimentId must be a string')

  t.notThrows(() => {
    sdk.activate({ clientId, experimentId })
  })

  error = t.throws(() =>
    sdk.activate({ clientId, experimentId, stepIndex: 'notANubmer' })
  )
  t.is(error.message, 'stepIndex must be a number')

  error = t.throws(() => sdk.activate({ clientId, experimentId }, null))
  t.is(error.message, 'params must be an object')
})

// BunchboxSdk.track/2

test('track: validates its input parameters', t => {
  const sdk = new BunchboxSdk('token')

  const clientId = '...'
  const experimentId = '...'

  let error

  error = t.throws(() => sdk.track())
  t.is(error.message, 'first argument must be an object')

  error = t.throws(() => sdk.track({}))
  t.is(error.message, 'clientId must be a string')

  error = t.throws(() => sdk.track({ clientId, experimentId: 111 }))
  t.is(error.message, 'experimentId must be a string')

  t.notThrows(() => {
    sdk.track({ clientId })
  })
  t.notThrows(() => {
    sdk.track({ clientId, experimentId })
  })

  error = t.throws(() => sdk.track({ clientId }, null))
  t.is(error.message, 'params must be an object')
})
