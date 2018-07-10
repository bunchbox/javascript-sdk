const assert = require('assert')

const { isObject } = require('lib/util/is-type')
const { Failure } = require('lib/util/error')

const murmurhash = require('lib/util/murmurhash')

module.exports.pickVariant = (experiment, opts) => {
  assert(isObject(experiment), 'experiment must be an object')
  assert(isObject(opts), 'opts must be an object')
  assert(opts.stepId, 'opts.stepId is required')
  assert(opts.distributionKey, 'opts.distributionKey is required')

  const { steps, id, hasCustomVariantDistribution } = experiment
  const { distributionKey, stepId } = opts

  const step = steps.find(s => s.id === stepId)
  if (step == null) throw new Failure(`Step ${stepId} not found`)
  const { variants } = step

  if (variants.length === 1) {
    return variants[0]
  }

  let sum = 0
  const weights = variants.map((variant, index) => {
    let from, to

    if (hasCustomVariantDistribution) {
      from = sum
      sum += variant.weight
      to = sum
    } else {
      from = index * (1 / variants.length)
      to = (index + 1) * (1 / variants.length)
      sum = 1
    }

    return { variant, from, to }
  })

  const key = [id, stepId, distributionKey].join(':')
  const result = sum * murmurhash.random(key)

  for (let i = 0; i < weights.length; i++) {
    const { from, to, variant } = weights[i]

    if (from <= result && result < to) {
      return variant
    }
  }

  throw Error('unreachable')
}

module.exports.isAllocated = (experiment, distributionKey) => {
  assert(isObject(experiment), 'experiment must be an object')
  assert(distributionKey, 'distributionKey is required')

  const allocation = experiment.trafficAllocation
  const key = [experiment.id, distributionKey].join(':')

  return murmurhash.random(key) <= allocation
}
