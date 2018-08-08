const bcrypt = require('bcrypt')
const crypto = require('crypto')

const beforeSaveHook = async function(user, options) {
  if (user.changed('password')) {
    const hash = await this.encryptPassword(user.password)
    user.password = hash
  }

  return user
}

const schema = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  password: DataTypes.STRING,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
  logins: DataTypes.INTEGER,
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    isEmail: true
  },
  profile: DataTypes.JSON,
  tokens: DataTypes.JSON
})

module.exports = (db, DataTypes) => {
  const User = db.define('User', schema(DataTypes), {
    tableName: 'pl_users',
    hooks: {
      beforeUpdate: beforeSaveHook,
      beforeCreate: beforeSaveHook
    }
  })

  User.encryptPassword = async function(password, cb) {
    if (!password) throw Error('No password provided')

    const salt = await bcrypt.genSalt(10)
    const hash = bcrypt.hash(password, salt)

    return hash
  }

  User.findUser = async function(email, password) {
    const user = await this.findOne({ where: { email: email } })

    if (
      user == null ||
      user.password == null ||
      user.password.length === 0 ||
      !(await bcrypt.compare(password, user.password))
    )
      throw Error('User / Password combination is not correct')

    return user
  }

  User.prototype.getGravatarUrl = function(size = 200) {
    if (!this.email) {
      return 'https://gravatar.com/avatar/?s=' + size + '&d=retro'
    }

    const md5 = this.getHashedEmail()

    return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro'
  }

  User.prototype.getHashedEmail = function(size = 200) {
    return crypto
      .createHash('md5')
      .update(this.email)
      .digest('hex')
  }

  User.prototype.getProfilePicture = function(size) {
    return this.profile && this.profile.picture != null
      ? this.profile.picture
      : this.getGravatarUrl(size)
  }

  User.prototype.hasSetPassword = function() {
    return this.password != null && this.password.length > 0
  }

  return User
}
