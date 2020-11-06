const { v4: uuid } = require('uuid');
const { setService } = require('../services');
const { serverError, conflict } = require('./handlers');

module.exports = async (req, res) => {
  const { label, scope } = req.body;

  try {
    const key = uuid().replace(/-/g, '');
    const spid = uuid().replace(/-/g, '');

    const service = await setService({
      label: label || `service-${spid}`,
      scope: scope || 'service',
      key,
      spid,
    });
    if (!service) return conflict(res);
    if (service.error) return serverError(res);
    res.status(200).json(service);
  } catch (err) {
    return serverError(res);
  }
};
