const test = require('ava')

const generateObjectId = require('../../lib/util/object-id')
const validator = require('../../lib/store/validator')

const {
  RuleBuilder,
  TokenBuilder,
  TestingFileBuilder,
  StepBuilder
} = require('../_fixtures')

// validator.validateTestingFile/1

test('returns true for a perfectly valid testing file', t => {
  const complete = TestingFileBuilder.createValid()

  t.true(validator.validateTestingFile(complete))
})

test('throws if an experiment has no steps', t => {
  const incomplete = TestingFileBuilder.createValid()
  incomplete.experiments[0].steps = []

  const error = t.throws(() => validator.validateTestingFile(incomplete))
  t.is(
    error.message,
    'Validation failed:\n- Experiment@' +
      incomplete.experiments[0].id +
      ': steps should NOT have fewer than 1 items'
  )
})

test('throws if an experiment has steps with no variants', t => {
  const incomplete = TestingFileBuilder.createValid()
  incomplete.experiments[0].steps[0].variants = []

  const error = t.throws(() => validator.validateTestingFile(incomplete))
  t.is(
    error.message,
    'Validation failed:\n- Experiment@' +
      incomplete.experiments[0].id +
      ' | Step@' +
      incomplete.experiments[0].steps[0].id +
      ': variants should NOT have fewer than 1 items'
  )
})

test('throws if steps must have a targeting', t => {
  const tf = TestingFileBuilder.createValid()

  const rule = RuleBuilder.createUrlRule('foo.bar')
  const token = new TokenBuilder().withRule(rule.id).build()

  tf.experiments[0].targeting = [token]
  tf.rules.push(rule)

  // Threre is only 1 Step. All good.
  t.notThrows(() => validator.validateTestingFile(tf))

  // With 2 Steps, step targetings become mandatory.
  tf.experiments[0].steps.push(new StepBuilder().build())

  const error = t.throws(() => validator.validateTestingFile(tf))
  t.is(
    error.message,
    'Validation failed:\n' +
      '- Experiment ' +
      tf.experiments[0].id +
      '  | Step ' +
      tf.experiments[0].steps[0].id +
      ' has no targeting\n' +
      '- Experiment ' +
      tf.experiments[0].id +
      '  | Step ' +
      tf.experiments[0].steps[1].id +
      ' has no targeting'
  )

  // However, if the experiment targeting is removed, step targetings aren't required either.
  tf.experiments[0].targeting = []

  t.notThrows(() => validator.validateTestingFile(tf))
})

test('throws if rule(s) is missing', t => {
  const incomplete = TestingFileBuilder.createValid()

  const t1 = new TokenBuilder().withRule(generateObjectId()).build()
  const t2 = new TokenBuilder().withRule(generateObjectId()).build()
  incomplete.experiments[0].targeting = [t1]
  incomplete.experiments[0].steps[0].tokens = [t2]

  const error = t.throws(() => validator.validateTestingFile(incomplete))
  t.is(
    error.message,
    'Validation failed:\n' +
      '- Rule ' +
      t1.rule +
      ' does not exist\n' +
      '- Rule ' +
      t2.rule +
      ' does not exist'
  )
})

test('throws if the testingFile has missing properties', t => {
  const incomplete = {}

  const error = t.throws(() => validator.validateTestingFile(incomplete))
  t.is(
    error.message,
    'Validation failed:\n' +
      "- should have required property 'account'\n" +
      "- should have required property 'version'\n" +
      "- should have required property 'revision'\n" +
      "- should have required property 'experiments'\n" +
      "- should have required property 'rules'\n" +
      "- should have required property 'segments'"
  )
})
