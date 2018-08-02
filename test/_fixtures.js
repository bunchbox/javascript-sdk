const generateObjectId = require('../lib/util/object-id')
const { isCustomAttributeKey } = require('../lib/testing')

class BaseBuilder {
  init() {
    Object.keys(this).forEach(key => {
      const witherName = `with${key
        .substring(0, 1)
        .toUpperCase()}${key.substring(1)}`
      this[witherName] = value => {
        this[key] = value
        return this
      }
    })
  }

  build() {
    return Object.keys(this)
      .filter(key => typeof this[key] !== 'function')
      .reduce((acc, key) => Object.assign(acc, { [key]: this[key] }), {})
  }
}

class VariantBuilder extends BaseBuilder {
  constructor() {
    super()

    this.active = true
    this.name = 'Variant 0'
    this.targeting = []
    this.type = 'original'
    this.weight = null
    this.id = generateObjectId()

    super.init()
  }
}

class StepBuilder extends BaseBuilder {
  constructor() {
    super()

    this.id = generateObjectId()
    this.tokens = []
    this.variants = [new VariantBuilder().build()]
    this.entry = true

    super.init()
  }

  withUrlTargeting(url) {
    const rule = RuleBuilder.createUrlRule(url)
    return this.withTokens([new TokenBuilder().withRule(rule).build()])
  }

  withTargetingToken(token) {
    return this.withTokens(this.tokens.concat([token]))
  }

  withTargetingRule(rule) {
    return this.withTokens(
      this.tokens.concat([new TokenBuilder().withRule(rule).build()])
    )
  }
}
class TokenBuilder extends BaseBuilder {
  constructor() {
    super()

    this.type = 1
    this.rule = null

    super.init()
  }

  static createAnd() {
    return new TokenBuilder().withType(8).withRule(null)
  }

  static createOr() {
    return new TokenBuilder().withType(16).withRule(null)
  }
}
class RuleBuilder extends BaseBuilder {
  constructor() {
    super()

    this.conditions = []
    this.match = 'any'
    this.id = generateObjectId()

    super.init()
  }

  withCondition(condition) {
    this.conditions.push(condition)
    return this
  }

  static createCustomAttributeRule(key, val) {
    if (!isCustomAttributeKey(key))
      throw Error(`Not a valid cusotm attribute key: ${key} (already taken)`)

    const condition = new ConditionBuilder()
      .withKey(key)
      .withComparator('equals')
      .withValue(val)
      .build()

    return new RuleBuilder().withCondition(condition).build()
  }

  static createGeoRule(type, val) {
    const condition = new ConditionBuilder()
      .withKey(`geo.${type}`)
      .withComparator('equals')
      .withValue(val)
      .build()

    return new RuleBuilder().withCondition(condition).build()
  }

  static createUrlParamRule(param, val) {
    const condition = new ConditionBuilder()
      .withKey(`urlParameters.${param}`)
      .withComparator('equals')
      .withValue(val)
      .build()

    return new RuleBuilder().withCondition(condition).build()
  }

  static createReferrerParamRule(param, val) {
    const condition = new ConditionBuilder()
      .withKey(`referrerParameters.${param}`)
      .withComparator('equals')
      .withValue(val)
      .build()

    return new RuleBuilder().withCondition(condition).build()
  }

  static createDeviceRule(type, val) {
    const condition = new ConditionBuilder()
      .withKey(`device.${type}`)
      .withComparator('equals')
      .withValue(val)
      .build()

    return new RuleBuilder().withCondition(condition).build()
  }

  static createUrlRule(url) {
    const condition = new ConditionBuilder()
      .withKey('url')
      .withComparator('contains')
      .withValue(url)
      .build()

    return new RuleBuilder().withCondition(condition).build()
  }
}
class ConditionBuilder extends BaseBuilder {
  constructor() {
    super()

    this.key = null
    this.comparator = null
    this.value = null
    this.parameter = null

    super.init()
  }
}

class GoalBuilder extends BaseBuilder {
  constructor() {
    super()

    this.active = true
    this.identifier = 'identifier0'
    this.type = 'event'
    this.id = generateObjectId()

    super.init()
  }
}

class ExperimentBuilder extends BaseBuilder {
  constructor() {
    super()

    this.hasCustomVariantDistribution = false
    this.id = generateObjectId()
    this.name = 'Server-Side'
    this.prioritization = 4
    this.status = 'active'
    this.steps = [new StepBuilder().build()]
    this.targeting = []
    this.trafficAllocation = 1
    this.type = 'server-side'
    this.variantTargetingActive = false
    this.goals = []

    super.init()
  }

  withUrlTargeting(url) {
    const rule = RuleBuilder.createUrlRule(url)
    const token = new TokenBuilder().withRule(rule).build()
    return this.withTargeting([token])
  }

  withTargetingToken(token) {
    return this.withTargeting(this.targeting.concat([token]))
  }

  withTargetingRule(rule) {
    return this.withTargeting(
      this.targeting.concat([new TokenBuilder().withRule(rule).build()])
    )
  }
}

class TestingFileBuilder extends BaseBuilder {
  constructor() {
    super()

    this.account = generateObjectId()
    this.version = 1
    this.revision = 1
    this.experiments = []
    this.rules = []
    this.segments = []

    super.init()
  }

  static createValid() {
    // CAVEAT:  Due to the normalization of condtions that happens before
    // storing the testing file, targetings should be build manually. Don't use
    // helpers like RuleBuilder.createUrlParamRule etc.

    // Experiment 1: Basic. No Targeting(s). 1 Step. 1 Goal

    const v1 = new VariantBuilder()
      .withId(generateObjectId())
      .withTargeting([])
      .build()

    const s1 = new StepBuilder()
      .withId(generateObjectId())
      .withTokens([])
      .withVariants([v1])
      .build()

    const g1 = new GoalBuilder().withId(generateObjectId()).build()

    const e1 = new ExperimentBuilder()
      .withId(generateObjectId())
      .withSteps([s1])
      .withGoals([g1])
      .build()

    // Experiment 2: With Experiment Targeting (Geo). 1 Step. 0 Goals.

    const v2 = new VariantBuilder()
      .withId(generateObjectId())
      .withTargeting([])
      .build()

    const s2 = new StepBuilder()
      .withId(generateObjectId())
      .withTokens([])
      .withVariants([v2])
      .build()

    const r1 = RuleBuilder.createGeoRule('city', 'Seattle')

    const e2 = new ExperimentBuilder()
      .withId(generateObjectId())
      .withTargetingRule(r1.id)
      .withSteps([s2])
      .withGoals([])
      .build()

    // Build

    return new TestingFileBuilder()
      .withExperiments([e1, e2])
      .withRules([r1])
      .build()
  }
}

module.exports = {
  ConditionBuilder,
  ExperimentBuilder,
  GoalBuilder,
  RuleBuilder,
  StepBuilder,
  TestingFileBuilder,
  TokenBuilder,
  VariantBuilder
}
