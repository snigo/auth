const { destroyClient, destroyAllClients } = require('../model/user.model');
const { badRequest, serverError } = require('./handlers');

module.exports = async (req, res) => {
  try {
    const { cid } = req.body;
    const { ctx } = req.query;
    if (!cid) return badRequest(res);
    const everywhere = ctx && ctx.toLowerCase() === 'everywhere';
    const response = await (everywhere ? destroyAllClients(cid) : destroyClient(cid));
    if (response.error) return serverError(res);
    res.status(200).json({ cid: null });
  } catch (err) {
    return serverError(res);
  }
};
