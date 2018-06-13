const test = require('ava')

const { BunchboxError } = require('../../lib/util/error.js')

test('has custom name', t => {
  const error = new BunchboxError(t.title)
  t.is(error.name, 'BunchboxError')
})

test('has stack', t => {
  const error = new BunchboxError(t.title)
  t.true(error.stack.startsWith('BunchboxError: has stack'))
})

test('has custom attribte date', t => {
  const error = new BunchboxError(t.title)
  t.true(error.date instanceof Date, 'is not an instance of Date')
  t.true(error.date <= new Date(), 'is not in the past')
})
