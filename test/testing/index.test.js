require('rootpath')()

const test = require('ava')

const testing = require('lib/testing')
const {
  ExperimentBuilder,
  StepBuilder,
  VariantBuilder
} = require('test/_fixtures')

function log() {
  const { inspect } = require('util')

  const args = Array.from(arguments).map(arg =>
    inspect(arg, { colors: true, depth: null })
  )

  console.log.apply(console, args)
}

test('throws if no userId is passed', t => {
  const experiment = new ExperimentBuilder().build()

  const error = t.throws(() => testing.assignUser(experiment, null, null))

  t.is(error.message, 'distributionKey is required')
})

test('assigns a user if the experiment targeting matches', t => {
  const experiment = new ExperimentBuilder()
    .withUrlTargeting('https://example.com')
    .withSteps([
      new StepBuilder()
        .withVariants([new VariantBuilder().withId('v0').build()])
        .build()
    ])
    .build()

  const variant = testing.assignUser(experiment, 0, '$userId', {
    url: 'https://example.com'
  })

  t.is(variant.id, 'v0')
})

test('throwsif the experiment targeting does not match', t => {
  const experiment = new ExperimentBuilder()
    .withUrlTargeting('https://example.com')
    .build()

  const error = t.throws(() => {
    testing.assignUser(experiment, 0, '$userId', { url: null })
  }, Error)

  t.is(error.message, 'Experiment targeting did not match')
})

test('picks step with matching targeting if no stepIndex is given', t => {
  const experiment = new ExperimentBuilder()
    .withUrlTargeting('https://example.com')
    .withSteps([
      new StepBuilder()
        .withId('s0')
        .withUrlTargeting('https://different.com')
        .withVariants([new VariantBuilder().withId('v00').build()])
        .build(),
      new StepBuilder()
        .withId('s1')
        .withUrlTargeting('https://example.com')
        .withVariants([new VariantBuilder().withId('v10').build()])
        .build()
    ])
    .build()

  const variant = testing.assignUser(experiment, null, '$userId', {
    url: 'https://example.com'
  })

  t.is(variant.id, 'v10')
})

test('picks step accordingly to the given stepIndex even though the step targeting does not match', t => {
  const experiment = new ExperimentBuilder()
    .withUrlTargeting('https://example.com')
    .withSteps([
      new StepBuilder()
        .withId('s0')
        .withUrlTargeting('https://example.com')
        .withVariants([new VariantBuilder().withId('v00').build()])
        .build(),
      new StepBuilder()
        .withId('s1')
        .withUrlTargeting('https://different.com')
        .withVariants([new VariantBuilder().withId('v10').build()])
        .build()
    ])
    .build()

  const variant = testing.assignUser(experiment, 1, '$userId', {
    url: 'https://example.com'
  })

  t.is(variant.id, 'v10')
})

test('Allows multiple steps w/o targetings if a stepIndex is given', t => {
  const experiment = new ExperimentBuilder()
    .withSteps([
      new StepBuilder()
        .withId('s0')
        .withVariants([new VariantBuilder().withId('v00').build()])
        .build(),
      new StepBuilder()
        .withId('s1')
        .withVariants([new VariantBuilder().withId('v10').build()])
        .build()
    ])
    .build()

  const variant = testing.assignUser(experiment, 1, '$userId')

  t.is(variant.id, 'v10')
})

test('Falls back to the first step if no stepIndex is given', t => {
  const experiment = new ExperimentBuilder()
    .withSteps([
      new StepBuilder()
        .withId('s0')
        .withVariants([new VariantBuilder().withId('v00').build()])
        .build(),
      new StepBuilder()
        .withId('s1')
        .withVariants([new VariantBuilder().withId('v10').build()])
        .build()
    ])
    .build()

  const variant = testing.assignUser(experiment, null, '$userId')

  t.is(variant.id, 'v00')
})

test('throws if no step targeting matches', t => {
  const experiment = new ExperimentBuilder()
    .withUrlTargeting('https://foobar.io')
    .withSteps([
      new StepBuilder()
        .withId('s0')
        .withUrlTargeting('https://example.com')
        .withVariants([new VariantBuilder().withId('v00').build()])
        .build(),
      new StepBuilder()
        .withId('s1')
        .withUrlTargeting('https://different.com')
        .withVariants([new VariantBuilder().withId('v10').build()])
        .build()
    ])
    .build()

  const error = t.throws(() =>
    testing.assignUser(experiment, null, '$userId', {
      url: 'https://foobar.io'
    })
  )

  t.is(error.message, 'Experiment step targeting did not match')
})

test('picks the first matching step if multiple step targetings match', t => {
  const experiment = new ExperimentBuilder()
    .withUrlTargeting('https://match.com')
    .withSteps([
      new StepBuilder()
        .withId('s0')
        .withUrlTargeting('https://example.com')
        .withVariants([new VariantBuilder().withId('v00').build()])
        .build(),
      new StepBuilder()
        .withId('s1')
        .withUrlTargeting('https://match.com')
        .withVariants([new VariantBuilder().withId('v10').build()])
        .build(),
      new StepBuilder()
        .withId('s2')
        .withUrlTargeting('https://match.com')
        .withVariants([new VariantBuilder().withId('v20').build()])
        .build()
    ])
    .build()

  const variant = testing.assignUser(experiment, null, '$userId', {
    url: 'https://match.com'
  })

  t.is(variant.id, 'v10')
})

test('throws if no step exits at the given stepIndex', t => {
  const experiment = new ExperimentBuilder()
    .withSteps([new StepBuilder().build()])
    .build()

  const error = t.throws(() => testing.assignUser(experiment, 2, '$userId'))

  t.is(error.message, 'Step at index 2 does not exist')
})
