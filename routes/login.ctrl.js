const bcrypt = require('bcrypt');
const { v4: uuid } = require('uuid');
const { getUserByEmail, createSecret } = require('../model/user.model');
const { badRequest, badCredentials, serverError } = require('./handlers');

module.exports = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return badRequest(res);

    const user = await getUserByEmail(email);
    if (!user) return badCredentials(res);
    if (user.error) return serverError(res);

    const authorized = await bcrypt.compare(password, user.password);
    if (!authorized) return badCredentials(res);

    const cid = uuid().replace(/-/g, '');
    const secret = uuid().replace(/-/g, '');

    const secretEntry = await createSecret({ userId: user.id, cid, secret });
    if (secretEntry.error) return serverError(res);

    res.status(200).json({
      pid: user.pid,
      cid: secretEntry.cid,
      secret: secretEntry.secret,
    });
  } catch (err) {
    return serverError(res);
  }
};
