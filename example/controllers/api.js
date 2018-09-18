module.exports = (bb, experimentId) => {
  return {
    track(req, res) {
      if (req.user) {
        // Send conversion event for all goals of the given experiment

        const params = {
          url: req.protocol + '://' + req.get('host') + req.originalUrl,
          userAgent: req.headers['user-agent'],
          urlParameters: req.query,
          attributes: {
            gravatar: req.user.getGravatarUrl()
          }
        }

        bb.track(
          {
            clientId: req.user.getBunchboxClientId(),
            experimentId
            // To track a specific goal:
            // goalIdentifier: '!yourGoalIdentifier'
          },
          params
        ).catch(err => {
          if (err.name === 'Failure')
            return console.log('Sending tracking event failed', err)

          throw err
        })
      }

      res.sendStatus(204)
    },

    webhook(req, res) {
      if (req.body.event === 'update') bb.reloadTestingFile()
      res.send('ok')
    }
  }
}
