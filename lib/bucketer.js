const { hash, MAX_HASH_VALUE } = require('lib/util/murmurhash')

const SEED = 1

// TODO: should the mapping be cached?

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

  const key = [id, distributionKey].join(':')
  const random = sum * (hash(key, SEED) / MAX_HASH_VALUE)

  for (let i = 0; i < weights.length; i++) {
    const { from, to, variant } = weights[i]

    if (from <= random && random < to) {
      return variant
    }
  }
}
