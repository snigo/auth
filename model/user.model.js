const { DataTypes } = require('sequelize');
const db = require('.');
const { setExpiration } = require('./utils');

const { SECRET_TTL } = process.env;

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
});

const Secret = db.define('Secret', {
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
    defaultValue: setExpiration(SECRET_TTL),
  },
});

Secret.belongsTo(User);
User.hasMany(Secret);

exports.createUser = async ({
  pid,
  email,
  password,
  secret,
  cid,
}) => {
  try {
    let user = await User.findOne({ where: { email } });
    if (user) return { error: 'User already exists.' };
    user = await User.create({ pid, email, password });
    const secretEntry = await Secret.create({ secret, cid });
    await secretEntry.setUser(user.id);
    return { pid: user.pid, secret: secretEntry.secret, cid: secretEntry.cid };
  } catch (err) {
    return { error: err };
  }
};

exports.getUser = async ({ pid, cid }) => {
  try {
    const user = await User.findOne({
      where: { pid },
      include: {
        model: Secret,
        where: { cid },
      },
    });
    if (!user || !user.Secrets.length) return null;
    return { pid: user.pid, cid: user.Secrets[0].cid, secret: user.Secrets[0].secret };
  } catch (err) {
    return { error: err };
  }
};

exports.getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    return user || null;
  } catch (err) {
    return { error: err };
  }
};

exports.createSecret = async ({ userId, secret, cid }) => {
  try {
    const secretEntry = await Secret.create({ secret, cid });
    await secretEntry.setUser(userId);
    return {
      secret: secretEntry.secret,
      cid: secretEntry.cid,
      exp: secretEntry.exp,
    };
  } catch (err) {
    return { error: err };
  }
};

exports.destroySecret = async (cid) => {
  try {
    const secret = await Secret.findOne({ where: { cid } });
    if (!secret) return false;
    await secret.destroy();
    return true;
  } catch (err) {
    return { error: err };
  }
};

exports.extendSecret = async (cid, ms = SECRET_TTL) => {
  try {
    const secret = await Secret.findOne({ where: { cid } });
    if (!secret) return false;
    secret.exp = setExpiration(ms);
    await secret.save();
    return true;
  } catch (err) {
    return { error: err };
  }
};

exports.__cleanSecrets = async () => {
  try {
    const secrets = await Secret.findAll();
    secrets.forEach((secret) => {
      if (new Date(secret.exp) < new Date()) {
        secret.destroy();
      }
    });
    return undefined;
  } catch (err) {
    return { error: err };
  }
};
