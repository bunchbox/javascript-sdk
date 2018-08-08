const { promisify } = require('util')

const timeout = promisify(setTimeout)

module.exports = (bb, experimentId) => {
  return {
    async index(req, res) {
      if (req.user) {
        const userId = `demo:home-exp:${req.user.getHashedEmail()}`

        const params = {
          url: req.headers.host,
          userAgent: req.headers['user-agent'],
          urlParameters: req.query,
          attributes: {
            gravatar: req.user.getGravatarUrl()
          }
        }

        // TODO:
        // * call bb.track

        try {
          const varriant = await bb.activate({ userId, experimentId }, params)

          if (varriant) {
            req.flash('success', {
              msg: `You were bucketed into varriant: ${varriant.name}`
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
