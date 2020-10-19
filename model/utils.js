const { __cleanSecrets } = require('./user.model');

const { SECRET_CLEAN_INTERVAL } = process.env;

function setCleanInterval() {
  return setInterval(__cleanSecrets, SECRET_CLEAN_INTERVAL);
}

function setExpiration(time) {
  return new Date(Date.now() + +time).toISOString();
}

module.exports = {
  setExpiration,
  setCleanInterval,
};
