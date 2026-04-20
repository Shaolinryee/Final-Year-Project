// Tests for Notification Controller
// Tests notification management functionality with pagination and filters

// Mock models before importing
jest.mock('../../src/models', () => ({
  Notification: {
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    count: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

// Import controller and mocked modules
const notificationController = require('../../src/controllers/notificationController');
const { Notification } = require('../../src/models');

describe('Notification Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyNotifications', () => {
    it('should get notifications for current user successfully', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockNotifications = [
        {
          id: 'notif-1',
          userId: 'user-123',
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: 'You have been assigned a new task',
          isRead: false,
          createdAt: new Date('2023-01-01')
        },
        {
          id: 'notif-2',
          userId: 'user-123',
          type: 'task_completed',
          title: 'Task Completed',
          message: 'A task has been completed',
          isRead: true,
          createdAt: new Date('2023-01-02')
        }
      ];

      Notification.findAll.mockResolvedValue(mockNotifications);

      // Act
      await notificationController.getMyNotifications(req, res);

      // Assert
      expect(Notification.findAll).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        order: [['createdAt', 'DESC']],
        limit: 50
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockNotifications
      });
    });

    it('should handle empty notifications list', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Notification.findAll.mockResolvedValue([]);

      // Act
      await notificationController.getMyNotifications(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: []
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

      Notification.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      await notificationController.getMyNotifications(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('getNotificationsPaginated', () => {
    it('should get paginated notifications with default parameters', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        query: {} // No query parameters
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockResult = {
        count: 25,
        rows: [
          {
            id: 'notif-1',
            userId: 'user-123',
            type: 'task_assigned',
            isRead: false
          }
        ]
      };

      Notification.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      await notificationController.getNotificationsPaginated(req, res);

      // Assert
      expect(Notification.findAndCountAll).toHaveBeenCalledWith({
        where: { userId: 'user-123', tab: 'direct' },
        order: [['createdAt', 'DESC']],
        limit: 20,
        offset: 0
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          data: mockResult.rows,
          total: 25,
          hasMore: true,
          nextOffset: 1
        }
      });
    });

    it('should get paginated notifications with custom parameters', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        query: {
          limit: '10',
          offset: '20',
          unreadOnly: 'true',
          tab: 'system'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockResult = {
        count: 5,
        rows: [
          {
            id: 'notif-1',
            userId: 'user-123',
            type: 'system_notification',
            isRead: false
          }
        ]
      };

      Notification.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      await notificationController.getNotificationsPaginated(req, res);

      // Assert
      expect(Notification.findAndCountAll).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          tab: 'system',
          isRead: false
        },
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 20
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          data: mockResult.rows,
          total: 5,
          hasMore: false, // 20 + 5 = 25 < 5 total, so no more
          nextOffset: null
        }
      });
    });

    it('should handle string conversion for limit and offset', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        query: {
          limit: '15',
          offset: '5'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Notification.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      // Act
      await notificationController.getNotificationsPaginated(req, res);

      // Assert
      expect(Notification.findAndCountAll).toHaveBeenCalledWith({
        where: { userId: 'user-123', tab: 'direct' },
        order: [['createdAt', 'DESC']],
        limit: 15,
        offset: 5
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should get unread notifications count successfully', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Notification.count.mockResolvedValue(5);

      // Act
      await notificationController.getUnreadCount(req, res);

      // Assert
      expect(Notification.count).toHaveBeenCalledWith({
        where: { userId: 'user-123', isRead: false }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: 5
      });
    });

    it('should return zero when no unread notifications', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Notification.count.mockResolvedValue(0);

      // Act
      await notificationController.getUnreadCount(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: 0
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read successfully', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        params: { id: 'notif-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockNotification = {
        id: 'notif-123',
        userId: 'user-123',
        type: 'task_assigned',
        title: 'New Task',
        isRead: false,
        save: jest.fn().mockResolvedValue(true)
      };

      Notification.findOne.mockResolvedValue(mockNotification);

      // Act
      await notificationController.markAsRead(req, res);

      // Assert
      expect(Notification.findOne).toHaveBeenCalledWith({
        where: { id: 'notif-123', userId: 'user-123' }
      });
      expect(mockNotification.isRead).toBe(true);
      expect(mockNotification.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockNotification
      });
    });

    it('should return 404 if notification not found', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        params: { id: 'nonexistent-notif' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Notification.findOne.mockResolvedValue(null);

      // Act
      await notificationController.markAsRead(req, res);

      // Assert
      expect(Notification.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent-notif', userId: 'user-123' }
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Notification not found'
      });
    });

    it('should return 404 if notification belongs to different user', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        params: { id: 'notif-456' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Notification.findOne.mockResolvedValue(null); // Not found for this user

      // Act
      await notificationController.markAsRead(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Notification not found'
      });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read successfully', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Notification.update.mockResolvedValue([5]); // 5 notifications updated

      // Act
      await notificationController.markAllAsRead(req, res);

      // Assert
      expect(Notification.update).toHaveBeenCalledWith(
        { isRead: true },
        { where: { userId: 'user-123', isRead: false } }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: 5
      });
    });

    it('should return zero when no notifications to mark as read', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Notification.update.mockResolvedValue([0]); // No notifications updated

      // Act
      await notificationController.markAllAsRead(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: 0
      });
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        params: { id: 'notif-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Notification.destroy.mockResolvedValue(1); // 1 row deleted

      // Act
      await notificationController.deleteNotification(req, res);

      // Assert
      expect(Notification.destroy).toHaveBeenCalledWith({
        where: { id: 'notif-123', userId: 'user-123' }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Notification deleted'
      });
    });

    it('should return 404 if notification not found for deletion', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        params: { id: 'nonexistent-notif' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Notification.destroy.mockResolvedValue(0); // No rows deleted

      // Act
      await notificationController.deleteNotification(req, res);

      // Assert
      expect(Notification.destroy).toHaveBeenCalledWith({
        where: { id: 'nonexistent-notif', userId: 'user-123' }
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Notification not found'
      });
    });

    it('should return 404 if trying to delete notification from different user', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        params: { id: 'notif-456' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Notification.destroy.mockResolvedValue(0); // No rows deleted (belongs to different user)

      // Act
      await notificationController.deleteNotification(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Notification not found'
      });
    });
  });
});
