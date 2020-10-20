const bcrypt = require('bcrypt');
const { v4: uuid } = require('uuid');
const { createUser } = require('../model/user.model');
const { badRequest, serverError, conflict } = require('./handlers');

const { SALT_ROUNDS } = process.env;

module.exports = async (req, res) => {
  const { email, password, pid } = req.body;
  if (!email || !password || !pid) return badRequest(res);

  try {
    const hash = await bcrypt.hash(password, +SALT_ROUNDS);
    const secret = uuid().replace(/-/g, '');
    const cid = uuid().replace(/-/g, '');

    const user = await createUser({
      email,
      password: hash,
      pid,
      secret,
      cid,
    });
    if (!user) return conflict(res);
    if (user.error) return serverError(res);

    res.status(200).json(user);
  } catch (err) {
    return serverError(res);
  }
};
