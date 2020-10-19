/* eslint-disable no-console */
const express = require('express');
const dbClient = require('./model');
const { setCleanInterval } = require('./model/utils');

const { PORT } = process.env;

const app = express();

app.use(express.json());

(async () => {
  console.log('Connecting to database...');
  await dbClient.sync();
  setCleanInterval();
  console.log('Successfully connected to database, starting server...');
  app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
  });
})();
