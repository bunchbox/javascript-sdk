require('rootpath')()

const test = require('ava')

const {
  ExperimentBuilder,
  ConditionBuilder,
  StepBuilder,
  RuleBuilder,
  VariantBuilder,
  TokenBuilder,
  GoalBuilder
} = require('test/_fixtures')

const generateObjectId = require('lib/util/object-id')

const validator = require('lib/store/validator')

function createValidTestingFile() {
  const variant = new VariantBuilder()
    .withId(generateObjectId())
    .withTargeting([])
    .build()

  const step = new StepBuilder()
    .withId(generateObjectId())
    .withTokens([])
    .withVariants([variant])
    .build()

  const goal = new GoalBuilder().withId(generateObjectId()).build()

  const experiment = new ExperimentBuilder()
    .withId(generateObjectId())
    .withSteps([step])
    .withGoals([goal])
    .build()

  return {
    account: generateObjectId(),
    version: 1,
    revision: 1,
    experiments: [experiment],
    rules: []
  }
}

test('returns true for a perfectly valid testing file', t => {
  const complete = createValidTestingFile()

  t.true(validator.validateTestingFile(complete))
})

test('throws if an experiment has no steps', t => {
  const incomplete = Object.assign({}, createValidTestingFile())
  incomplete.experiments[0].steps = []

  const error = t.throws(() => validator.validateTestingFile(incomplete))
  t.is(
    error.message,
    'Validation failed:\n- Experiment@' +
      incomplete.experiments[0].id +
      ': steps should NOT have less than 1 items'
  )
})

test('throws if an experiment has steps with no variants', t => {
  const incomplete = Object.assign({}, createValidTestingFile())
  incomplete.experiments[0].steps[0].variants = []

  const error = t.throws(() => validator.validateTestingFile(incomplete))
  t.is(
    error.message,
    'Validation failed:\n- Experiment@' +
      incomplete.experiments[0].id +
      ' | Step@' +
      incomplete.experiments[0].steps[0].id +
      ': variants should NOT have less than 1 items'
  )
})

test('throws if steps must have a targeting', t => {
  const incomplete = Object.assign({}, createValidTestingFile())

  const rule = RuleBuilder.createUrlRule('foo.bar')
  const token = new TokenBuilder().withRule(rule.id).build()

  incomplete.experiments[0].targeting = [token]
  incomplete.rules.push(rule)

  const error = t.throws(() => validator.validateTestingFile(incomplete))
  t.is(
    error.message,
    'Validation failed:\n- Experiment ' +
      incomplete.experiments[0].id +
      '  | Step ' +
      incomplete.experiments[0].steps[0].id +
      ' has no targeting'
  )
})

test('throws if rule(s) is missing', t => {
  const incomplete = Object.assign({}, createValidTestingFile())

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
      "- should have required property 'rules'"
  )
})
