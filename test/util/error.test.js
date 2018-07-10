require('rootpath')()

const test = require('ava')

const { BunchboxError, Failure } = require('lib/util/error.js')

// BunchboxError

test('BunchboxError: has custom name', t => {
  const error = new BunchboxError(t.title)
  t.is(error.name, 'BunchboxError')
})

test('BunchboxError: has stack', t => {
  const error = new BunchboxError(t.title)
  t.true(error.stack.startsWith('BunchboxError: BunchboxError: has stack'))
})

test('BunchboxError: has custom attribte date', t => {
  const error = new BunchboxError(t.title)
  t.true(error.date instanceof Date, 'is not an instance of Date')
  t.true(error.date <= new Date(), 'is not in the past')
})

// Failure

test('Failure: has custom name', t => {
  const error = new Failure(t.title)
  t.is(error.name, 'Failure')
})

test('Failure: has stack', t => {
  const error = new Failure(t.title)
  t.true(error.stack.startsWith('Failure: Failure: has stack'))
})
