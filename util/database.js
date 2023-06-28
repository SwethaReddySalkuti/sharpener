const Sequelize = require('sequelize')


const sequelize = new Sequelize('Expense', 'root', 'password',{
    dialect: 'mysql',
    host: 'localhost'
})

module.exports = sequelize;