require('rootpath')()

const test = require('ava')

const { hash } = require('lib/util/murmurhash')

// TODO: rewrite as property tests

test('should return a 32-Bit', t => {
  t.true(hash('foo') <= Math.pow(2, 32))
})

test('should be seedable', t => {
  const a = hash('foo', 0)
  const b = hash('foo', 1)

  t.true(a <= Math.pow(2, 32))
  t.true(b <= Math.pow(2, 32))

  t.not(a, b)
})

test('should always generate the same result if input is equal', t => {
  t.is(hash('bar'), hash('bar'))
  t.not(hash('foo'), hash('bar'))
})
