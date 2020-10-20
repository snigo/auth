const { getUser } = require('../model/user.model');
const { badRequest, invalidCredentials, serverError } = require('./handlers');

module.exports = async (req, res) => {
  try {
    const { pid, cid } = req.body;
    if (!pid || !cid) return badRequest(res);
    const user = await getUser({ cid, pid });
    if (!user) return invalidCredentials(res);
    if (user.error) return serverError(res);
    return res.status(200).json(user);
  } catch (err) {
    return serverError(res);
  }
};
