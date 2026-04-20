const AdminRole = require('./AdminRole');
const AdminPermission = require('./AdminPermission');
const SystemLog = require('./SystemLog');
const SystemSetting = require('./SystemSetting');
const User = require('./User');

// Admin Role and Permission Associations
AdminRole.belongsToMany(AdminPermission, {
  through: 'admin_role_permissions',
  foreignKey: 'adminRoleId',
  otherKey: 'adminPermissionId',
  as: 'permissions'
});

AdminPermission.belongsToMany(AdminRole, {
  through: 'admin_role_permissions',
  foreignKey: 'adminPermissionId',
  otherKey: 'adminRoleId',
  as: 'roles'
});

// User and Admin Role Associations
User.belongsTo(AdminRole, {
  foreignKey: 'adminRoleId',
  as: 'adminRole'
});

AdminRole.hasMany(User, {
  foreignKey: 'adminRoleId',
  as: 'users'
});

// User and System Log Associations
User.hasMany(SystemLog, {
  foreignKey: 'userId',
  as: 'systemLogs'
});

SystemLog.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User and System Setting Associations
User.hasMany(SystemSetting, {
  foreignKey: 'updatedBy',
  as: 'updatedSettings'
});

SystemSetting.belongsTo(User, {
  foreignKey: 'updatedBy',
  as: 'updatedByUser'
});

module.exports = {
  AdminRole,
  AdminPermission,
  SystemLog,
  SystemSetting,
  User
};
