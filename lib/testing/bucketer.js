const murmurhash = require('lib/util/murmurhash')

module.exports.pickVariant = (experiment, opts) => {
  const { steps, id, hasCustomVariantDistribution } = experiment
  const { distributionKey, stepId } = opts

  if (stepId == null) throw Error('stepId is required')
  if (distributionKey == null) throw Error('distributionKey is required')

  const step = steps.find(s => s.id === stepId)
  if (step == null) throw Error(`Step ${stepId} not found`)
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
  if (experiment == null) throw Error('experiment is required')
  if (distributionKey == null) throw Error('distributionKey is required')

  const allocation = experiment.trafficAllocation
  const key = [experiment.id, distributionKey].join(':')

  return murmurhash.random(key) <= allocation
}
