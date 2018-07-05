const { isNumber } = require('lib/util/is-type')
const dotize = require('lib/util/dotize')

const bucketer = require('./bucketer')
const evaluator = require('./evaluator')
const keys = require('./keys')

function assertParamsAreAvailable(tokens, params) {
  const misssingTargetingParams = []

  for (const token of tokens.filter(evaluator.isRuleToken)) {
    for (const condition of token.rule.conditions) {
      const [head] = condition.key.split('.')

      // QueryParameters seperately: since it is not knwon in advance which
      // parameters exist the validation only requires the top-level objects
      // (urlParameters / referrerParameters) to exist.

      if (keys.isQueryParameter(head)) {
        if (params[head] == null) misssingTargetingParams.push(head)
        continue
      }

      if (dotize.find(params, condition.key) == null) {
        misssingTargetingParams.push(condition.key)
      }
    }
  }

  if (misssingTargetingParams.length > 0) {
    throw Error(
      'Targeting cannot match ' +
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
      const strict = !(
        experiment.steps.length === 1 && step.tokens.length === 0
      )

      if (strict) assertParamsAreAvailable(step.tokens, params)

      return evaluator.formula(step.tokens, params || {}, strict)
    })

    if (matchingSteps.length < 1)
      throw Error('Experiment step targeting did not match')

    if (matchingSteps.length > 1)
      console.log('multiple steps matched. picking the first one')

    return matchingSteps[0].id
  }

  return experiment.steps[0].id
}

function insertDefaultParams(params) {
  return Object.assign(
    {
      weekday: new Date().getDay(),
      hour: new Date().getHours()
    },
    params
  )
}

module.exports.normalizeCondtion = condition => {
  let { key, parameter } = condition

  if (keys.isCustomAttributeKey(condition.key)) {
    key = `attributes.${condition.key}`
  } else if (keys.isQueryParameter(condition.key)) {
    key = `${condition.key}.${condition.parameter}`
    parameter = null
  }

  return Object.assign({}, condition, { key, parameter })
}

module.exports.isCustomAttributeKey = keys.isCustomAttributeKey

module.exports.isQueryParameter = keys.isQueryParameter

module.exports.assignUser = (experiment, stepIndex, userId, params = {}) => {
  // TODO assert required arguments

  if (!bucketer.isAllocated(experiment, userId))
    throw Error('User is excluded from participating in the experiment')

  params = insertDefaultParams(params)

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
