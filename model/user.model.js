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

Client.belongsTo(User);
User.hasMany(Client);

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
    await client.setUser(user.id);
    return {
      pid: user.pid,
      secret: client.secret,
      cid: client.cid,
    };
  } catch (err) {
    logger.error(err);
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
    if (!user || !user.client.length) return null;
    const [client] = user.clients;
    return {
      pid: user.pid,
      cid: client.cid,
      secret: client.secret,
    };
  } catch (err) {
    logger.error(err);
    return { error: err };
  }
};

exports.getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    return user || null;
  } catch (err) {
    logger.error(err);
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
    logger.error(err);
    return { error: err };
  }
};

exports.createClient = async ({
  userId,
  secret,
  cid,
  agent,
  ip,
}) => {
  try {
    const client = await Client.create({
      secret,
      cid,
      agent,
      ip,
    });
    await client.setUser(userId);
    return {
      secret: client.secret,
      cid: client.cid,
      exp: client.exp,
    };
  } catch (err) {
    logger.error(err);
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
    logger.error(err);
    return { error: err };
  }
};

exports.destroyAllClients = async (cid) => {
  try {
    const client = await Client.findOne({ where: { cid } });
    if (!client) return false;
    const clients = await Client.findAll({ where: { UserId: client.UserId } });
    await Promise.all(clients.map((_client) => _client.destroy()));
    return true;
  } catch (err) {
    logger.error(err);
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
    logger.error(err);
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
    logger.error(err);
    return { error: err };
  }
};
