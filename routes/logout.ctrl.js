const { destroyClient } = require('../model/user.model');
const { badRequest, serverError } = require('./handlers');

module.exports = async (req, res) => {
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
