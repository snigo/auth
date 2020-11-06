const express = require('express');
const helmet = require('helmet');
const authRouter = require('./routes');
const dbClient = require('./model');
const { setCleanInterval } = require('./model/boot');
const logger = require('./logger');
const { setAdmin } = require('./services');

const { PORT } = process.env;

const app = express();

app.use(helmet());
app.use(express.json());
app.use(authRouter);

(async () => {
  logger.info('Setting admin user...');
  await setAdmin();
  logger.info('Successfully added admin user. Connecting to database...');
  await dbClient.sync();
  setCleanInterval();
  logger.info('Successfully connected to database, starting server...');
  app.listen(PORT, () => {
    logger.info(`Server is up and running on port ${PORT}`);
  });
})();
