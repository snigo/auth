const bcrypt = require('bcrypt');
const logger = require('../logger');
const { getUserByEmail, destroyAllClients, updateUser } = require('../model/user.model');
const {
  badRequest,
  invalidCredentials,
  serverError,
  conflict,
} = require('./handlers');

const { SALT_ROUNDS } = process.env;

exports.updatePasswordCtrl = async (req, res) => {
  try {
    const {
      email,
      password,
      old,
      cid,
    } = req.body;
    if (!email || !password || !old || !cid) return badRequest(res);

    const user = await getUserByEmail(email);
    if (!user) return invalidCredentials(res);
    if (user.error) return serverError(res);

    const authorized = await bcrypt.compare(old, user.password);
    if (!authorized) return invalidCredentials(res);

    const response = await destroyAllClients(cid);
    if (response.error) return serverError(res);

    const hash = await bcrypt.hash(password, +SALT_ROUNDS);
    const updated = await updateUser({
      password: hash,
      pid: user.pid,
    });
    if (!updated) return conflict(res);
    if (updated.error) return serverError(res);

    res.status(200).json({
      pid: updated.pid,
      cid: null,
    });
  } catch (err) {
    logger.error(`Encryption error while updating password.\nMessage: ${err}`);
    return serverError(res);
  }
};

exports.updateEmailCtrl = async (req, res) => {
  try {
    const {
      email,
      password,
      old,
      cid,
    } = req.body;
    if (!email || !password || !old || !cid) return badRequest(res);

    const newEmailUser = await getUserByEmail(email);
    const user = await getUserByEmail(old);
    if (!user || newEmailUser) return invalidCredentials(res);
    if (user.error) return serverError(res);

    const authorized = await bcrypt.compare(password, user.password);
    if (!authorized) return invalidCredentials(res);

    const response = await destroyAllClients(cid);
    if (response.error) return serverError(res);

    const updated = await updateUser({
      email,
      pid: user.pid,
    });
    if (!updated) return conflict(res);
    if (updated.error) return serverError(res);

    res.status(200).json({
      pid: updated.pid,
      cid: null,
    });
  } catch (err) {
    logger.error(`Encryption error while updating user email.\nMessage: ${err}`);
    return serverError(res);
  }
};
