const { DataTypes } = require('sequelize');
const logger = require('../logger');
const db = require('.');
const { setExpiration } = require('./utils');

const { CLIENT_TTL } = process.env;

const User = db.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  passwordUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: new Date().toISOString(),
  },
});

const Client = db.define('Client', {
  agent: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  secret: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  exp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: setExpiration(CLIENT_TTL),
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: new Date().toISOString(),
  },
});

const associationOpts = {
  foreignKey: 'userId',
  as: 'clients',
};
Client.belongsTo(User, associationOpts);
User.hasMany(Client, associationOpts);

exports.createUser = async ({
  pid,
  email,
  password,
  secret,
  cid,
  agent,
  ip,
}) => {
  try {
    let user = await User.findOne({ where: { email } });
    if (user) return false;
    user = await User.create({ pid, email, password });
    const client = await Client.create({
      secret,
      cid,
      agent,
      ip,
    });
    client.userId = user.id;
    await client.save();
    return {
      pid: user.pid,
      secret: client.secret,
      cid: client.cid,
    };
  } catch (err) {
    logger.error(`Error while creating a user.\nMessage: ${err}`);
    return { error: err };
  }
};

exports.getUser = async ({ pid, cid }) => {
  try {
    const user = await User.findOne({
      where: { pid },
      include: {
        model: Client,
        as: 'clients',
        where: { cid },
      },
    });
    if (!user || !user.clients.length) return null;
    const [client] = user.clients;
    return {
      pid: user.pid,
      cid: client.cid,
      secret: client.secret,
    };
  } catch (err) {
    logger.error(`Error while retrieving a user.\nMessage: ${err}`);
    return { error: err };
  }
};

exports.getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    return user || null;
  } catch (err) {
    logger.error(`Error getting user by email.\nMessage: ${err}`);
    return { error: err };
  }
};

exports.updateUser = async ({ pid, email, password }) => {
  try {
    const user = await User.findOne({ where: { pid } });
    if (!user) return false;
    if (email) user.email = email;
    if (password) {
      user.password = password;
      user.passwordUpdated = new Date().toISOString();
    }
    await user.save();
    return true;
  } catch (err) {
    logger.error(`Error while updating a user.\nMessage: ${err}`);
    return { error: err };
  }
};

exports.createClient = async ({
  userId,
  secret,
  cid,
  agent,
  ip,
  exp,
}) => {
  const expDate = (+exp) ? setExpiration(exp) : setExpiration(CLIENT_TTL);
  try {
    const client = await Client.create({
      exp: expDate,
      secret,
      cid,
      agent,
      ip,
    });
    client.userId = userId;
    await client.save();
    return {
      secret: client.secret,
      cid: client.cid,
      exp: client.exp,
    };
  } catch (err) {
    logger.error(`Error while creating a client.\nMessage: ${err}`);
    return { error: err };
  }
};

exports.destroyClient = async (cid) => {
  try {
    const client = await Client.findOne({ where: { cid } });
    if (!client) return false;
    await client.destroy();
    return true;
  } catch (err) {
    logger.error(`Error while destroying a client.\nMessage: ${err}`);
    return { error: err };
  }
};

exports.destroyAllClients = async (cid) => {
  try {
    const client = await Client.findOne({ where: { cid } });
    if (!client) return false;
    const clients = await Client.findAll({ where: { userId: client.userId } });
    await Promise.all(clients.map((_client) => _client.destroy()));
    return true;
  } catch (err) {
    logger.error(`Error while destroying all clients.\nMessage: ${err}`);
    return { error: err };
  }
};

exports.extendClient = async (cid, ms = CLIENT_TTL) => {
  try {
    const client = await Client.findOne({ where: { cid } });
    if (!client) return false;
    client.exp = setExpiration(ms);
    client.lastLogin = new Date().toISOString();
    await client.save();
    return true;
  } catch (err) {
    logger.error(`Error while extending a client.\nMessage: ${err}`);
    return { error: err };
  }
};

exports.__cleanClients = async () => {
  try {
    const clients = await Client.findAll();
    clients.forEach((client) => {
      if (new Date(client.exp) < new Date()) {
        client.destroy();
      }
    });
    return undefined;
  } catch (err) {
    logger.error(`Error while cleaning clients.\nMessage: ${err}`);
    return { error: err };
  }
};
