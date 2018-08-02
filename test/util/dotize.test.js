const test = require('ava')

const dotize = require('../../lib/util/dotize')

test('converts to dottedk key-value pairs', t => {
  const obj = {
    id: 'my-id',
    nes: {
      ted: {
        value: true
      }
    },
    other: {
      nested: {
        stuff: 5
      }
    },
    some: {
      array: ['A', 'B']
    },
    ehrm: 123,
    dates: {
      first: new Date('Mon Oct 13 2014 00:00:00 GMT+0100 (BST)')
    }
  }

  const expected = {
    id: 'my-id',
    'nes.ted.value': true,
    'other.nested.stuff': 5,
    'some.array': ['A', 'B'],
    ehrm: 123,
    'dates.first': new Date('Mon Oct 13 2014 00:00:00 GMT+0100 (BST)')
  }

  t.deepEqual(dotize.convert(obj), expected)
})

test('keeps empty arrays', t => {
  t.deepEqual(dotize.convert({ hello: [] }), { hello: [] })
  t.deepEqual(dotize.convert({ hello: { world: [] } }), { 'hello.world': [] })
})

test('keeps empty objects', t => {
  t.deepEqual(dotize.convert({ hello: {} }), { hello: {} })
  t.deepEqual(dotize.convert({ hello: { world: {} } }), { 'hello.world': {} })
})
