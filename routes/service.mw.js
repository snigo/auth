const logger = require('../logger');
const { verify } = require('../services');
const { invalidCredentials, serverError } = require('./handlers');

exports.serviceAuthMW = async (req, res, next) => {
  const key = req.headers['x-api-key'];
  const spid = req.headers['x-service-id'];
  if (!key || !spid) return invalidCredentials(res);
  try {
    const result = await verify({ spid, key });
    if (result.error) return serverError(res);
    if (!result) return invalidCredentials(res);
    next();
  } catch (err) {
    logger.error(err);
    return serverError(res);
  }
};

exports.adminAuthMW = async (req, res, next) => {
  const key = req.headers['x-api-key'];
  const spid = req.headers['x-service-id'];
  if (!key || !spid) return invalidCredentials(res);
  try {
    const result = await verify({ spid, key, scope: 'admin' });
    if (result.error) return serverError(res);
    if (!result) return invalidCredentials(res);
    next();
  } catch (err) {
    logger.error(err);
    return serverError(res);
  }
};
