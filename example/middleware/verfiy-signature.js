const crypto = require('crypto')

const { bbWebhookSecret } = require('../config/secrets')

module.exports = function(req, res, next) {
  const signature = req.get('x-bb-signature')
  const data = req.rawBody

  if (signature && data) {
    const hmac = crypto
      .createHmac('sha256', bbWebhookSecret)
      .update(data)
      .digest('hex')
      .toString('utf8')

    if (hmac === signature) return next()
  }

  res.status(401).send()

  return next(Error('Invalid signature'))
}
