const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProjectPermission = sequelize.define('ProjectPermission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  role: {
    type: DataTypes.ENUM('owner', 'admin', 'member'),
    allowNull: false,
  },
  permissionKey: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Permission key from permissions.js (e.g., canDeleteProject, canInviteMembers)',
  },
  isEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether this permission is enabled for this role in this project',
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Admin who created/modified this permission override',
  },
}, {
  timestamps: true,
  tableName: 'project_permissions',
  indexes: [
    {
      unique: true,
      fields: ['projectId', 'role', 'permissionKey'],
      name: 'project_role_permission_unique'
    },
    {
      fields: ['projectId']
    },
    {
      fields: ['role']
    }
  ]
});

module.exports = ProjectPermission;
