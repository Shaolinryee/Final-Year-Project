// Mock Sequelize models for testing
// This provides consistent mocking across all test files

const { Sequelize, DataTypes } = require('sequelize');

// Mock sequelize instance
const mockSequelize = {
  authenticate: jest.fn().mockResolvedValue(true),
  sync: jest.fn().mockResolvedValue(true),
  query: jest.fn().mockResolvedValue([]),
  close: jest.fn().mockResolvedValue(true),
  Op: {
    gt: Symbol.for('gt'),
    lt: Symbol.for('lt'),
    gte: Symbol.for('gte'),
    lte: Symbol.for('lte'),
    ne: Symbol.for('ne'),
    in: Symbol.for('in'),
    notIn: Symbol.for('notIn'),
    like: Symbol.for('like'),
    ilike: Symbol.for('ilike'),
    and: Symbol.for('and'),
    or: Symbol.for('or')
  },
  transaction: jest.fn().mockImplementation((callback) => {
    const mockTransaction = {
      commit: jest.fn().mockResolvedValue(true),
      rollback: jest.fn().mockResolvedValue(true)
    };
    return callback(mockTransaction);
  })
};

// Base model mock factory
const createModelMock = (modelName, defaultData = {}) => {
  const mockMethods = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn(),
    findAndCountAll: jest.fn(),
    bulkCreate: jest.fn(),
    bulkUpdate: jest.fn(),
    bulkDestroy: jest.fn(),
    validate: jest.fn().mockResolvedValue(true),
    save: jest.fn().mockResolvedValue(true),
    reload: jest.fn().mockResolvedValue(true),
    get: jest.fn(),
    set: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
    has: jest.fn(),
    createAssociation: jest.fn()
  };

  // Set default return values
  mockMethods.findOne.mockResolvedValue(null);
  mockMethods.findAll.mockResolvedValue([]);
  mockMethods.findByPk.mockResolvedValue(null);
  mockMethods.create.mockResolvedValue({ id: 'new-id', ...defaultData });
  mockMethods.update.mockResolvedValue([1]);
  mockMethods.destroy.mockResolvedValue(1);
  mockMethods.count.mockResolvedValue(0);
  mockMethods.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

  const mockModel = {
    ...mockMethods,
    modelName,
    primaryKey: 'id',
    associations: {},
    rawAttributes: {},
    _options: {},
    sequelize: mockSequelize
  };

  return mockModel;
};

// Create model mocks with sample data
const User = createModelMock('User', global.testUtils?.sampleUser || {});
const Project = createModelMock('Project', global.testUtils?.sampleProject || {});
const Task = createModelMock('Task', global.testUtils?.sampleTask || {});
const Comment = createModelMock('Comment', {
  id: 'test-comment-id',
  content: 'Test comment',
  taskId: 'test-task-id',
  userId: 'test-user-id'
});
const Attachment = createModelMock('Attachment', {
  id: 'test-attachment-id',
  filename: 'test-file.pdf',
  originalName: 'test-file.pdf',
  taskId: 'test-task-id',
  userId: 'test-user-id'
});
const Activity = createModelMock('Activity', {
  id: 'test-activity-id',
  action: 'created_task',
  projectId: 'test-project-id',
  userId: 'test-user-id'
});
const Notification = createModelMock('Notification', {
  id: 'test-notification-id',
  title: 'Test Notification',
  message: 'Test message',
  userId: 'test-user-id',
  read: false
});
const ProjectMember = createModelMock('ProjectMember', {
  id: 'test-member-id',
  projectId: 'test-project-id',
  userId: 'test-user-id',
  role: 'member'
});
const Invitation = createModelMock('Invitation', {
  id: 'test-invitation-id',
  email: 'invite@example.com',
  projectId: 'test-project-id',
  status: 'pending'
});

// Admin models
const AdminRole = createModelMock('AdminRole', {
  id: 'test-admin-role-id',
  name: 'admin',
  permissions: ['all']
});
const AdminPermission = createModelMock('AdminPermission', {
  id: 'test-admin-permission-id',
  name: 'manage_users',
  description: 'Manage users'
});
const SystemLog = createModelMock('SystemLog', {
  id: 'test-log-id',
  action: 'user_login',
  userId: 'test-user-id',
  details: {}
});
const SystemSetting = createModelMock('SystemSetting', {
  id: 'test-setting-id',
  key: 'test_setting',
  value: 'test_value'
});

// Mock associations setup
const setupAssociations = () => {
  // User associations
  User.hasMany = jest.fn();
  User.belongsTo = jest.fn();
  User.hasOne = jest.fn();
  User.belongsToMany = jest.fn();

  // Project associations
  Project.hasMany = jest.fn();
  Project.belongsTo = jest.fn();
  Project.hasOne = jest.fn();
  Project.belongsToMany = jest.fn();

  // Task associations
  Task.hasMany = jest.fn();
  Task.belongsTo = jest.fn();
  Task.hasOne = jest.fn();
  Task.belongsToMany = jest.fn();

  // Other models
  [Comment, Attachment, Activity, Notification, ProjectMember, Invitation].forEach(model => {
    model.hasMany = jest.fn();
    model.belongsTo = jest.fn();
    model.hasOne = jest.fn();
    model.belongsToMany = jest.fn();
  });
};

// Setup associations
setupAssociations();

// Export all models
module.exports = {
  sequelize: mockSequelize,
  User,
  Project,
  Task,
  Comment,
  Attachment,
  Activity,
  Notification,
  ProjectMember,
  Invitation,
  AdminRole,
  AdminPermission,
  SystemLog,
  SystemSetting,
  // Add other models as needed
  Reaction: createModelMock('Reaction'),
  AdminNotificationPreferences: createModelMock('AdminNotificationPreferences'),
  SystemNotification: createModelMock('SystemNotification'),
  NotificationTemplate: createModelMock('NotificationTemplate'),
  NotificationDeliveryLog: createModelMock('NotificationDeliveryLog'),
  ProjectPermission: createModelMock('ProjectPermission'),
  ImpersonationLog: createModelMock('ImpersonationLog'),
  admin: createModelMock('admin')
};

// Helper function to reset all mocks
module.exports.resetAllMocks = () => {
  Object.values(module.exports).forEach(model => {
    if (model && typeof model === 'object' && model.findOne) {
      Object.getOwnPropertyNames(model).forEach(method => {
        if (typeof model[method] === 'function' && model[method].mockClear) {
          model[method].mockClear();
        }
      });
    }
  });
};
