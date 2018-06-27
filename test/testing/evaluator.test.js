require('rootpath')()

const test = require('ava')

const evaluator = require('lib/testing/evaluator')

const f = condition => [
  { type: 1, rule: { match: 'any', conditions: [condition] } }
]

test('evaluates all tokens', t => {
  const tokens = [
    {
      type: 1,
      rule: {
        match: 'all',
        conditions: [
          { a: 'foo', k: 'gender', c: 'equals', v: 'female' },
          { k: 'url', c: 'contains', v: 'http' },
          { k: 'url', c: 'contains', v: ':' }
        ]
      }
    },
    {
      type: 8
    },
    {
      type: 1,
      rule: {
        match: 'all',
        conditions: [
          { a: 'foo', k: 'gender', c: 'equals', v: 'female' },
          { k: 'url', c: 'contains', v: 'http' },
          { k: 'url', c: 'contains', v: ':' }
        ]
      }
    }
  ]

  const params = {}

  t.false(evaluator.formula(tokens, params))
})

test('allows empty formulas vie the `strict` option', t => {
  const params = {}

  t.true(evaluator.formula(undefined, params))
  t.true(evaluator.formula([], params))
  t.true(evaluator.formula([], params, false))
  t.false(evaluator.formula([], params, true))
})

test('should evaluate all conditions', t => {
  const params = {
    attributes: { gender: 'female' },
    url: 'http://example.com'
  }

  const rule = {
    match: 'all',
    conditions: [
      { a: 'foo', k: 'gender', c: 'equals', v: 'female' },
      { k: 'url', c: 'contains', v: 'http' },
      { k: 'url', c: 'contains', v: ':' }
    ]
  }

  t.true(evaluator.formula([{ type: 1, rule }], params))

  rule.conditions[0].value = 'male'
  t.false(evaluator.formula([{ type: 1, rule }], params))
})

test('succeeds if least one condition evaluates to true', t => {
  const params = { attributes: { gender: 'female' } }

  const rule = {
    match: 'any',
    conditions: [
      { a: 'foo', k: 'gender', c: 'equals', v: 'female' },
      { k: 'url', c: 'contains', v: Math.random() }
    ]
  }

  t.true(evaluator.formula([{ type: 1, rule }], params))
})

test('fails if no condition evaluates to true', t => {
  const rule = {
    match: 'any',
    conditions: [
      { a: 'foo', k: 'gender', c: 'equals', v: 'female' },
      { a: 'foo', k: 'gender', c: 'equals', v: 'male' },
      { a: 'foo', k: 'gender', c: 'equals', v: 'unisex' }
    ]
  }

  t.false(evaluator.formula([{ type: 1, rule }]))
})

test('should evaluate string comparators', t => {
  const ua = { userAgent: 'foo' }
  t.true(evaluator.formula(f({ k: 'userAgent', c: 'begins', v: 'F' }), ua))
  t.false(evaluator.formula(f({ k: 'userAgent', c: 'begins', v: 'B' }), ua))

  const cookie = { cookie: 'foo' }
  t.true(evaluator.formula(f({ k: 'cookie', c: 'ends', v: 'oo' }), cookie))
  t.false(evaluator.formula(f({ k: 'cookie', c: 'ends', v: 'f' }), cookie))

  const ref = { referrer: 'bar' }
  t.true(evaluator.formula(f({ k: 'referrer', c: 'regex', v: /a/ }), ref))
  t.false(evaluator.formula(f({ k: 'referrer', c: 'regex', v: /^a$/ }), ref))
})

test('evaluates device attributes', t => {
  const params = {
    device: {
      os: 'Windows',
      browser: 'Chrome',
      category: 'd',
      viewportHeight: 100,
      viewportWidth: 100
    }
  }

  const matching_conditions = [
    { k: 'device.os', c: 'equals', v: 'Windows' },
    { k: 'device.browser', c: 'contains', v: 'rom' },
    { k: 'device.category', c: 'regex', v: /d/ },
    { k: 'device.viewportHeight', c: 'isGreater', v: 99 },
    { k: 'device.viewportWidth', c: 'isLess', v: 101 }
  ]

  const failing_conditions = [
    { k: 'device.os', c: 'equals', v: 'MacOS' },
    { k: 'device.browser', c: 'contains', v: 'IE' },
    { k: 'device.category', c: 'regex', v: /m/ },
    { k: 'device.viewportHeight', c: 'isGreater', v: 100 },
    { k: 'device.viewportWidth', c: 'isLess', v: 0 }
  ]

  for (let condition of matching_conditions) {
    t.true(evaluator.formula(f(condition), params))
  }

  for (let condition of failing_conditions) {
    t.false(evaluator.formula(f(condition), params))
  }
})

test('evaluates parameter attributes', t => {
  const params = {
    urlParameters: { foo: 'bar', bar: null },
    referrerParameters: { bar: 'foo', foo: null }
  }

  const matching_conditions = [
    { k: 'urlParameters', p: 'foo', c: 'notRegex', v: /barbar/ },
    { k: 'referrerParameters', p: 'foo', c: 'notRegex', v: /barbar/ },
    { k: 'referrerParameters', p: 'asdf', c: 'doesNotExist' }
  ]

  const failing_conditions = [
    { k: 'urlParameters', p: 'bar', c: 'doesNotExist' }
  ]

  for (let condition of matching_conditions) {
    t.true(evaluator.formula(f(condition), params))
  }

  for (let condition of failing_conditions) {
    t.false(evaluator.formula(f(condition), params))
  }
})

test('evaluates geo attributes', t => {
  const params = {
    geo: {
      ip: '42.42.42.42',
      country: 'Mali',
      countryCode: 'ML',
      city: 'Timbuktu'
    }
  }

  const matching_conditions = [
    { k: 'geo.ip', c: 'equals', v: '42.42.42.42' },
    { k: 'geo.country', c: 'equals', v: 'Mali' },
    { k: 'geo.countryCode', c: 'equals', v: 'ML' },
    { k: 'geo.city', c: 'doesNotContain', v: 'Berlin' }
  ]

  const failing_conditions = [{ k: 'geo.ip', c: 'equals', v: '42.42.42.0' }]

  for (let condition of matching_conditions) {
    t.true(evaluator.formula(f(condition), params))
  }

  for (let condition of failing_conditions) {
    t.false(evaluator.formula(f(condition), params))
  }
})

test('should evaluate custom attributes', t => {
  const params = {
    attributes: {
      truthy: true,
      falsy: false,
      list: [1, 2, 3]
    }
  }

  const matching_conditions = [
    { a: 1, k: 'truthy', c: 'isTrue' },
    { a: 2, k: 'falsy', c: 'isFalse' },
    { a: 3, k: 'list', c: 'listContains', v: 3 }
  ]

  const failing_conditions = [{ a: 3, k: 'list', c: 'listContains', v: 4 }]

  for (let condition of matching_conditions) {
    t.true(evaluator.formula(f(condition), params))
  }

  for (let condition of failing_conditions) {
    t.false(evaluator.formula(f(condition), params))
  }
})

test('only works with arrays', t => {
  const params = {
    attributes: {
      undefined: undefined,
      null: null,
      number: 1,
      string: 'foo',
      bool: !!1,
      object: { a: 'b' },
      fn: function() {},
      list: [1, 2, 3, 4]
    }
  }

  const matching_conditions = [
    { a: 'list', k: 'list', c: 'listSizeIsGreater', v: 3 },
    { a: 'list', k: 'list', c: 'listSizeIsGreaterOrEqual', v: 4 },
    { a: 'list', k: 'list', c: 'listSizeIsLess', v: 6 },
    { a: 'list', k: 'list', c: 'listSizeIsLessOrEqual', v: 4 }
  ]

  const failing_conditions = [
    { a: 'undefined', k: 'undefined', c: 'listSizeIsGreater', v: 5 },
    { a: 'null', k: 'null', c: 'listSizeIsGreater', v: 5 },
    { a: 'number', k: 'number', c: 'listSizeIsGreater', v: 5 },
    { a: 'string', k: 'string', c: 'listSizeIsGreater', v: 5 },
    { a: 'bool', k: 'bool', c: 'listSizeIsGreater', v: 5 },
    { a: 'object', k: 'object', c: 'listSizeIsGreater', v: 5 },
    { a: 'fn', k: 'fn', c: 'listSizeIsGreater', v: 5 }
  ]

  for (let condition of matching_conditions) {
    t.true(evaluator.formula(f(condition), params))
  }

  for (let condition of failing_conditions) {
    t.false(evaluator.formula(f(condition), params))
  }
})

test('fails for non-numeric values', t => {
  const params = {
    attributes: {
      list: [1, 2, 3, 4]
    }
  }

  const values = [
    undefined,
    null,
    1,
    '!!',
    !!1,
    { a: 'b' },
    function() {},
    1000000
  ]

  for (let value of values) {
    const expected = value === 1000000 ? 'true' : 'false'

    t[expected](
      evaluator.formula(
        f({ a: 'list', k: 'list', c: 'listSizeIsLess', v: value }),
        params
      )
    )
  }
})

test('succeeds if the list is greater', t => {
  const params = {
    attributes: {
      list: [1]
    }
  }

  t.true(
    evaluator.formula(
      f({ a: 'list', k: 'list', c: 'listSizeIsGreater', v: 0 }),
      params
    )
  )
})

test('succeeds the list is greater or equal', t => {
  const params = {
    attributes: {
      list: [1]
    }
  }

  t.true(
    evaluator.formula(
      f({ a: 'list', k: 'list', c: 'listSizeIsGreaterOrEqual', v: 1 }),
      params
    )
  )
})

test('succeeds if the list is less', t => {
  const params = {
    attributes: {
      list: [1]
    }
  }

  t.true(
    evaluator.formula(
      f({ a: 'list', k: 'list', c: 'listSizeIsLess', v: 2 }),
      params
    )
  )
})

test('succeeds if the list is less or equal', t => {
  const params = {
    attributes: {
      list: [1]
    }
  }

  t.true(
    evaluator.formula(
      f({ a: 'list', k: 'list', c: 'listSizeIsLessOrEqual', v: 1 }),
      params
    )
  )
})

test('succeeds if the weekday is equal', t => {
  const params = {
    weekday: 4
  }

  t.true(evaluator.formula(f({ k: 'weekday', c: 'equals', v: '4' }), params))
  t.false(evaluator.formula(f({ k: 'weekday', c: 'equals', v: 4 }), params)) // TODO make it succeed
  t.false(evaluator.formula(f({ k: 'weekday', c: 'equals', v: '1' }), params))
})

test('succeeds if the hour is greater or equal', t => {
  const params = {
    hour: 14
  }

  t.true(
    evaluator.formula(f({ k: 'hour', c: 'isGreaterOrEqual', v: 14 }), params)
  )
  t.true(
    evaluator.formula(f({ k: 'hour', c: 'isGreaterOrEqual', v: 0 }), params)
  )
  t.false(
    evaluator.formula(f({ k: 'hour', c: 'isGreaterOrEqual', v: 20 }), params)
  )
})

test('succeeds if the hour is less or equal', t => {
  const p = {
    hour: 12
  }

  t.true(evaluator.formula(f({ k: 'hour', c: 'isLessOrEqual', v: 12 }), p))
  t.true(evaluator.formula(f({ k: 'hour', c: 'isLessOrEqual', v: 23 }), p))
  t.false(evaluator.formula(f({ k: 'hour', c: 'isLessOrEqual', v: 10 }), p))
})

test('succeeds if the hour is given as string', t => {
  const p = {
    hour: 12
  }

  t.true(evaluator.formula(f({ k: 'hour', c: 'isLessOrEqual', v: 23 }), p))
  t.true(evaluator.formula(f({ k: 'hour', c: 'isLessOrEqual', v: '23' }), p))
})
