function setExpiration(time) {
  return new Date(Date.now() + +time).toISOString();
}

module.exports = {
  setExpiration,
};
