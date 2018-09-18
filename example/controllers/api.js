module.exports = (bb, experimentId) => {
  return {
    track(req, res) {
      if (req.user) {
        // Send conversion event for all goals of the given experiment

        bb.track({
          clientId: req.user.getBunchboxClientId(),
          experimentId
          // To track a specific goal:
          // goalIdentifier: '!yourGoalIdentifier'
        }).catch(err => {
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
