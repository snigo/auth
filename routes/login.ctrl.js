const bcrypt = require('bcrypt');
const { v4: uuid } = require('uuid');
const logger = require('../logger');
const { getUserByEmail, createClient } = require('../model/user.model');
const { badRequest, invalidCredentials, serverError } = require('./handlers');

module.exports = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return badRequest(res);

    const user = await getUserByEmail(email);
    if (!user) return invalidCredentials(res);
    if (user.error) return serverError(res);

    const authorized = await bcrypt.compare(password, user.password);
    if (!authorized) return invalidCredentials(res);

    const agent = req.headers['user-agent'] || null;
    const ip = req.headers['x-forwarded-for']
      || (req.connection && req.connection.remoteAddress)
      || null;
    const cid = uuid().replace(/-/g, '');
    const secret = uuid().replace(/-/g, '');

    const client = await createClient({
      userId: user.id,
      cid,
      secret,
      ip,
      agent,
    });
    if (client.error) return serverError(res);

    res.status(200).json({
      pid: user.pid,
      cid: client.cid,
      secret: client.secret,
    });
  } catch (err) {
    logger.error(`Encryption error while logging in a user.\nMessage: ${err}`);
    return serverError(res);
  }
};
