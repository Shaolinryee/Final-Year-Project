const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdminPermission = sequelize.define('AdminPermission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  resource: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
  tableName: 'admin_permissions',
  indexes: [
    {
      unique: true,
      fields: ['name']
    },
    {
      fields: ['resource', 'action']
    },
    {
      fields: ['category']
    }
  ]
});

module.exports = AdminPermission;
