const bcrypt = require('bcrypt');
const { v4: uuid } = require('uuid');
const {
  getUserByEmail,
  createClient,
  destroyClient,
  updateUser,
  destroyAllClients,
} = require('../model/user.model');
const {
  badRequest,
  invalidCredentials,
  serverError,
  conflict,
} = require('./handlers');

const { PASSWORD_TTL, SALT_ROUNDS } = process.env;

exports.requestResetCtrl = async (req, res) => {
  const { email } = req.body;
  if (!email) return badRequest(res);

  try {
    const user = await getUserByEmail(email);
    if (!user) return invalidCredentials(res);
    if (user.error) return serverError(res);

    const agent = req.headers['user-agent'] || null;
    const ip = req.headers['x-forwarded-for']
      || (req.connection && req.connection.remoteAddress)
      || null;
    const cid = uuid().replace(/-/g, '');
    const secret = uuid().replace(/-/g, '');

    const client = await createClient({
      userId: user.id,
      exp: PASSWORD_TTL,
      cid,
      secret,
      ip,
      agent,
    });
    if (client.error) return serverError(res);

    res.status(200).json({
      email: user.email,
      pid: user.pid,
      cid: client.cid,
      secret: client.secret,
    });
  } catch (err) {
    return serverError(res);
  }
};

exports.revokeRequestCtrl = async (req, res) => {
  try {
    const { cid } = req.body;
    if (!cid) return badRequest(res);
    const response = await destroyClient(cid);
    if (response.error) return serverError(res);
    res.status(200).json({ cid: null });
  } catch (err) {
    return serverError(res);
  }
};

exports.resetPasswordCtrl = async (req, res) => {
  const { password, pid, cid } = req.body;
  if (!password || !pid || !cid) return badRequest(res);

  try {
    const response = await destroyAllClients(cid);
    if (response.error) return serverError(res);

    const hash = await bcrypt.hash(password, +SALT_ROUNDS);
    const user = await updateUser({
      password: hash,
      pid,
    });
    if (!user) return conflict(res);
    if (user.error) return serverError(res);

    res.status(200).json({ pid, cid: null });
  } catch (err) {
    return serverError(res);
  }
};
