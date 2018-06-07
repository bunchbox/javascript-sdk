const test = require('ava')

const { add } = require('../lib')

test('adds to numbers', async t => {
  t.is(await add(2, 2), 4)
})
