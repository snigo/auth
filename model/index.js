const { Sequelize } = require('sequelize');

const { DB_CONNECTION_URL } = process.env;

module.exports = new Sequelize(DB_CONNECTION_URL, { logging: false });
