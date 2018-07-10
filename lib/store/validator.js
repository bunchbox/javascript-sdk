const { isObject } = require('lib/util/is-type')
const capitalize = require('lib/util/capitalize')
const logger = require('lib/util/logger')

const Ajv = require('ajv')
const ajv = new Ajv({ allErrors: true })

const schema = require('./testing-file-schema')
const validate = ajv.compile(schema)

// Helpers

function prettifyDataPath(dataPath, testingFile) {
  const path = dataPath !== '' ? dataPath.slice(1).split(/\[(\d+)\]./) : []

  const head = path.slice(0, -1)
  const last = path.length > 0 ? path.slice(-1) : null

  const { result } = head.reduce(
    ({ data, result, prevKey }, key) => {
      data = isObject(data) || Array.isArray(data) ? data[key] : data

      result =
        data.id != null
          ? result.concat(`${capitalize(prevKey).slice(0, -1)}@${data.id}`)
          : result

      return { data, result, prevKey: key }
    },
    { data: testingFile, result: [], prevKey: '' }
  )

  return result.length > 0 ? `${result.join(' | ')}: ${last}` : ''
}

// Validators

function validateJsonSchema(testingFile) {
  if (!validate(testingFile)) {
    const errors = validate.errors
      .map(err => {
        const prettyPath = prettifyDataPath(err.dataPath, testingFile)
        return `- ${prettyPath}${prettyPath ? ' ' : ''}${err.message}`
      })
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

    if (experiment.variantTargetingActive)
      logger.debug(
        'Note: Evaluation of the Variant Targeting is not yet implemented'
      )

    for (const step of experiment.steps) {
      const sPrefix = `${ePrefix} | Step ${step.id} `

      if (
        experiment.targeting.length > 0 &&
        experiment.steps.length > 1 &&
        step.tokens.length === 0
      )
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
            `but its Variant ${variant.id} has no weight assigned`

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
