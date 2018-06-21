require('rootpath')()

const test = require('ava')

const murmurhash = require('lib/util/murmurhash')

// TODO: rewrite as property tests

test('should return a 32-Bit', t => {
  t.true(murmurhash('foo') <= Math.pow(2, 32))
})

test('should be seedable', t => {
  const a = murmurhash('foo', 0)
  const b = murmurhash('foo', 1)

  t.true(a <= Math.pow(2, 32))
  t.true(b <= Math.pow(2, 32))

  t.not(a, b)
})

test('should always generate the same result if input is equal', t => {
  t.is(murmurhash('bar'), murmurhash('bar'))
  t.not(murmurhash('foo'), murmurhash('bar'))
})
