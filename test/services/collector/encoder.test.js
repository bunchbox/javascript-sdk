const test = require('ava')

const {
  encodeAttributes,
  encodeEcommerceParams,
  encodeMainParams,
  encodeParams
} = require('../../../lib/services/collector/encoder')

// encoder.encodeAttributes/1

test('encodes attributes', t => {
  const attributes = {
    number: 42,
    boolean: true,
    string: 'foo',
    array: ['bar', 'bar2']
  }

  const encoded = encodeAttributes(attributes)

  t.deepEqual(encoded, {
    at: ['number=+:42', 'boolean=!:1', 'string=s:foo', 'array=a:bar,bar2']
  })
})

// encoder.encodeEcommerceParams/1

test('encodes ecommerce parameters', t => {
  const params = {
    orderSize: 'coz',
    orderId: 'coi',
    productIds: 'cpi',
    ignoredEcommerceParameter: 99
  }

  const encoded = encodeEcommerceParams(params)

  t.deepEqual(encoded, {
    coi: 'coi',
    coz: 'coz',
    cpi: 'cpi'
  })
})

// encoder.encodeMainParams/1

test('encodes main parameters', t => {
  const params = {
    type: 't',
    id: 'id',
    experimentId: 'tex',
    userId: 'u',
    variantId: 'tva',
    conversionId: 'tco',
    goalId: 'tgo',
    ignoredMainParameter: 99
  }

  const encoded = encodeMainParams(params)

  t.deepEqual(encoded, {
    id: 'id',
    t: 't',
    tco: 'tco',
    tex: 'tex',
    tgo: 'tgo',
    tva: 'tva',
    u: 'u'
  })
})

// encoder.encodeParams/1

test('encodes a nested object of parameters', t => {
  const params = {
    device: {
      browser: 'uab',
      category: 'uac',
      os: 'uao',
      viewportHeight: 'bh',
      viewportWidth: 'bw'
    },
    geo: {
      city: 'gci',
      country: 'gco',
      countryCode: 'gcc',
      ip: 'gip'
    },
    documentHeight: 'dh',
    documentWidth: 'dw',
    browserLanguage: 'ln',
    referrer: 're',
    screenHeight: 'sh',
    screenWidth: 'sw',
    url: 'ur',
    userAgent: 'ua',
    ignoredNestedParams: {
      foo: 0,
      bar: '11'
    },
    ignoredParam: 99
  }

  const encoded = encodeParams(params)

  t.deepEqual(encoded, {
    uab: 'uab',
    uac: 'uac',
    uao: 'uao',
    bh: 'bh',
    bw: 'bw',
    gci: 'gci',
    gco: 'gco',
    gcc: 'gcc',
    gip: 'gip',
    dh: 'dh',
    dw: 'dw',
    ln: 'ln',
    re: 're',
    sh: 'sh',
    sw: 'sw',
    ur: 'ur',
    ua: 'ua'
  })
})
