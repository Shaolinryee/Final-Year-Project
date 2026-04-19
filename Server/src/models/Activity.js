const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  projectId: {
    type: DataTypes.UUID,
    defaultValue: null,
  },
  taskId: {
    type: DataTypes.UUID,
    defaultValue: null,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  action: {
    type: DataTypes.ENUM(
      'created_project',
      'updated_project',
      'deleted_project',
      'created_task',
      'updated_task',
      'deleted_task',
      'added_member',
      'removed_member',
      'commented',
      'status_changed',
      'assigned',
      'uploaded_attachment',
      'deleted_attachment'
    ),
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
}, {
  timestamps: true,
  tableName: 'activities',
});

module.exports = Activity;
