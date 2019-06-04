const db = require('../models/sequelize')

const PSW_RESET_TOKEN_VALID_FOR = 3 //hours
const ONE_HOUR = 3600000

module.exports = {
  getUserById(id) {
    return db.User.findByPk(id)
  },

  async createUser(user) {
    const c = await db.User.count({ where: { email: user.email } })
    if (c > 0) throw 'Account with that email address already exists.'

    const dbUser = db.User.build(user)

    dbUser.set('tokens', {})
    dbUser.set('profile', {})

    return dbUser.save()
  }
}
