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
          {
            attribute: 'foo',
            key: 'gender',
            comparator: 'equals',
            value: 'female'
          },
          { key: 'url', comparator: 'contains', value: 'http' },
          { key: 'url', comparator: 'contains', value: ':' }
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
          {
            attribute: 'foo',
            key: 'gender',
            comparator: 'equals',
            value: 'female'
          },
          { key: 'url', comparator: 'contains', value: 'http' },
          { key: 'url', comparator: 'contains', value: ':' }
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
      {
        attribute: 'foo',
        key: 'gender',
        comparator: 'equals',
        value: 'female'
      },
      { key: 'url', comparator: 'contains', value: 'http' },
      { key: 'url', comparator: 'contains', value: ':' }
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
      {
        attribute: 'foo',
        key: 'gender',
        comparator: 'equals',
        value: 'female'
      },
      { key: 'url', comparator: 'contains', value: Math.random() }
    ]
  }

  t.true(evaluator.formula([{ type: 1, rule }], params))
})

test('fails if no condition evaluates to true', t => {
  const rule = {
    match: 'any',
    conditions: [
      {
        attribute: 'foo',
        key: 'gender',
        comparator: 'equals',
        value: 'female'
      },
      { attribute: 'foo', key: 'gender', comparator: 'equals', value: 'male' },
      { attribute: 'foo', key: 'gender', comparator: 'equals', value: 'unisex' }
    ]
  }

  t.false(evaluator.formula([{ type: 1, rule }]))
})

test('should evaluate string comparators', t => {
  const ua = { userAgent: 'foo' }
  t.true(
    evaluator.formula(
      f({ key: 'userAgent', comparator: 'begins', value: 'F' }),
      ua
    )
  )
  t.false(
    evaluator.formula(
      f({ key: 'userAgent', comparator: 'begins', value: 'B' }),
      ua
    )
  )

  const cookie = { cookie: 'foo' }
  t.true(
    evaluator.formula(
      f({ key: 'cookie', comparator: 'ends', value: 'oo' }),
      cookie
    )
  )
  t.false(
    evaluator.formula(
      f({ key: 'cookie', comparator: 'ends', value: 'f' }),
      cookie
    )
  )

  const ref = { referrer: 'bar' }
  t.true(
    evaluator.formula(
      f({ key: 'referrer', comparator: 'regex', value: /a/ }),
      ref
    )
  )
  t.false(
    evaluator.formula(
      f({ key: 'referrer', comparator: 'regex', value: /^a$/ }),
      ref
    )
  )
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
    { key: 'device.os', comparator: 'equals', value: 'Windows' },
    { key: 'device.browser', comparator: 'contains', value: 'rom' },
    { key: 'device.category', comparator: 'regex', value: /d/ },
    { key: 'device.viewportHeight', comparator: 'isGreater', value: 99 },
    { key: 'device.viewportWidth', comparator: 'isLess', value: 101 }
  ]

  const failing_conditions = [
    { key: 'device.os', comparator: 'equals', value: 'MacOS' },
    { key: 'device.browser', comparator: 'contains', value: 'IE' },
    { key: 'device.category', comparator: 'regex', value: /m/ },
    { key: 'device.viewportHeight', comparator: 'isGreater', value: 100 },
    { key: 'device.viewportWidth', comparator: 'isLess', value: 0 }
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
    {
      key: 'urlParameters',
      parameter: 'foo',
      comparator: 'notRegex',
      value: /barbar/
    },
    {
      key: 'referrerParameters',
      parameter: 'foo',
      comparator: 'notRegex',
      value: /barbar/
    },
    { key: 'referrerParameters', parameter: 'asdf', comparator: 'doesNotExist' }
  ]

  const failing_conditions = [
    { key: 'urlParameters', parameter: 'bar', comparator: 'doesNotExist' }
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
    { key: 'geo.ip', comparator: 'equals', value: '42.42.42.42' },
    { key: 'geo.country', comparator: 'equals', value: 'Mali' },
    { key: 'geo.countryCode', comparator: 'equals', value: 'ML' },
    { key: 'geo.city', comparator: 'doesNotContain', value: 'Berlin' }
  ]

  const failing_conditions = [
    { key: 'geo.ip', comparator: 'equals', value: '42.42.42.0' }
  ]

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
    { attribute: 1, key: 'truthy', comparator: 'isTrue' },
    { attribute: 2, key: 'falsy', comparator: 'isFalse' },
    { attribute: 3, key: 'list', comparator: 'listContains', value: 3 }
  ]

  const failing_conditions = [
    { attribute: 3, key: 'list', comparator: 'listContains', value: 4 }
  ]

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
      object: { attribute: 'b' },
      fn: function() {},
      list: [1, 2, 3, 4]
    }
  }

  const matching_conditions = [
    {
      attribute: 'list',
      key: 'list',
      comparator: 'listSizeIsGreater',
      value: 3
    },
    {
      attribute: 'list',
      key: 'list',
      comparator: 'listSizeIsGreaterOrEqual',
      value: 4
    },
    { attribute: 'list', key: 'list', comparator: 'listSizeIsLess', value: 6 },
    {
      attribute: 'list',
      key: 'list',
      comparator: 'listSizeIsLessOrEqual',
      value: 4
    }
  ]

  const failing_conditions = [
    {
      attribute: 'undefined',
      key: 'undefined',
      comparator: 'listSizeIsGreater',
      value: 5
    },
    {
      attribute: 'null',
      key: 'null',
      comparator: 'listSizeIsGreater',
      value: 5
    },
    {
      attribute: 'number',
      key: 'number',
      comparator: 'listSizeIsGreater',
      value: 5
    },
    {
      attribute: 'string',
      key: 'string',
      comparator: 'listSizeIsGreater',
      value: 5
    },
    {
      attribute: 'bool',
      key: 'bool',
      comparator: 'listSizeIsGreater',
      value: 5
    },
    {
      attribute: 'object',
      key: 'object',
      comparator: 'listSizeIsGreater',
      value: 5
    },
    { attribute: 'fn', key: 'fn', comparator: 'listSizeIsGreater', value: 5 }
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
    { attribute: 'b' },
    function() {},
    1000000
  ]

  for (let value of values) {
    const expected = value === 1000000 ? 'true' : 'false'

    t[expected](
      evaluator.formula(
        f({
          attribute: 'list',
          key: 'list',
          comparator: 'listSizeIsLess',
          value: value
        }),
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
      f({
        attribute: 'list',
        key: 'list',
        comparator: 'listSizeIsGreater',
        value: 0
      }),
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
      f({
        attribute: 'list',
        key: 'list',
        comparator: 'listSizeIsGreaterOrEqual',
        value: 1
      }),
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
      f({
        attribute: 'list',
        key: 'list',
        comparator: 'listSizeIsLess',
        value: 2
      }),
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
      f({
        attribute: 'list',
        key: 'list',
        comparator: 'listSizeIsLessOrEqual',
        value: 1
      }),
      params
    )
  )
})

test('succeeds if the weekday is equal', t => {
  const params = {
    weekday: 4
  }

  t.true(
    evaluator.formula(
      f({ key: 'weekday', comparator: 'equals', value: '4' }),
      params
    )
  )
  t.false(
    evaluator.formula(
      f({ key: 'weekday', comparator: 'equals', value: 4 }),
      params
    )
  ) // TODO make it succeed
  t.false(
    evaluator.formula(
      f({ key: 'weekday', comparator: 'equals', value: '1' }),
      params
    )
  )
})

test('succeeds if the hour is greater or equal', t => {
  const params = {
    hour: 14
  }

  t.true(
    evaluator.formula(
      f({ key: 'hour', comparator: 'isGreaterOrEqual', value: 14 }),
      params
    )
  )
  t.true(
    evaluator.formula(
      f({ key: 'hour', comparator: 'isGreaterOrEqual', value: 0 }),
      params
    )
  )
  t.false(
    evaluator.formula(
      f({ key: 'hour', comparator: 'isGreaterOrEqual', value: 20 }),
      params
    )
  )
})

test('succeeds if the hour is less or equal', t => {
  const p = {
    hour: 12
  }

  t.true(
    evaluator.formula(
      f({ key: 'hour', comparator: 'isLessOrEqual', value: 12 }),
      p
    )
  )
  t.true(
    evaluator.formula(
      f({ key: 'hour', comparator: 'isLessOrEqual', value: 23 }),
      p
    )
  )
  t.false(
    evaluator.formula(
      f({ key: 'hour', comparator: 'isLessOrEqual', value: 10 }),
      p
    )
  )
})

test('succeeds if the hour is given as string', t => {
  const p = {
    hour: 12
  }

  t.true(
    evaluator.formula(
      f({ key: 'hour', comparator: 'isLessOrEqual', value: 23 }),
      p
    )
  )
  t.true(
    evaluator.formula(
      f({ key: 'hour', comparator: 'isLessOrEqual', value: '23' }),
      p
    )
  )
})
