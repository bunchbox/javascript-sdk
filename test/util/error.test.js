const test = require('ava')

const { Failure } = require('../../lib/util/error.js')

// Failure

test('Failure: has custom name', t => {
  const error = new Failure(t.title)
  t.is(error.name, 'Failure')
})

test('Failure: has stack', t => {
  const error = new Failure(t.title)
  t.true(error.stack.startsWith('Failure: Failure: has stack'))
})
