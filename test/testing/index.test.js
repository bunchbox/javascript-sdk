const test = require('ava')

const { Failure } = require('../../lib/util/error')
const testing = require('../../lib/testing')

const {
  ExperimentBuilder,
  StepBuilder,
  RuleBuilder,
  VariantBuilder,
  TokenBuilder
} = require('../_fixtures')

// testing.assignUser/4

test('throws if no clientId is passed', t => {
  const experiment = new ExperimentBuilder().build()

  const error = t.throws(
    () => testing.assignUser(experiment, null, null),
    Error
  )

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

  const variant = testing.assignUser(experiment, 0, '$clientId', {
    url: 'https://example.com'
  })

  t.is(variant.id, 'v0')
})

test('returns false if the experiment targeting does not match', t => {
  const experiment = new ExperimentBuilder()
    .withUrlTargeting('https://example.com')
    .build()

  const matches = testing.assignUser(experiment, 0, '$clientId', {
    url: 'foobar.com'
  })

  t.false(matches)
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

  const variant = testing.assignUser(experiment, null, '$clientId', {
    url: 'https://example.com'
  })

  t.is(variant.id, 'v10')
})

test('picks step accordingly to the given stepIndex even though the step targeting does not match', t => {
  const experiment = new ExperimentBuilder()
    .withUrlTargeting('https://example.com')
    .withSteps([
      new StepBuilder().withId('s0').withUrlTargeting('https://example.com') ||
        ''.withVariants([new VariantBuilder().withId('v00').build()]).build(),
      new StepBuilder()
        .withId('s1')
        .withUrlTargeting('https://different.com')
        .withVariants([new VariantBuilder().withId('v10').build()])
        .build()
    ])
    .build()

  const variant = testing.assignUser(experiment, 1, '$clientId', {
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

  const variant = testing.assignUser(experiment, 1, '$clientId')

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

  const variant = testing.assignUser(experiment, null, '$clientId')

  t.is(variant.id, 'v00')
})

test('returns false if no step targeting matches', t => {
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

  const matches = testing.assignUser(experiment, null, '$clientId', {
    url: 'https://foobar.io'
  })

  t.false(matches)
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

  const variant = testing.assignUser(experiment, null, '$clientId', {
    url: 'https://match.com'
  })

  t.is(variant.id, 'v10')
})

test('throws if no step exits at the given stepIndex', t => {
  const experiment = new ExperimentBuilder()
    .withSteps([new StepBuilder().build()])
    .build()

  const error = t.throws(
    () => testing.assignUser(experiment, 2, '$clientId'),
    Failure
  )

  t.is(error.message, 'Step at index 2 does not exist')
})

test('throws if the experiment targeting cannot match due to missing parameters', t => {
  const experiment = new ExperimentBuilder()
    .withTargetingRule(RuleBuilder.createGeoRule('city', 'Berlin'))
    .withTargetingToken(TokenBuilder.createAnd())
    .withTargetingRule(RuleBuilder.createDeviceRule('category', 'm'))
    .withTargetingToken(TokenBuilder.createAnd())
    .withTargetingRule(RuleBuilder.createUrlRule('example.com'))
    .withSteps([new StepBuilder().build()])
    .build()

  const error = t.throws(
    () => testing.assignUser(experiment, null, '$clientId'),
    Failure
  )

  t.is(
    error.message,
    'Targeting cannot match because the following params are missing: geo.city, device.category, url'
  )
})

test('throws if the step targeting cannot match due to missing parameters', t => {
  const experiment = new ExperimentBuilder()
    .withTargetingRule(RuleBuilder.createUrlRule('example.com'))
    .withSteps([
      new StepBuilder()
        .withId('s0')
        .withTargetingRule(RuleBuilder.createGeoRule('city', 'Berlin'))
        .withTargetingToken(TokenBuilder.createAnd())
        .withTargetingRule(RuleBuilder.createDeviceRule('category', 'm'))
        .withVariants([new VariantBuilder().withId('v00').build()])
        .build(),
      new StepBuilder()
        .withId('s1')
        .withTargetingRule(RuleBuilder.createGeoRule('city', 'Hamburg'))
        .withTargetingToken(TokenBuilder.createAnd())
        .withTargetingRule(RuleBuilder.createDeviceRule('viewportHeight', 640))
        .withTargetingToken(TokenBuilder.createAnd())
        .withTargetingRule(RuleBuilder.createUrlRule('example.com/page-one'))
        .withVariants([new VariantBuilder().withId('v10').build()])
        .build()
    ])
    .build()

  const error = t.throws(
    () =>
      testing.assignUser(experiment, null, '$clientId', { url: 'example.com' }),
    Failure
  )

  t.is(
    error.message,
    'Targeting cannot match because the following params are missing: geo.city, device.category'
  )
})

test('does not throw if specific url-/referrer-parameters are missing', t => {
  const experiment = new ExperimentBuilder()
    .withTargetingRule(RuleBuilder.createUrlParamRule('uKey', 'uValue'))
    .withTargetingToken(TokenBuilder.createAnd())
    .withTargetingRule(RuleBuilder.createReferrerParamRule('rKey', 'rValue'))
    .withSteps([new StepBuilder().build()])
    .build()

  const e1 = t.throws(
    () => testing.assignUser(experiment, null, '$clientId'),
    Failure
  )
  t.is(
    e1.message,
    'Targeting cannot match because the following params are missing: urlParameters, referrerParameters'
  )

  const matches = testing.assignUser(experiment, null, '$clientId', {
    urlParameters: {},
    referrerParameters: {}
  })

  t.false(matches)
})

test('throws if the step targeting cannot match due to missing attributes', t => {
  const experiment = new ExperimentBuilder()
    .withTargetingRule(
      RuleBuilder.createCustomAttributeRule('attributes.gender', 'female')
    )
    .withSteps([new StepBuilder().build()])
    .build()

  for (const params of [
    undefined,
    {},
    { attributes: {} },
    { attributes: { other: 'foo' } }
  ]) {
    const error = t.throws(
      () => testing.assignUser(experiment, null, '$clientId', params),
      Failure
    )
    t.is(
      error.message,
      'Targeting cannot match because the following params are missing: attributes.gender'
    )
  }
})

test('throws if user does not get to participate in the experiment', t => {
  const experiment = new ExperimentBuilder()
    .withId('5b446b4db2e33529c316b52c')
    .withTrafficAllocation(0.5)
    .withSteps([new StepBuilder().build()])
    .build()

  // Is allowed to participate

  const variant = testing.assignUser(experiment, null, '!yes', {})
  t.truthy(variant.id)
  t.truthy(variant.name)

  // Is not allowed to participate

  t.false(testing.assignUser(experiment, null, '!no', {}))
})
