const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  assigneeId: {
    type: DataTypes.UUID,
    defaultValue: null,
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('todo', 'in-progress', 'in-review', 'done', 'rejected', 'support'),
    defaultValue: 'todo',
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
  },
  dueDate: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  timestamps: true,
  tableName: 'tasks',
});

module.exports = Task;
