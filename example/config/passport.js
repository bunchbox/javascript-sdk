const passport = require('passport')
const { Strategy } = require('passport-local')

const db = require('../models/sequelize')

passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {
  db.User.findById(id)
    .then(function(user) {
      done(null, user)
    })
    .catch(function(error) {
      done(error)
    })
})

passport.use(
  new Strategy({ usernameField: 'email' }, async function(
    email,
    password,
    done
  ) {
    email = email.toLowerCase()

    try {
      const user = await db.User.findUser(email, password)
      return done(null, user)
    } catch (err) {
      return done(err, null)
    }
  })
)

exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) return next()
  res.redirect('/login')
}

exports.isAuthorized = function(req, res, next) {
  const provider = req.path.split('/').slice(-1)[0]

  if (req.user.tokens[provider]) {
    next()
  } else {
    res.redirect('/auth/' + provider)
  }
}
