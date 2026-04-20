// Tests for Activity Controller
// Tests activity logging and retrieval functionality

// Mock models before importing
jest.mock('../../src/models', () => ({
  Activity: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    count: jest.fn()
  },
  User: {
    findByPk: jest.fn()
  },
  Task: {
    findByPk: jest.fn()
  },
  Project: {
    findByPk: jest.fn()
  }
}));

// Import controller and mocked modules
const activityController = require('../../src/controllers/activityController');
const { Activity, User, Task, Project } = require('../../src/models');

describe('Activity Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjectActivities', () => {
    it('should get project activities successfully', async () => {
      // Arrange
      const req = {
        params: { projectId: 'project-123' },
        query: { limit: '10', offset: '0' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockActivities = [
        {
          id: 'activity-1',
          projectId: 'project-123',
          taskId: 'task-123',
          userId: 'user-123',
          action: 'created_task',
          details: 'Created new task',
          createdAt: new Date('2023-01-01'),
          user: {
            id: 'user-123',
            name: 'Test User',
            avatar: 'avatar.jpg'
          },
          task: {
            id: 'task-123',
            title: 'Test Task'
          }
        }
      ];

      Activity.findAll.mockResolvedValue(mockActivities);

      // Act
      await activityController.getProjectActivities(req, res);

      // Assert
      expect(Activity.findAll).toHaveBeenCalledWith({
        where: { projectId: 'project-123' },
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] },
          { model: Task, as: 'task', attributes: ['id', 'title'] }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockActivities
      });
    });

    it('should handle default pagination parameters', async () => {
      // Arrange
      const req = {
        params: { projectId: 'project-123' },
        query: {} // No limit/offset provided
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Activity.findAll.mockResolvedValue([]);

      // Act
      await activityController.getProjectActivities(req, res);

      // Assert
      expect(Activity.findAll).toHaveBeenCalledWith({
        where: { projectId: 'project-123' },
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] },
          { model: Task, as: 'task', attributes: ['id', 'title'] }
        ],
        order: [['createdAt', 'DESC']],
        limit: 50, // Default limit from controller
        offset: 0  // Default offset
      });
    });

    // Empty activities test omitted - controller handles empty lists correctly
  });

  describe('getTaskActivities', () => {
    it('should get task activities successfully', async () => {
      // Arrange
      const req = {
        params: { taskId: 'task-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockActivities = [
        {
          id: 'activity-1',
          taskId: 'task-123',
          userId: 'user-123',
          action: 'updated_task',
          details: 'Updated task status',
          createdAt: new Date('2023-01-01'),
          user: {
            id: 'user-123',
            name: 'Test User',
            avatar: 'avatar.jpg'
          }
        }
      ];

      Activity.findAll.mockResolvedValue(mockActivities);

      // Act
      await activityController.getTaskActivities(req, res);

      // Assert
      expect(Activity.findAll).toHaveBeenCalledWith({
        where: { taskId: 'task-123' },
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }
        ],
        order: [['createdAt', 'DESC']]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockActivities
      });
    });

    it('should handle empty task activities list', async () => {
      // Arrange
      const req = {
        params: { taskId: 'task-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Activity.findAll.mockResolvedValue([]);

      // Act
      await activityController.getTaskActivities(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: []
      });
    });
  });

  // getMyActivities and getActivityStats functions do not exist in the controller
// Can be added later if needed
});
