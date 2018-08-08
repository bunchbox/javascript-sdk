const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')

const config = require('../../config/secrets')

const sequelize = new Sequelize(config.postgres, { maxConcurrentQueries: 100 })

// Import models
const db = fs
  .readdirSync(__dirname)
  .filter(file => file.indexOf('.') !== 0 && file !== 'index.js')
  .reduce((db, file) => {
    const model = sequelize.import(path.join(__dirname, file))
    return { ...db, [model.name]: model }
  }, {})

module.exports = {
  sequelize: sequelize,
  Sequelize: Sequelize,
  ...db
}
