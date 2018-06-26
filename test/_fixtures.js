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
    this.event = null
    this.name = 'Variant 0'
    this.targeting = [new TokenBuilder().build()]
    this.type = 'original'
    this.weight = null
    this.id = 'v0'

    super.init()
  }
}

class StepBuilder extends BaseBuilder {
  constructor() {
    super()

    this.entry = true
    this.id = 's0'
    this.tokens = []
    this.variants = [new VariantBuilder().build()]

    super.init()
  }
}
class TokenBuilder extends BaseBuilder {
  constructor() {
    super()

    this.type = 1
    this.rule = new RuleBuilder().build()

    super.init()
  }
}
class RuleBuilder extends BaseBuilder {
  constructor() {
    super()

    this.conditions = []
    this.match = 'any'
    this.id = 'r0'

    super.init()
  }

  withCondition(condition) {
    this.conditions.push(condition)
    return this
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
    this.attribute = null
    this.comparator = null
    this.value = null

    super.init()
  }
}

class ExperimentBuilder extends BaseBuilder {
  constructor() {
    super()

    this.hasCustomVariantDistribution = false
    this.id = 'e0'
    this.name = 'Server-Side'
    this.prioritization = 4
    this.status = 'active'
    this.steps = [new StepBuilder().build()]
    this.targeting = []
    this.trafficAllocation = 1
    this.type = 'server-side'
    this.variantTargetingActive = false

    super.init()
  }

  withUrlTargeting(url) {
    const rule = RuleBuilder.createUrlRule(url)

    return this.withTargeting([{ type: 1, rule }])
  }
}

module.exports = {
  ExperimentBuilder,
  StepBuilder,
  VariantBuilder,
  TokenBuilder,
  ConditionBuilder
}
