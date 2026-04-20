// Tests for User Controller
// Tests user profile and management functionality

// Mock models before importing
jest.mock('../../src/models', () => ({
  User: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn()
  }
}));

jest.mock('sequelize', () => ({
  Op: {
    or: Symbol.for('or'),
    iLike: Symbol.for('iLike'),
    ne: Symbol.for('ne')
  }
}));

// Import controller and mocked modules
const userController = require('../../src/controllers/userController');
const { User } = require('../../src/models');
const { Op } = require('sequelize');

describe('User Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('should get current user profile successfully', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'avatar.jpg'
      };

      User.findByPk.mockResolvedValue(mockUser);

      // Act
      await userController.getMe(req, res);

      // Assert
      expect(User.findByPk).toHaveBeenCalledWith('user-123', {
        attributes: { exclude: ['password'] }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
    });

    it('should return 404 if user not found', async () => {
      // Arrange
      const req = {
        user: { id: 'nonexistent-user' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      User.findByPk.mockResolvedValue(null);

      // Act
      await userController.getMe(req, res);

      // Assert
      expect(User.findByPk).toHaveBeenCalledWith('nonexistent-user', {
        attributes: { exclude: ['password'] }
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      User.findByPk.mockRejectedValue(new Error('Database error'));

      // Act
      await userController.getMe(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('getUserById', () => {
    it('should get user by ID successfully', async () => {
      // Arrange
      const req = {
        params: { id: 'user-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'avatar.jpg',
        role: 'user'
      };

      User.findByPk.mockResolvedValue(mockUser);

      // Act
      await userController.getUserById(req, res);

      // Assert
      expect(User.findByPk).toHaveBeenCalledWith('user-123', {
        attributes: ['id', 'name', 'email', 'avatar', 'role']
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
    });

    it('should return 404 if user not found', async () => {
      // Arrange
      const req = {
        params: { id: 'nonexistent-user' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      User.findByPk.mockResolvedValue(null);

      // Act
      await userController.getUserById(req, res);

      // Assert
      expect(User.findByPk).toHaveBeenCalledWith('nonexistent-user', {
        attributes: ['id', 'name', 'email', 'avatar', 'role']
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });
  });

  describe('searchUsers', () => {
    it('should search users by name successfully', async () => {
      // Arrange
      const req = {
        query: { q: 'test' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockUsers = [
        {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          avatar: 'avatar1.jpg'
        },
        {
          id: 'user-2',
          name: 'Test User 2',
          email: 'test2@example.com',
          avatar: 'avatar2.jpg'
        }
      ];

      User.findAll.mockResolvedValue(mockUsers);

      // Act
      await userController.searchUsers(req, res);

      // Assert
      expect(User.findAll).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: '%test%' } },
            { email: { [Op.iLike]: '%test%' } }
          ]
        },
        attributes: ['id', 'name', 'email', 'avatar'],
        limit: 10
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers
      });
    });

    it('should search users by email successfully', async () => {
      // Arrange
      const req = {
        query: { q: 'example.com' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockUsers = [
        {
          id: 'user-1',
          name: 'User One',
          email: 'user1@example.com',
          avatar: 'avatar1.jpg'
        }
      ];

      User.findAll.mockResolvedValue(mockUsers);

      // Act
      await userController.searchUsers(req, res);

      // Assert
      expect(User.findAll).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: '%example.com%' } },
            { email: { [Op.iLike]: '%example.com%' } }
          ]
        },
        attributes: ['id', 'name', 'email', 'avatar'],
        limit: 10
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers
      });
    });

    it('should return error if search query is missing', async () => {
      // Arrange
      const req = {
        query: {} // Missing 'q' parameter
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      // Act
      await userController.searchUsers(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Search query is required'
      });
      expect(User.findAll).not.toHaveBeenCalled();
    });

    it('should handle empty search results', async () => {
      // Arrange
      const req = {
        query: { q: 'nonexistent' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      User.findAll.mockResolvedValue([]);

      // Act
      await userController.searchUsers(req, res);

      // Assert
      expect(User.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: []
      });
    });
  });

  describe('updateProfile', () => {
    it('should update user name successfully', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        body: { name: 'Updated Name' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'avatar.jpg',
        save: jest.fn().mockResolvedValue(true)
      };

      User.findByPk.mockResolvedValue(mockUser);

      // Act
      await userController.updateProfile(req, res);

      // Assert
      expect(User.findByPk).toHaveBeenCalledWith('user-123');
      expect(mockUser.name).toBe('Updated Name');
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Profile updated',
        data: {
          id: 'user-123',
          name: 'Updated Name',
          email: 'test@example.com',
          avatar: 'avatar.jpg'
        }
      });
    });

    it('should update user avatar successfully', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        body: { avatar: 'new-avatar.jpg' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'old-avatar.jpg',
        save: jest.fn().mockResolvedValue(true)
      };

      User.findByPk.mockResolvedValue(mockUser);

      // Act
      await userController.updateProfile(req, res);

      // Assert
      expect(mockUser.avatar).toBe('new-avatar.jpg');
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Profile updated',
        data: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          avatar: 'new-avatar.jpg'
        }
      });
    });

    it('should update both name and avatar successfully', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        body: { name: 'New Name', avatar: 'new-avatar.jpg' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'old-avatar.jpg',
        save: jest.fn().mockResolvedValue(true)
      };

      User.findByPk.mockResolvedValue(mockUser);

      // Act
      await userController.updateProfile(req, res);

      // Assert
      expect(mockUser.name).toBe('New Name');
      expect(mockUser.avatar).toBe('new-avatar.jpg');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      // Arrange
      const req = {
        user: { id: 'nonexistent-user' },
        body: { name: 'Updated Name' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      User.findByPk.mockResolvedValue(null);

      // Act
      await userController.updateProfile(req, res);

      // Assert
      expect(User.findByPk).toHaveBeenCalledWith('nonexistent-user');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    it('should handle empty body gracefully', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        body: {} // Empty body
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'avatar.jpg',
        save: jest.fn().mockResolvedValue(true)
      };

      User.findByPk.mockResolvedValue(mockUser);

      // Act
      await userController.updateProfile(req, res);

      // Assert
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      // Name and avatar should remain unchanged
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Profile updated',
        data: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          avatar: 'avatar.jpg'
        }
      });
    });
  });
});
