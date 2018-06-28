require('rootpath')()

const test = require('ava')

const bucketer = require('lib/testing/bucketer')

// bucketer.pickVariant/2

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
    distributionKey: 'this_always_picks_2'
  })

  t.is(variant.id, 2)
})

test('picks always the same variant for a step', t => {
  const experiment = {
    id: 1,
    hasCustomVariantDistribution: false,
    steps: [
      { id: '0', variants: [{ id: '01' }, { id: '02' }, { id: '03' }] },
      { id: '1', variants: [{ id: '11' }, { id: '12' }, { id: '13' }] }
    ]
  }

  const distributionKey = '$userId'

  const v1 = bucketer.pickVariant(experiment, {
    stepId: '0',
    distributionKey
  })

  const v2 = bucketer.pickVariant(experiment, {
    stepId: '1',
    distributionKey
  })

  t.is(v1.id, '03')
  t.is(v2.id, '11')
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

test('requires the distributionKey and stepId', t => {
  const exp = {
    id: 1,
    hasCustomVariantDistribution: true,
    steps: []
  }

  const e1 = t.throws(() => bucketer.pickVariant(exp, { stepId: 1 }))
  t.is(e1.message, 'distributionKey is required')

  const e2 = t.throws(() => bucketer.pickVariant(exp, { distributionKey: 'k' }))
  t.is(e2.message, 'stepId is required')
})

// bucketer.isAllocated/2

test('always allocates a user to an experiment if the trafficAllocation is 1.0', t => {
  const isAllocated = bucketer.isAllocated(
    { id: 'eId', trafficAllocation: 1.0 },
    `userId:${Math.random()}`
  )

  t.true(isAllocated)
})

test('never allocates a user to an experiment if the trafficAllocation is 0', t => {
  const isAllocated = bucketer.isAllocated(
    { id: 'eId', trafficAllocation: 0.0 },
    `userId:${Math.random()}`
  )

  t.false(isAllocated)
})

test('allocations stay stable', t => {
  const experiment = {
    id: 'eId778',
    trafficAllocation: 0.2
  }

  const isAllocated_u1 = bucketer.isAllocated(experiment, 'is_allocated')
  t.true(isAllocated_u1)

  const isAllocated_u2 = bucketer.isAllocated(experiment, 'is_not_allocated')
  t.false(isAllocated_u2)
})

test('allocaton depends only on the experiment id', t => {
  for (let [id, expected] of [['eId44', true], ['eId122', false]]) {
    for (let stepId of ['s1', 's2', 's3', 's4']) {
      const experiment = {
        id,
        steps: [{ id: stepId, variants: [{ id: `v:${stepId}` }] }],
        trafficAllocation: 0.05
      }

      t[expected](bucketer.isAllocated(experiment, 'is_allocated'))
    }
  }
})

test('requires the distributionKey', t => {
  const error = t.throws(() =>
    bucketer.isAllocated({ id: 'eId', trafficAllocation: 0.5 }, null)
  )

  t.is(error.message, 'distributionKey is required')
})
