const { isNumber, isObject } = require('lib/util/is-type')
const evaluator = require('./evaluator')
const bucketer = require('./bucketer')

function assertParamsAreAvailable(tokens, params) {
  const misssingTargetingParams = []

  for (const token of tokens.filter(t => t.type === 1)) {
    for (const condition of token.rule.conditions) {
      const param = condition.key
        .split('.')
        .reduce((acc, k) => (isObject(acc) ? acc[k] : acc), params)

      if (param == null) misssingTargetingParams.push(condition.key)
    }
  }

  if (misssingTargetingParams.length > 0) {
    throw Error(
      'Targeting cannot match' +
        'because the following params are missing: ' +
        misssingTargetingParams.join(', ')
    )
  }

  return true
}

function pickStep(experiment, stepIndex, params) {
  if (isNumber(stepIndex)) {
    const step = experiment.steps[stepIndex]
    if (step == null) throw Error(`Step at index ${stepIndex} does not exist`)
    return step.id
  }

  if (
    experiment.targeting.length > 0 &&
    experiment.steps.every(step => step.tokens.length > 0)
  ) {
    const matchingSteps = experiment.steps.filter(step => {
      const success = evaluator.formula(
        step.tokens,
        params || {},
        !(experiment.steps.length === 1 && step.tokens.length === 0)
      )

      if (!success) assertParamsAreAvailable(step.tokens, params)

      return success
    })

    if (matchingSteps.length < 1)
      throw Error('Experiment step targeting did not match')

    if (matchingSteps.length > 1)
      console.log('multiple steps matched. picking the first one')

    return matchingSteps[0].id
  }

  return experiment.steps[0].id
}

module.exports.assignUser = (experiment, stepIndex, userId, params) => {
  if (!evaluator.formula(experiment.targeting, params, false)) {
    if (assertParamsAreAvailable(experiment.targeting, params))
      throw Error('Experiment targeting did not match')
  }

  const stepId = pickStep(experiment, stepIndex, params)

  const variant = bucketer.pickVariant(experiment, {
    distributionKey: userId,
    stepId: stepId
  })

  return variant
}
