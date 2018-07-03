const generateObjectId = require('lib/util/object-id')

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
      .withKey('urlParameters')
      .withComparator('equals')
      .withParameter(param)
      .withValue(val)
      .build()

    return new RuleBuilder().withCondition(condition).build()
  }

  static createReferrerParamRule(param, val) {
    const condition = new ConditionBuilder()
      .withKey('referrerParameters')
      .withComparator('equals')
      .withParameter(param)
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
    this.attribute = generateObjectId()
    this.comparator = null
    this.parameter = null
    this.value = null

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

module.exports = {
  ConditionBuilder,
  ExperimentBuilder,
  GoalBuilder,
  RuleBuilder,
  StepBuilder,
  TokenBuilder,
  VariantBuilder
}
