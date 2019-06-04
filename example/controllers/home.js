const { promisify } = require('util')

const timeout = promisify(setTimeout)

module.exports = (bb, experimentId) => {
  return {
    async index(req, res) {
      if (req.user) {
        const clientId = req.user.getBunchboxClientId()

        const params = {
          url: req.protocol + '://' + req.get('host') + req.originalUrl,
          userAgent: req.headers['user-agent'],
          urlParameters: req.query,
          attributes: {
            gravatar: req.user.getGravatarUrl()
          }
        }

        try {
          const variant = await bb.activate({ clientId, experimentId }, params)

          if (variant) {
            req.flash('success', {
              msg: `You were bucketed into variant: ${variant.name}`
            })
          } else {
            req.flash('errors', [
              { msg: 'You were not bucketed into any variant' }
            ])
          }
        } catch (err) {
          // Erorrs of type `Failure` may arise due to (temporaray) network
          // timeouts or modificatoins of the referenced experimens. They are
          // not critical. In production it's probably best to log them. Here,
          // they are displayed for demo purposes though.

          if (err.name === 'Failure') req.flash('errors', [{ msg: err }])
          else throw err
        }
      }

      return res.render('home', { title: 'Home' })
    }
  }
}
