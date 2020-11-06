const { extendClient } = require('../model/user.model');
const { badRequest, invalidCredentials, serverError } = require('./handlers');

module.exports = async (req, res) => {
  try {
    const { cid } = req.body;
    if (!cid) return badRequest(res);
    const result = await extendClient(cid);
    if (!result) return invalidCredentials(res);
    if (result.error) return serverError(res);
    return res.sendStatus(200);
  } catch (err) {
    return serverError(res);
  }
};
