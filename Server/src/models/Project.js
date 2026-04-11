const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Project = sequelize.define('Project', {
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
  key: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#3B82F6',
  },
  status: {
    type: DataTypes.ENUM('active', 'archived'),
    defaultValue: 'active',
  },
}, {
  timestamps: true,
  tableName: 'projects',
});

module.exports = Project;
