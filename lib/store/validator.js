const { inspect } = require('util')

const Ajv = require('ajv')
const ajv = new Ajv({ allErrors: true })

const schema = require('./testing-file-schema')
const validate = ajv.compile(schema)

function validateJsonSchema(data) {
  // TODO translate [0] to experiment.id
  if (!validate(data)) {
    const errors = validate.errors
      .map(err => `- ${err.dataPath} ${err.message}`)
      .join('\n')

    return Error(errors)
  }

  return true
}

function validateConsistency(testingFile) {
  const errors = []

  for (const experiment of testingFile.experiments) {
    const ePrefix = `Experiment ${experiment.id} `

    for (const token of experiment.targeting) {
      if (
        token.rule != null &&
        testingFile.rules.find(r => r.id === token.rule) == null
      )
        errors.push('Rule ' + token.rule + ' does not exist')
    }

    for (const step of experiment.steps) {
      const sPrefix = `${ePrefix} | Step ${step.id} `

      if (experiment.targeting.length > 0 && step.tokens.length === 0)
        errors.push(sPrefix + 'has no targeting')

      for (const token of step.tokens) {
        if (
          token.rule != null &&
          testingFile.rules.find(r => r.id === token.rule) == null
        )
          errors.push('Rule ' + token.rule + ' does not exist')
      }

      for (const variant of step.variants) {
        if (experiment.hasCustomVariantDistribution && variant.weight == null) {
          const msg =
            ePrefix +
            'has a hasCustomVariantDistribution ' +
            `but its Variant ${variant.id} has no weight assigned`

          errors.push(msg)
        }
      }
    }
  }

  if (errors.length > 0) {
    return Error(errors.map(err => `- ${err}`).join('\n'))
  }

  return true
}

module.exports.validateTestingFile = data => {
  for (const validator of [validateJsonSchema, validateConsistency]) {
    const response = validator(data)

    if (response instanceof Error)
      throw Error('Validation failed:\n' + response.message)
  }

  return true
}
