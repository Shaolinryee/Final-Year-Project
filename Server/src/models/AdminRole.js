const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdminRole = sequelize.define('AdminRole', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.ENUM('super_admin', 'admin', 'support', 'read_only'),
    allowNull: false,
    unique: true,
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  permissionData: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  tableName: 'admin_roles',
  indexes: [
    {
      unique: true,
      fields: ['name']
    },
    {
      fields: ['level']
    }
  ]
});

module.exports = AdminRole;
