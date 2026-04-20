const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    lowercase: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  googleId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  loginCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  suspendedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  suspendedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  suspensionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verificationToken: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
  adminRoleId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'admin_roles',
      key: 'id',
    },
  },
}, {
  timestamps: true,
  tableName: 'users',
});

module.exports = User;
