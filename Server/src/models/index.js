const { sequelize } = require('../config/database');
const User = require("./User");
const Project = require("./Project");
const ProjectMember = require("./ProjectMember");
const Task = require("./Task");
const Comment = require("./Comment");
const Attachment = require("./Attachment");
const Activity = require("./Activity");
const Invitation = require("./Invitation");
const Notification = require("./Notification");
const Reaction = require("./Reaction");

// Admin models - Temporarily individually loaded
const AdminRole = require("./AdminRole");
const AdminPermission = require("./AdminPermission");
const SystemLog = require("./SystemLog");
const SystemSetting = require("./SystemSetting");
const AdminNotificationPreferences = require("./AdminNotificationPreferences");
const SystemNotification = require("./SystemNotification");
const NotificationTemplate = require("./NotificationTemplate");
const NotificationDeliveryLog = require("./NotificationDeliveryLog");

// Project Permission model
const ProjectPermission = require("./ProjectPermission");

// Impersonation model
const ImpersonationLog = require("./ImpersonationLog");

// --- USER ASSOCIATIONS ---
User.hasMany(Project, { foreignKey: "ownerId", as: "ownedProjects" });
User.hasMany(ProjectMember, { foreignKey: "userId", as: "memberships" });
User.hasMany(Task, { foreignKey: "assigneeId", as: "assignedTasks" });
User.hasMany(Task, { foreignKey: "creatorId", as: "createdTasks" });
User.hasMany(Comment, { foreignKey: "userId", as: "comments" });
User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
User.hasMany(Attachment, { foreignKey: "userId", as: "attachments" });
User.hasMany(Reaction, { foreignKey: "userId", as: "reactions" });

// --- IMPERSONATION ASSOCIATIONS ---
User.hasMany(ImpersonationLog, { foreignKey: "adminId", as: "adminImpersonations" });
User.hasMany(ImpersonationLog, { foreignKey: "userId", as: "userImpersonations" });
ImpersonationLog.belongsTo(User, { foreignKey: "adminId", as: "admin" });
ImpersonationLog.belongsTo(User, { foreignKey: "userId", as: "user" });

// --- PROJECT ASSOCIATIONS ---
Project.belongsTo(User, { foreignKey: "ownerId", as: "owner" });
Project.hasMany(ProjectMember, { foreignKey: "projectId", as: "members", onDelete: "CASCADE" });
Project.hasMany(Task, { foreignKey: "projectId", as: "tasks", onDelete: "CASCADE" });
Project.hasMany(Activity, { foreignKey: "projectId", as: "activities", onDelete: "CASCADE" });
Project.hasMany(Invitation, { foreignKey: "projectId", as: "invitations", onDelete: "CASCADE" });
Project.hasMany(Notification, { foreignKey: "projectId", as: "notifications", onDelete: "CASCADE" });

// --- PROJECT MEMBER ASSOCIATIONS ---
ProjectMember.belongsTo(User, { foreignKey: "userId", as: "user" });
ProjectMember.belongsTo(Project, { foreignKey: "projectId", as: "project" });

// --- TASK ASSOCIATIONS ---
Task.belongsTo(Project, { foreignKey: "projectId", as: "project" });
Task.belongsTo(User, { foreignKey: "assigneeId", as: "assignee" });
Task.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Task.hasMany(Comment, { foreignKey: "taskId", as: "comments", onDelete: "CASCADE" });
Task.hasMany(Attachment, { foreignKey: "taskId", as: "attachments", onDelete: "CASCADE" });
Task.hasMany(Activity, { foreignKey: "taskId", as: "activities", onDelete: "CASCADE" });
Task.hasMany(Notification, { foreignKey: "taskId", as: "notifications", onDelete: "CASCADE" });

// --- COMMENT ASSOCIATIONS ---
Comment.belongsTo(Task, { foreignKey: "taskId", as: "task" });
Comment.belongsTo(User, { foreignKey: "userId", as: "user" });
Comment.belongsTo(Comment, { foreignKey: "parentId", as: "parent" });
Comment.hasMany(Comment, { foreignKey: "parentId", as: "replies", onDelete: "CASCADE" });
Comment.hasMany(Reaction, { foreignKey: "commentId", as: "reactions", onDelete: "CASCADE" });
Comment.hasMany(Attachment, { foreignKey: "commentId", as: "attachments", onDelete: "CASCADE" });

// --- ATTACHMENT ASSOCIATIONS ---
Attachment.belongsTo(Task, { foreignKey: "taskId", as: "task" });
Attachment.belongsTo(User, { foreignKey: "userId", as: "user" });
Attachment.belongsTo(Comment, { foreignKey: "commentId", as: "comment" });

// --- ACTIVITY ASSOCIATIONS ---
Activity.belongsTo(Project, { foreignKey: "projectId", as: "project" });
Activity.belongsTo(Task, { foreignKey: "taskId", as: "task" });
Activity.belongsTo(User, { foreignKey: "userId", as: "user" });

// --- INVITATION ASSOCIATIONS ---
Invitation.belongsTo(User, { foreignKey: "inviterId", as: "inviter" });
Invitation.belongsTo(User, { foreignKey: "userId", as: "invitedUser" });
Invitation.belongsTo(Project, { foreignKey: "projectId", as: "project" });

// --- NOTIFICATION ASSOCIATIONS ---
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });
Notification.belongsTo(Project, { foreignKey: "projectId", as: "project" });
Notification.belongsTo(Task, { foreignKey: "taskId", as: "task" });

// --- REACTION ASSOCIATIONS ---
Reaction.belongsTo(Comment, { foreignKey: "commentId", as: "comment" });
Reaction.belongsTo(User, { foreignKey: "userId", as: "user" });

// --- ADMIN MODEL ASSOCIATIONS ---
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

// Project Permission Associations
ProjectPermission.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project'
});

ProjectPermission.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

Project.hasMany(ProjectPermission, {
  foreignKey: 'projectId',
  as: 'permissions'
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

// Admin Notification Associations
User.hasOne(AdminNotificationPreferences, {
  foreignKey: 'userId',
  as: 'notificationPreferences'
});

AdminNotificationPreferences.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(SystemNotification, {
  foreignKey: 'createdBy',
  as: 'createdNotifications'
});

SystemNotification.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

SystemNotification.hasMany(NotificationDeliveryLog, {
  foreignKey: 'notificationId',
  as: 'deliveryLogs'
});

NotificationDeliveryLog.belongsTo(SystemNotification, {
  foreignKey: 'notificationId',
  as: 'notification'
});

NotificationDeliveryLog.belongsTo(User, {
  foreignKey: 'adminId',
  as: 'admin'
});

User.hasMany(NotificationDeliveryLog, {
  foreignKey: 'adminId',
  as: 'notificationDeliveries'
});

User.hasMany(NotificationTemplate, {
  foreignKey: 'createdBy',
  as: 'createdNotificationTemplates'
});

User.hasMany(NotificationTemplate, {
  foreignKey: 'updatedBy',
  as: 'updatedNotificationTemplates'
});

NotificationTemplate.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

NotificationTemplate.belongsTo(User, {
  foreignKey: 'updatedBy',
  as: 'updater'
});

module.exports = {
  User,
  Project,
  ProjectMember,
  Task,
  Comment,
  Attachment,
  Activity,
  Invitation,
  Notification,
  Reaction,
  AdminRole,
  AdminPermission,
  SystemLog,
  SystemSetting,
  AdminNotificationPreferences,
  SystemNotification,
  NotificationTemplate,
  NotificationDeliveryLog,
  ProjectPermission,
  ImpersonationLog,
  sequelize,
};
