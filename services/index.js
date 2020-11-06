const Redis = require('ioredis');
const logger = require('../logger');

const { REDIS_CONNECTION_URL, REDIS_PREFIX, ADMIN_KEY } = process.env;

const redis = new Redis(REDIS_CONNECTION_URL);

const setService = async ({
  spid,
  label,
  key,
  scope,
}) => {
  try {
    const service = {
      spid,
      key,
      label,
      scope,
      created_at: new Date().toISOString(),
    };
    const response = await redis.hmset(`${REDIS_PREFIX}-${spid}`, service);
    if (response !== 'OK') {
      logger.error(response);
      return { error: response };
    }
    return service;
  } catch (err) {
    logger.error(err);
    return { error: err };
  }
};

const setAdmin = async () => {
  try {
    await setService({
      spid: 'root',
      label: 'ROOT ADMIN',
      key: ADMIN_KEY,
      scope: 'admin',
    });
  } catch (err) {
    logger.error(`Error setting up admin user.\nMessage: ${err}`);
    return { error: err };
  }
};

const verify = async ({ spid, key, scope = 'service' }) => {
  try {
    const service = await redis.hgetall(`${REDIS_PREFIX}-${spid}`);
    return !!(service && service.key === key && (service.scope === scope || service.scope === 'admin'));
  } catch (err) {
    logger.error(`Failed during service verification.\nMessage: ${err}`);
    return { error: err };
  }
};

const revokeService = async ({ spid }) => {
  try {
    const result = await redis.del(`${REDIS_PREFIX}-${spid}`);
    return result;
  } catch (err) {
    logger.error(`Error while revoking a service.\nMessage: ${err}`);
    return { error: err };
  }
};

module.exports = {
  setAdmin,
  setService,
  revokeService,
  verify,
};
