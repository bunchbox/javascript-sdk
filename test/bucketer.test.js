require('rootpath')()

const test = require('ava')

const bucketer = require('lib/bucketer')

test('chooses the only available variant', t => {
  const experiment = {
    id: 1,
    steps: [{ id: '0', variants: [{ id: 99 }] }]
  }

  const variant = bucketer.pickVariant(experiment, {
    stepId: '0',
    distributionKey: 'does_not_matter_here'
  })

  t.is(variant.id, 99)
})

test('hashes the userId to deterministically pick variant', t => {
  const experiment = {
    id: 1,
    hasCustomVariantDistribution: false,
    steps: [{ id: '0', variants: [{ id: 1 }, { id: 2 }, { id: 3 }] }]
  }

  const variant = bucketer.pickVariant(experiment, {
    stepId: '0',
    distributionKey: 'this_key_always_picks_1'
  })

  t.is(variant.id, 1)
})

test('hashes the userId to deterministically pick an manually weighted variant', t => {
  const experiment = {
    id: 1,
    hasCustomVariantDistribution: true,
    steps: [
      {
        id: '0',
        variants: [
          { id: 1, weight: 1 },
          { id: 2, weight: 1 },
          { id: 3, weight: 98 }
        ]
      }
    ]
  }

  for (let userId of ['$userId', 'foo', 'bar', '123']) {
    const variant = bucketer.pickVariant(experiment, {
      stepId: '0',
      distributionKey: userId
    })

    t.is(variant.id, 3)
  }
})
