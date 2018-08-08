const express = require('express')
const cookieParser = require('cookie-parser')
const compress = require('compression')
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)
const bodyParser = require('body-parser')
const logger = require('morgan')
const errorHandler = require('errorhandler')
const methodOverride = require('method-override')
const ejsEngine = require('ejs-mate')

const flash = require('express-flash')
const path = require('path')
const passport = require('passport')
const expressValidator = require('express-validator')
const connectAssets = require('connect-assets')

const secrets = require('./config/secrets')
const passportConf = require('./config/passport')

const BunchboxSdk = require('bunchbox-sdk')

// Try to load a custom config file.
// Only necessary for local development on the SDK.
let bbConf = undefined
try {
  bbConf = require('./config/.bb')
} catch (e) {}

const bb = new BunchboxSdk(secrets.bbApiToken, bbConf)

const app = express()

app.set('port', process.env.PORT || 8080)
app.engine('ejs', ejsEngine)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.enable('trust proxy')
app.use(compress())
app.use(
  connectAssets({
    paths: [
      path.join(__dirname, 'public/css'),
      path.join(__dirname, 'public/js')
    ]
  })
)
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(expressValidator())
app.use(methodOverride())
app.use(cookieParser())

const db = require('./models/sequelize')

app.use(
  session({
    store: new pgSession({
      conString: secrets.postgres,
      tableName: secrets.sessionTable
    }),
    secret: secrets.sessionSecret,
    saveUninitialized: true,
    resave: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true
    }
  })
)
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(function(req, res, next) {
  res.locals.user = req.user
  next()
})
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }))

/**
 * Routes
 */
const homeController = require('./controllers/home')(bb, secrets.bbExperimentId)
const userController = require('./controllers/user')

app.get('/', homeController.index)
app.get('/login', userController.getLogin)
app.post('/login', userController.postLogin)
app.get('/logout', userController.logout)
app.get('/signup', userController.getSignup)
app.post('/signup', userController.postSignup)

app.use(errorHandler())

db.sequelize.sync({ force: false }).then(() => {
  app.listen(app.get('port'), () =>
    console.log(`Express server listening on port ${app.get('port')}`)
  )
})

module.exports = app
