require('rootpath')()

const test = require('ava')

const generateObjectId = require('lib/util/object-id')

test('generates a valid ObjectId', t => {
  t.regex(generateObjectId(), new RegExp('^[0-9a-fA-F]{24}$'))
})
