const Ajv = require('ajv')
const ajv = new Ajv({ allErrors: true })

const schema = require('./testing-file-schema')
const validate = ajv.compile(schema)

module.exports.validateTestingFile = data => {
  return {
    valid: validate(data),
    errors: validate.errors
  }
}
