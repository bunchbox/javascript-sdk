require('rootpath')()

const test = require('ava')

const murmurhash = require('lib/util/murmurhash')

// murmurhash.hash/1

test('hash: returns a 32-Bit', t => {
  t.true(murmurhash.hash('foo' + Math.random()) <= Math.pow(2, 32))
})

test('hash: generates the same result if input is equal', t => {
  t.is(murmurhash.hash('bar'), murmurhash.hash('bar'))
  t.not(murmurhash.hash('foo'), murmurhash.hash('bar'))
})

// murmurhash.hash/2

test('hash: is seedable', t => {
  const a = murmurhash.hash('foo', 0)
  const b = murmurhash.hash('foo', 1)

  t.true(a <= Math.pow(2, 32))
  t.true(b <= Math.pow(2, 32))

  t.not(a, b)
})

// murmurhash.random/1

test('random: returns a float between 0.0 and 1.0', t => {
  t.true(murmurhash.random('foo' + Math.random()) <= 1.0)
})

test('random: generates the same result if input is equal', t => {
  t.is(murmurhash.hash('bar'), murmurhash.hash('bar'))
  t.not(murmurhash.hash('foo'), murmurhash.hash('bar'))
})

// murmurhash.random/2

test('random: is seedable', t => {
  const a = murmurhash.random('foo', 0)
  const b = murmurhash.random('foo', 1)

  t.true(a <= 1.0)
  t.true(b <= 1.0)

  t.not(a, b)
})
