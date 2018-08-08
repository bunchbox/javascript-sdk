module.exports = bb => {
  return {
    receive(req, res) {
      if (req.body.event === 'update') bb.reloadTestingFile()
      res.send('ok')
    }
  }
}
