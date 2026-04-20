// Tests for Task Controller
// Tests all task management functionality with proper mocking

// Mock models before importing
jest.mock('../../src/models', () => ({
  Task: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  Project: {
    findByPk: jest.fn()
  },
  User: {
    findByPk: jest.fn()
  },
  ProjectMember: {
    findAll: jest.fn()
  },
  Attachment: {},
  Comment: {}
}));

// Mock utilities and middleware
jest.mock('../../src/utils/activity', () => ({
  logActivity: jest.fn().mockResolvedValue(true)
}));

jest.mock('../../src/utils/notification', () => ({
  sendNotification: jest.fn().mockResolvedValue(true)
}));

jest.mock('../../src/middleware/rbac', () => ({
  getUserProjectRole: jest.fn()
}));

jest.mock('../../src/socket', () => ({
  emitToProject: jest.fn()
}));

// Import controller and mocked modules
const taskController = require('../../src/controllers/taskController');
const { Task, Project, User, ProjectMember } = require('../../src/models');
const { logActivity } = require('../../src/utils/activity');
const { sendNotification } = require('../../src/utils/notification');
const { getUserProjectRole } = require('../../src/middleware/rbac');
const { emitToProject } = require('../../src/socket');

describe('Task Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasksByProject', () => {
    it('should get all tasks for a project successfully', async () => {
      // Arrange
      const req = {
        params: { projectId: 'project-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockTasks = [
        {
          id: 'task-1',
          title: 'Test Task 1',
          assignee: { id: 'user-1', name: 'User 1', email: 'user1@test.com', avatar: 'avatar1.jpg' },
          creator: { id: 'user-2', name: 'User 2', email: 'user2@test.com' }
        }
      ];

      Task.findAll.mockResolvedValue(mockTasks);

      // Act
      await taskController.getTasksByProject(req, res);

      // Assert
      expect(Task.findAll).toHaveBeenCalledWith({
        where: { projectId: 'project-123' },
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
        ],
        order: [['createdAt', 'DESC']]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockTasks });
    });

    it('should handle errors when getting tasks', async () => {
      // Arrange
      const req = { params: { projectId: 'project-123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Task.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      await taskController.getTasksByProject(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('getTaskById', () => {
    it('should get task by ID successfully', async () => {
      // Arrange
      const req = { params: { id: 'task-123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockTask = {
        id: 'task-123',
        title: 'Test Task',
        project: { id: 'project-1', name: 'Test Project' },
        assignee: { id: 'user-1', name: 'User 1', email: 'user1@test.com', avatar: 'avatar1.jpg' },
        creator: { id: 'user-2', name: 'User 2', email: 'user2@test.com' },
        comments: [],
        attachments: []
      };

      Task.findByPk.mockResolvedValue(mockTask);

      // Act
      await taskController.getTaskById(req, res);

      // Assert
      expect(Task.findByPk).toHaveBeenCalledWith('task-123', {
        include: [
          { model: Project, as: 'project', attributes: ['id', 'name'] },
          { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
          {
            model: expect.any(Object),
            as: 'comments',
            include: [
              { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] },
              { model: expect.any(Object), as: 'attachments' }
            ]
          },
          {
            model: expect.any(Object),
            as: 'attachments',
            where: { commentId: null },
            required: false,
            include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
          }
        ]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockTask });
    });

    it('should return 404 if task not found', async () => {
      // Arrange
      const req = { params: { id: 'nonexistent-task' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Task.findByPk.mockResolvedValue(null);

      // Act
      await taskController.getTaskById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Task not found'
      });
    });
  });

  describe('searchTasks', () => {
    it('should search tasks with query parameters', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        query: {
          q: 'test',
          projectId: 'project-123',
          status: 'todo',
          priority: 'high'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockTasks = [
        { id: 'task-1', title: 'Test Task', project: { id: 'project-123', name: 'Test Project', color: 'blue' } }
      ];

      Task.findAll.mockResolvedValue(mockTasks);

      // Act
      await taskController.searchTasks(req, res);

      // Assert
      expect(Task.findAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          projectId: 'project-123',
          status: 'todo',
          priority: 'high'
        }),
        include: [
          { model: Project, as: 'project', attributes: ['id', 'name', 'color'] },
          { model: User, as: 'assignee', attributes: ['id', 'name', 'avatar'] },
          { model: User, as: 'creator', attributes: ['id', 'name'] }
        ],
        order: [['createdAt', 'DESC']]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 1, data: mockTasks });
    });

    it('should return empty array if user has no project memberships', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        query: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      ProjectMember.findAll.mockResolvedValue([]);

      // Act
      await taskController.searchTasks(req, res);

      // Assert
      expect(ProjectMember.findAll).toHaveBeenCalledWith({ where: { userId: 'user-123' } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 0, data: [] });
    });
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123', name: 'Test User' },
        body: {
          title: 'New Task',
          description: 'Task description',
          projectId: 'project-123',
          assigneeId: 'user-456',
          status: 'todo',
          priority: 'high'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockTask = {
        id: 'task-123',
        title: 'New Task',
        assignee: { id: 'user-456', name: 'Assignee', email: 'assignee@test.com', avatar: 'avatar.jpg' },
        creator: { id: 'user-123', name: 'Test User', email: 'user@test.com' }
      };

      getUserProjectRole.mockResolvedValue('admin');
      Task.create.mockResolvedValue({ id: 'task-123', title: 'New Task' });
      Task.findByPk.mockResolvedValue(mockTask);
      Project.findByPk.mockResolvedValue({ id: 'project-123', name: 'Test Project' });

      // Act
      await taskController.createTask(req, res);

      // Assert
      expect(getUserProjectRole).toHaveBeenCalledWith('user-123', 'project-123');
      expect(Task.create).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Task description',
        projectId: 'project-123',
        assigneeId: 'user-456',
        creatorId: 'user-123',
        status: 'todo',
        priority: 'high',
        tags: []
      });
      expect(logActivity).toHaveBeenCalledWith({
        userId: 'user-123',
        projectId: 'project-123',
        taskId: 'task-123',
        action: 'created_task',
        details: 'Created task New Task'
      });
      expect(sendNotification).toHaveBeenCalledWith({
        userId: 'user-456',
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: 'Test User assigned you a task: New Task in Test Project',
        projectId: 'project-123',
        taskId: 'task-123',
        link: '/projects/project-123/tasks/task-123'
      });
      expect(emitToProject).toHaveBeenCalledWith('project-123', 'task_created', { task: mockTask, userId: 'user-123' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockTask });
    });

    it('should return error if title or projectId is missing', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        body: {
          description: 'Task description'
          // Missing title and projectId
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      // Act
      await taskController.createTask(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Title and Project ID are required'
      });
      expect(getUserProjectRole).not.toHaveBeenCalled();
    });

    it('should return error if user lacks permission', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        body: {
          title: 'New Task',
          projectId: 'project-123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      getUserProjectRole.mockResolvedValue('member'); // Not admin or owner

      // Act
      await taskController.createTask(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Only project admins and owners can create tasks'
      });
      expect(Task.create).not.toHaveBeenCalled();
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123', name: 'Test User' },
        params: { id: 'task-123' },
        body: {
          status: 'done',
          priority: 'high'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockTask = {
        id: 'task-123',
        title: 'Test Task',
        status: 'in_progress',
        assigneeId: 'user-456',
        creatorId: 'user-789',
        projectId: 'project-123',
        update: jest.fn().mockResolvedValue({
          id: 'task-123',
          title: 'Test Task',
          status: 'done',
          priority: 'high',
          assigneeId: 'user-456',
          creatorId: 'user-789',
          projectId: 'project-123'
        })
      };

      const updatedTask = {
        id: 'task-123',
        title: 'Test Task',
        status: 'done',
        assignee: { id: 'user-456', name: 'Assignee' },
        creator: { id: 'user-789', name: 'Creator' }
      };

      Task.findByPk.mockResolvedValue(mockTask);
      getUserProjectRole.mockResolvedValue('member');
      
      // Mock the second findByPk call that happens after update
      Task.findByPk.mockResolvedValueOnce(mockTask).mockResolvedValueOnce({ ...updatedTask, projectId: 'project-123' });

      // Act
      await taskController.updateTask(req, res);

      // Assert
      expect(Task.findByPk).toHaveBeenCalledWith('task-123');
      expect(getUserProjectRole).toHaveBeenCalledWith('user-123', 'project-123');
      expect(mockTask.update).toHaveBeenCalledWith({ status: 'done', priority: 'high' });
      expect(logActivity).toHaveBeenCalledWith({
        userId: 'user-123',
        projectId: 'project-123',
        taskId: 'task-123',
        action: 'status_changed',
        details: 'Updated task status to done'
      });
      expect(emitToProject).toHaveBeenCalledWith('project-123', 'task_updated', { task: expect.objectContaining({ ...updatedTask, projectId: 'project-123' }), userId: 'user-123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: expect.objectContaining({ ...updatedTask, projectId: 'project-123' }) });
    });

    it('should return 404 if task not found', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        params: { id: 'nonexistent-task' },
        body: { status: 'done' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Task.findByPk.mockResolvedValue(null);

      // Act
      await taskController.updateTask(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Task not found'
      });
    });

    it('should return error if user is not project member', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        params: { id: 'task-123' },
        body: { title: 'Updated Title' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockTask = {
        id: 'task-123',
        projectId: 'project-123'
      };

      Task.findByPk.mockResolvedValue(mockTask);
      getUserProjectRole.mockResolvedValue(null);

      // Act
      await taskController.updateTask(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'You are not a member of this project'
      });
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        params: { id: 'task-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockTask = {
        id: 'task-123',
        title: 'Test Task',
        projectId: 'project-123',
        destroy: jest.fn().mockResolvedValue(true)
      };

      Task.findByPk.mockResolvedValue(mockTask);
      getUserProjectRole.mockResolvedValue('admin');

      // Act
      await taskController.deleteTask(req, res);

      // Assert
      expect(Task.findByPk).toHaveBeenCalledWith('task-123');
      expect(getUserProjectRole).toHaveBeenCalledWith('user-123', 'project-123');
      expect(mockTask.destroy).toHaveBeenCalled();
      expect(emitToProject).toHaveBeenCalledWith('project-123', 'task_deleted', {
        taskId: 'task-123',
        projectId: 'project-123',
        userId: 'user-123'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Task removed' });
    });

    it('should return 404 if task not found', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        params: { id: 'nonexistent-task' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Task.findByPk.mockResolvedValue(null);

      // Act
      await taskController.deleteTask(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Task not found'
      });
    });

    it('should return error if user lacks permission to delete', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        params: { id: 'task-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockTask = {
        id: 'task-123',
        projectId: 'project-123',
        destroy: jest.fn().mockResolvedValue(true)
      };

      Task.findByPk.mockResolvedValue(mockTask);
      getUserProjectRole.mockResolvedValue('member'); // Not admin or owner

      // Act
      await taskController.deleteTask(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Only project admins and owners can delete tasks'
      });
      expect(mockTask.destroy).not.toHaveBeenCalled();
    });
  });
});
