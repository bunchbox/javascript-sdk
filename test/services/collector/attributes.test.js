require('rootpath')()

const test = require('ava')

const { encodeAttributes } = require('lib/services/collector/encoder')

test('encodes attributes', t => {
  const attributes = {
    number: 42,
    boolean: true,
    string: 'foo',
    array: ['bar', 'bar2']
  }

  const encoded = encodeAttributes(attributes)

  t.deepEqual(encoded, {
    at: ['number=+:42', 'boolean=!:1', 'string=s:foo', 'array=a:bar,bar2']
  })
})
