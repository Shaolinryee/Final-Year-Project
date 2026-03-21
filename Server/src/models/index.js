const User = require("./User");
const Project = require("./Project");
const ProjectMember = require("./ProjectMember");
const Task = require("./Task");
const Comment = require("./Comment");
const Attachment = require("./Attachment");
const Activity = require("./Activity");
const Invitation = require("./Invitation");
const Notification = require("./Notification");

// --- USER ASSOCIATIONS ---
User.hasMany(Project, { foreignKey: "ownerId", as: "ownedProjects" });
User.hasMany(ProjectMember, { foreignKey: "userId", as: "memberships" });
User.hasMany(Task, { foreignKey: "assigneeId", as: "assignedTasks" });
User.hasMany(Task, { foreignKey: "creatorId", as: "createdTasks" });
User.hasMany(Comment, { foreignKey: "userId", as: "comments" });
User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
User.hasMany(Attachment, { foreignKey: "userId", as: "attachments" });

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

// --- ATTACHMENT ASSOCIATIONS ---
Attachment.belongsTo(Task, { foreignKey: "taskId", as: "task" });
Attachment.belongsTo(User, { foreignKey: "userId", as: "user" });

// --- ACTIVITY ASSOCIATIONS ---
Activity.belongsTo(Project, { foreignKey: "projectId", as: "project" });
Activity.belongsTo(Task, { foreignKey: "taskId", as: "task" });
Activity.belongsTo(User, { foreignKey: "userId", as: "user" });

// --- INVITATION ASSOCIATIONS ---
Invitation.belongsTo(User, { foreignKey: "inviterId", as: "inviter" });
Invitation.belongsTo(Project, { foreignKey: "projectId", as: "project" });

// --- NOTIFICATION ASSOCIATIONS ---
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });
Notification.belongsTo(Project, { foreignKey: "projectId", as: "project" });
Notification.belongsTo(Task, { foreignKey: "taskId", as: "task" });

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
};
