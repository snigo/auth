const { v4: uuid } = require('uuid');
const { setService, verify, revokeService } = require('../services');
const {
  serverError,
  conflict,
  badRequest,
  invalidCredentials,
  forbidden,
} = require('./handlers');

exports.registerServiceCtrl = async (req, res) => {
  try {
    const { label, scope, spid } = req.body;
    if (scope === 'root') return forbidden(res);

    const serviceId = spid || uuid().replace(/-/g, '');
    const key = uuid().replace(/-/g, '');

    const service = await setService({
      label: label || `service-${spid}`,
      scope: scope || 'service',
      spid: serviceId,
      key,
    });
    if (!service) return conflict(res);
    if (service.error) return serverError(res);
    res.status(200).json(service);
  } catch (err) {
    return serverError(res);
  }
};

exports.revokeServiceCtrl = async (req, res) => {
  try {
    const { spid } = req.body;
    if (!spid) return badRequest(res);

    if (spid !== res.spid) {
      const authorized = await verify({ spid });
      if (!authorized) return invalidCredentials(res);
      if (authorized.error) return serverError(res);
    }

    const result = await revokeService({ spid });
    if (!result) return forbidden(res);
    if (result.error) return serverError(res);

    res.sendStatus(200);
  } catch (err) {
    return serverError(res);
  }
};
