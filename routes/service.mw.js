const logger = require('../logger');
const { verify } = require('../services');
const { invalidCredentials, serverError } = require('./handlers');

const autorizeService = (scope) => async (req, res, next) => {
  const key = req.headers['x-api-key'];
  const spid = req.headers['x-service-id'];
  if (!key || !spid) return invalidCredentials(res);
  try {
    const result = await verify({ spid, key, scope });
    if (!result) return invalidCredentials(res);
    if (result.error) return serverError(res);
    res.spid = spid;
    next();
  } catch (err) {
    logger.error(err);
    return serverError(res);
  }
};

exports.serviceAuthMW = autorizeService();
exports.adminAuthMW = autorizeService('admin');
