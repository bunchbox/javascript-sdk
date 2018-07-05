require('rootpath')()

const test = require('ava')

const Store = require('lib/store')
const { TestingFileBuilder } = require('test/_fixtures')

// store.setTestingFile/1

test('accepts a (valid) testing file', t => {
  const tf = TestingFileBuilder.createValid()
  const store = new Store()

  t.notThrows(() => store.setTestingFile(tf))
  t.deepEqual(store.experiments[0], tf.experiments[0])
})

test('rejects an invalid testing file', t => {
  const tf = TestingFileBuilder.createValid()
  tf.account = null

  const store = new Store()
  const error = t.throws(() => store.setTestingFile(tf))

  t.is(error.message, 'Validation failed:\n- should be string')
})

// store.experiments/0

test('returns experiments whose tokens are populated', t => {
  const tf = TestingFileBuilder.createValid()
  const store = new Store()
  store.setTestingFile(tf)

  t.is(store.experiments.length, tf.experiments.length)

  const populatedExperiments = tf.experiments
  populatedExperiments[1].targeting[0].rule = tf.rules[0]

  t.deepEqual(store.experiments, populatedExperiments)
})

// store.findExperiments/1

test('finds experiments by experimentId', t => {
  const tf = TestingFileBuilder.createValid()
  const store = new Store()
  store.setTestingFile(tf)
  const experimentId = tf.experiments[0].id

  const experiments = store.findExperiments({ experimentId })

  t.deepEqual(experiments, [tf.experiments[0]])
})

test('finds experiments by goalIdentifier', t => {
  const tf = TestingFileBuilder.createValid()
  const store = new Store()
  store.setTestingFile(tf)
  const goalIdentifier = tf.experiments[0].goals[0].identifier

  const experiments = store.findExperiments({ goalIdentifier })

  t.deepEqual(experiments, [tf.experiments[0]])
})

test('returns an empty array if nothing was found', t => {
  const tf = TestingFileBuilder.createValid()
  const store = new Store()
  store.setTestingFile(tf)

  for (const query of [
    { experimentId: 'foo' },
    { goalIdentifier: 'bar' },
    {}
  ]) {
    const experiments = store.findExperiments(query)
    t.deepEqual(experiments, [])
  }
})

// store.findExperiments/2

test('returns a single result via option { single: true }', t => {
  const tf = TestingFileBuilder.createValid()
  const store = new Store()
  store.setTestingFile(tf)
  const experimentId = tf.experiments[0].id

  const experiment = store.findExperiments({ experimentId }, { single: true })

  t.deepEqual(experiment, tf.experiments[0])
})

test('returns undefined if nothing was found (with { single: true })', t => {
  const tf = TestingFileBuilder.createValid()
  const store = new Store()
  store.setTestingFile(tf)

  const experiment = store.findExperiments(
    { experimentId: 'foo' },
    { single: true }
  )

  t.is(experiment, undefined)
})

// store.findRules/1 and store.findRules/2

test('finds a rule by its id', t => {
  const tf = TestingFileBuilder.createValid()
  const store = new Store()
  store.setTestingFile(tf)
  const ruleId = tf.rules[0].id

  const rule = store.findRules({ ruleId }, { single: true })
  t.deepEqual(rule, tf.rules[0])

  const rules = store.findRules({ ruleId })
  t.deepEqual(rules, [tf.rules[0]])
})

test('returns an empty array / undefined if nothing was found', t => {
  const tf = TestingFileBuilder.createValid()
  const store = new Store()
  store.setTestingFile(tf)

  const rule = store.findRules({ ruleId: 'bar' }, { single: true })
  t.deepEqual(rule, undefined)

  const rules = store.findRules({ ruleId: 'bar' })
  t.deepEqual(rules, [])
})
