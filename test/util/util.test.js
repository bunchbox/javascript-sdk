require('rootpath')()

const test = require('ava')
const { inspect } = require('util')

const { isNumber, isBoolean, isObject } = require('lib/util/is-type')

test('isBoolean should pass', t => {
  for (let b of [true, false, new Boolean()]) {
    t.true(isBoolean(b), `${inspect(b)} was not detected as boolean`)
  }
})

test('isBoolean should fail', t => {
  for (let b of [2, '12.31', { foo: 'bar' }, function() {}, /asd/, []]) {
    t.false(isBoolean(b), `${inspect(b)} was detected as boolean`)
  }
})

test('isNumber should pass', t => {
  for (let n of [1, 1.2, 1e7, new Number(2)]) {
    t.true(isNumber(n), `${inspect(n)} was not detected as number`)
  }
})

test('isNumber should fail', t => {
  for (let n of ['2', '12.31', { foo: 'bar' }, function() {}, /asd/, [], NaN]) {
    t.false(isNumber(n), `${inspect(n)} was detected as number`)
  }
})

test('isObject should pass', t => {
  for (let o of [{}, { length: 1 }, new Object()]) {
    t.true(isObject(o), `${inspect(o)} was not detected as object`)
  }
})

test('isObject should fail', t => {
  for (let o of [1.0, Error(), [], 'foobar', function() {}]) {
    t.false(isObject(o), `${inspect(o)} was detected as object`)
  }
})
