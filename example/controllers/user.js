const { promisify } = require('util')
const crypto = require('crypto')
const passport = require('passport')

const UserRepo = require('../repositories/UserRepository.js')

module.exports.getLogin = function(req, res) {
  if (req.user) return res.redirect('/account')

  res.render('account/login', {
    title: 'Login'
  })
}

module.exports.postLogin = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail()
  req.assert('password', 'Password cannot be blank').notEmpty()

  const errors = req.validationErrors()

  if (errors) {
    req.flash('errors', errors)
    return res.redirect('/login')
  }

  passport.authenticate('local', function(err, user, info) {
    if (!user || err) {
      try {
        err = JSON.stringify(err)
      } catch (e) {}

      req.flash('errors', { msg: err || info.message })
      return res.redirect('/login')
    }
    req.logIn(user, function(loginErr) {
      if (loginErr) return next(loginErr)
      req.flash('success', { msg: 'Success! You are logged in.' })
      const redirectTo = req.session.returnTo || '/'
      delete req.session.returnTo
      res.redirect(redirectTo)
    })
  })(req, res, next)
}

module.exports.logout = function(req, res) {
  req.logout()
  res.locals.user = null
  res.render('home', {
    title: 'Home'
  })
}

module.exports.getSignup = function(req, res) {
  if (req.user) return res.redirect('/')
  res.render('account/signup', {
    title: 'Create Account'
  })
}

module.exports.postSignup = async function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail()
  req.assert('password', 'Password must be at least 4 characters long').len(4)
  req
    .assert('confirmPassword', 'Passwords do not match')
    .equals(req.body.password)

  const errors = req.validationErrors()

  if (errors) {
    req.flash('errors', errors)
    return res.redirect('/signup')
  }

  try {
    const user = await UserRepo.createUser({
      email: req.body.email,
      password: req.body.password,
      profile: {},
      tokens: {}
    })

    req.logIn(user, function(err) {
      if (err) return next(err)
      req.flash('success', {
        msg: "Your account has been created and you've been logged in."
      })
      res.redirect('/')
    })
  } catch (err) {
    req.flash('errors', { msg: err })
    return res.redirect('/login')
  }
}
