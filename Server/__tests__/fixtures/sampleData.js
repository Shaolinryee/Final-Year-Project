// Sample data fixtures for tests
// Provides consistent test data across all test files

// Sample users
const users = {
  admin: {
    id: 'admin-user-id',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'hashed-admin-password',
    role: 'admin',
    avatar: 'admin-avatar.jpg',
    isVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  regular: {
    id: 'regular-user-id',
    name: 'Regular User',
    email: 'user@example.com',
    password: 'hashed-user-password',
    role: 'user',
    avatar: 'user-avatar.jpg',
    isVerified: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  manager: {
    id: 'manager-user-id',
    name: 'Manager User',
    email: 'manager@example.com',
    password: 'hashed-manager-password',
    role: 'manager',
    avatar: 'manager-avatar.jpg',
    isVerified: true,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
};

// Sample projects
const projects = {
  active: {
    id: 'active-project-id',
    name: 'Active Project',
    description: 'An active project for testing',
    ownerId: users.regular.id,
    status: 'active',
    priority: 'high',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  completed: {
    id: 'completed-project-id',
    name: 'Completed Project',
    description: 'A completed project for testing',
    ownerId: users.regular.id,
    status: 'completed',
    priority: 'medium',
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-12-31'),
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-12-31')
  },
  archived: {
    id: 'archived-project-id',
    name: 'Archived Project',
    description: 'An archived project for testing',
    ownerId: users.manager.id,
    status: 'archived',
    priority: 'low',
    startDate: new Date('2022-01-01'),
    endDate: new Date('2022-12-31'),
    createdAt: new Date('2022-01-01'),
    updatedAt: new Date('2022-12-31')
  }
};

// Sample tasks
const tasks = {
  todo: {
    id: 'todo-task-id',
    title: 'Complete documentation',
    description: 'Write comprehensive documentation for the API',
    status: 'todo',
    priority: 'high',
    projectId: projects.active.id,
    assigneeId: users.regular.id,
    creatorId: users.manager.id,
    dueDate: new Date('2024-02-01'),
    estimatedHours: 8,
    actualHours: 0,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  inProgress: {
    id: 'inprogress-task-id',
    title: 'Implement user authentication',
    description: 'Add JWT-based authentication system',
    status: 'in_progress',
    priority: 'high',
    projectId: projects.active.id,
    assigneeId: users.regular.id,
    creatorId: users.manager.id,
    dueDate: new Date('2024-01-25'),
    estimatedHours: 16,
    actualHours: 8,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20')
  },
  completed: {
    id: 'completed-task-id',
    title: 'Setup database schema',
    description: 'Create initial database tables and relationships',
    status: 'completed',
    priority: 'medium',
    projectId: projects.completed.id,
    assigneeId: users.regular.id,
    creatorId: users.manager.id,
    dueDate: new Date('2023-06-01'),
    estimatedHours: 12,
    actualHours: 10,
    completedAt: new Date('2023-05-28'),
    createdAt: new Date('2023-05-01'),
    updatedAt: new Date('2023-05-28')
  }
};

// Sample comments
const comments = {
  task1: {
    id: 'comment-1-id',
    content: 'I think we should add more validation here',
    taskId: tasks.todo.id,
    userId: users.manager.id,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  },
  task2: {
    id: 'comment-2-id',
    content: 'Great progress on this task!',
    taskId: tasks.inProgress.id,
    userId: users.admin.id,
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21')
  }
};

// Sample attachments
const attachments = {
  task1: {
    id: 'attachment-1-id',
    filename: 'requirements.pdf',
    originalName: 'project-requirements.pdf',
    mimetype: 'application/pdf',
    size: 1024000,
    taskId: tasks.todo.id,
    userId: users.manager.id,
    path: '/uploads/requirements.pdf',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  task2: {
    id: 'attachment-2-id',
    filename: 'screenshot.png',
    originalName: 'bug-screenshot.png',
    mimetype: 'image/png',
    size: 512000,
    taskId: tasks.inProgress.id,
    userId: users.regular.id,
    path: '/uploads/screenshot.png',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
};

// Sample notifications
const notifications = {
  taskAssigned: {
    id: 'notification-1-id',
    title: 'New Task Assigned',
    message: 'You have been assigned a new task: Complete documentation',
    type: 'task_assigned',
    userId: users.regular.id,
    taskId: tasks.todo.id,
    projectId: projects.active.id,
    read: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  projectUpdated: {
    id: 'notification-2-id',
    title: 'Project Updated',
    message: 'Project "Active Project" has been updated',
    type: 'project_updated',
    userId: users.manager.id,
    projectId: projects.active.id,
    read: true,
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14')
  }
};

// Sample project members
const projectMembers = {
  owner: {
    id: 'member-1-id',
    projectId: projects.active.id,
    userId: users.regular.id,
    role: 'owner',
    permissions: ['read', 'write', 'delete', 'manage_members'],
    joinedAt: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  member: {
    id: 'member-2-id',
    projectId: projects.active.id,
    userId: users.manager.id,
    role: 'member',
    permissions: ['read', 'write'],
    joinedAt: new Date('2024-01-02'),
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  }
};

// Sample invitations
const invitations = {
  pending: {
    id: 'invitation-1-id',
    email: 'newuser@example.com',
    projectId: projects.active.id,
    invitedById: users.regular.id,
    status: 'pending',
    token: 'invitation-token-123',
    expiresAt: new Date('2024-02-01'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  accepted: {
    id: 'invitation-2-id',
    email: users.manager.email,
    userId: users.manager.id,
    projectId: projects.active.id,
    invitedById: users.regular.id,
    status: 'accepted',
    token: 'invitation-token-456',
    acceptedAt: new Date('2024-01-02'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02')
  }
};

// Export all fixtures
module.exports = {
  users,
  projects,
  tasks,
  comments,
  attachments,
  notifications,
  projectMembers,
  invitations
};
