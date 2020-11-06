const { __cleanClients } = require('./user.model');

const { CLIENT_CLEAN_INTERVAL } = process.env;

exports.setCleanInterval = () => setInterval(__cleanClients, CLIENT_CLEAN_INTERVAL);
