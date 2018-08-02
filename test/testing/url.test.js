const test = require('ava')

const { simplifyUrl } = require('../../lib/testing/url')

// url.simplifyUrl/1

test('simplifies a URL', t => {
  t.is(simplifyUrl('example.com/blog'), 'example.com/blog')
  t.is(simplifyUrl('http://example.com/about#baz'), 'example.com/about')
  t.is(simplifyUrl('https://www.example.com/?query=example'), 'example.com')

  t.is(
    simplifyUrl('https://www.example.com/blog?foo=bar#baz'),
    'example.com/blog'
  )

  t.is(
    simplifyUrl('https://www.example.com/blog?foo=bar?&ab=1#baz&a?=1'),
    'example.com/blog'
  )
})
