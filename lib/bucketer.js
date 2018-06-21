const SEED = 1
const MAX_HASH_VALUE = Math.pow(2, 32)

const murmurhash = require('lib/util/murmurhash')

// TODO: should the mapping be cached?

module.exports.pickVariant = (experiment, opts) => {
  const { steps, id, hasCustomVariantDistribution } = experiment
  const { distributionKey, stepId } = opts

  if (stepId == null) {
    throw Error('not yet implemented') // TODO
  }
  const { variants } = steps[stepId]

  if (variants.length === 1) {
    return variants[0]
  }

  let sum = 0
  let from = 0
  let to = 0

  const weights = variants.map((variant, index) => {
    if (variant.correctedWeight != null) {
      from = sum
      sum += variant.correctedWeight
      to = sum
    } else if (hasCustomVariantDistribution) {
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

  let random = sum
  if (distributionKey != null) {
    const key = [id, distributionKey].join(':')
    const hash = murmurhash(key, SEED) / MAX_HASH_VALUE
    random *= hash
  } else {
    random *= Math.random()
  }

  for (let i = 0; i < weights.length; i++) {
    const { from, to, variant } = weights[i]

    if (from <= random && random < to) {
      return variant
    }
  }
}
