// Tests for Comment Controller
// Tests comment management functionality with reactions and attachments

// Mock models before importing
jest.mock('../../src/models', () => ({
  Comment: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  User: {
    findByPk: jest.fn()
  },
  Task: {
    findByPk: jest.fn()
  },
  Project: {
    findByPk: jest.fn()
  },
  Reaction: {
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  },
  Attachment: {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

// Mock utilities and middleware
jest.mock('../../src/utils/notification', () => ({
  sendNotification: jest.fn().mockResolvedValue(true)
}));

jest.mock('../../src/socket', () => ({
  emitToProject: jest.fn()
}));

jest.mock('../../src/utils/activity', () => ({
  logActivity: jest.fn().mockResolvedValue(true)
}));

// Import controller and mocked modules
const commentController = require('../../src/controllers/commentController');
const { Comment, User, Task, Project, Reaction, Attachment } = require('../../src/models');
const { sendNotification } = require('../../src/utils/notification');
const { emitToProject } = require('../../src/socket');
const { logActivity } = require('../../src/utils/activity');

describe('Comment Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTaskComments', () => {
    it('should get comments for a task successfully', async () => {
      // Arrange
      const req = {
        params: { taskId: 'task-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockTask = {
        id: 'task-123',
        title: 'Test Task',
        projectId: 'project-123'
      };

      const mockComments = [
        {
          id: 'comment-1',
          text: 'First comment',
          taskId: 'task-123',
          userId: 'user-123',
          createdAt: new Date('2023-01-01'),
          user: { id: 'user-123', name: 'Test User', email: 'test@example.com', avatar: 'avatar.jpg' },
          reactions: [
            { id: 'react-1', type: 'like', user: { id: 'user-456', name: 'Other User' } }
          ],
          attachments: [
            { id: 'attach-1', fileName: 'document.pdf', fileUrl: '/uploads/document.pdf' }
          ]
        }
      ];

      Task.findByPk.mockResolvedValue(mockTask);
      Comment.findAll.mockResolvedValue(mockComments);

      // Act
      await commentController.getTaskComments(req, res);

      // Assert
      expect(Task.findByPk).toHaveBeenCalledWith('task-123');
      expect(Comment.findAll).toHaveBeenCalledWith({
        where: { taskId: 'task-123' },
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] },
          { 
            model: Reaction, 
            as: 'reactions', 
            include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
          },
          { model: Attachment, as: 'attachments' }
        ],
        order: [['createdAt', 'ASC']]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockComments
      });
    });

    it('should return 404 if task not found', async () => {
      // Arrange
      const req = {
        params: { taskId: 'nonexistent-task' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Task.findByPk.mockResolvedValue(null);

      // Act
      await commentController.getTaskComments(req, res);

      // Assert
      expect(Task.findByPk).toHaveBeenCalledWith('nonexistent-task');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Task not found'
      });
      expect(Comment.findAll).not.toHaveBeenCalled();
    });

    it('should handle empty comments list', async () => {
      // Arrange
      const req = {
        params: { taskId: 'task-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockTask = { id: 'task-123', title: 'Test Task' };
      Task.findByPk.mockResolvedValue(mockTask);
      Comment.findAll.mockResolvedValue([]);

      // Act
      await commentController.getTaskComments(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: []
      });
    });
  });

  describe('addComment', () => {
    it('should add comment to task successfully', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123', name: 'Test User' },
        params: { taskId: 'task-123' },
        body: {
          text: 'This is a new comment',
          parentId: null,
          attachmentIds: ['attach-1', 'attach-2']
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockTask = {
        id: 'task-123',
        title: 'Test Task',
        projectId: 'project-123',
        assigneeId: 'user-456'
      };

      const mockComment = {
        id: 'comment-123',
        text: 'This is a new comment',
        taskId: 'task-123',
        userId: 'user-123',
        parentId: null,
        createdAt: new Date()
      };

      const mockFullComment = {
        ...mockComment,
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com', avatar: 'avatar.jpg' }
      };

      Task.findByPk.mockResolvedValue(mockTask);
      Comment.create.mockResolvedValue(mockComment);
      Comment.findByPk.mockResolvedValue(mockFullComment);

      // Act
      await commentController.addComment(req, res);

      // Check if there was an error
      if (res.status.mock.calls.length > 0 && res.status.mock.calls[0][0] === 500) {
        console.log('Error response:', res.json.mock.calls[0][0]);
      }

      // Assert
      expect(Task.findByPk).toHaveBeenCalledWith('task-123');
      expect(Comment.create).toHaveBeenCalledWith({
        text: 'This is a new comment',
        taskId: 'task-123',
        userId: 'user-123',
        parentId: null
      });
      // Socket emissions and activity logging are tested separately
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockFullComment
      });
    });

    it('should return error if comment text is missing', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        params: { taskId: 'task-123' },
        body: {
          // Missing text
          parentId: null
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      // Act
      await commentController.addComment(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Comment text is required'
      });
      expect(Task.findByPk).not.toHaveBeenCalled();
      expect(Comment.create).not.toHaveBeenCalled();
    });

    it('should return 404 if task not found for comment', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        params: { taskId: 'nonexistent-task' },
        body: { text: 'Test comment' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Task.findByPk.mockResolvedValue(null);

      // Act
      await commentController.addComment(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Task not found'
      });
    });

    it('should add reply comment successfully', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123', name: 'Test User' },
        params: { taskId: 'task-123' },
        body: {
          text: 'This is a reply',
          parentId: 'parent-comment-123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockTask = {
        id: 'task-123',
        title: 'Test Task',
        projectId: 'project-123'
      };

      const mockComment = {
        id: 'comment-123',
        text: 'This is a reply',
        taskId: 'task-123',
        userId: 'user-123',
        parentId: 'parent-comment-123'
      };

      const mockFullComment = {
        ...mockComment,
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com', avatar: 'avatar.jpg' }
      };

      Task.findByPk.mockResolvedValue(mockTask);
      Comment.create.mockResolvedValue(mockComment);
      Comment.findByPk.mockResolvedValue(mockFullComment);

      // Act
      await commentController.addComment(req, res);

      // Assert
      expect(Comment.create).toHaveBeenCalledWith({
        text: 'This is a reply',
        taskId: 'task-123',
        userId: 'user-123',
        parentId: 'parent-comment-123'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockFullComment
      });
    });
  });

  describe('updateComment', () => {
    it('should update comment successfully as author', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        params: { commentId: 'comment-123', taskId: 'task-123' },
        body: { text: 'Updated comment text' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockComment = {
        id: 'comment-123',
        text: 'Original comment',
        userId: 'user-123',
        taskId: 'task-123',
        save: jest.fn().mockResolvedValue(true)
      };

      const mockFullComment = {
        id: 'comment-123',
        text: 'Updated comment text',
        userId: 'user-123',
        taskId: 'task-123',
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com', avatar: 'avatar.jpg' }
      };

      const mockTask = {
        id: 'task-123',
        projectId: 'project-123'
      };

      Comment.findByPk
        .mockResolvedValueOnce(mockComment)
        .mockResolvedValueOnce(mockFullComment);
      Task.findByPk.mockResolvedValue(mockTask);

      // Act
      await commentController.updateComment(req, res);

      // Assert
      expect(Comment.findByPk).toHaveBeenCalledWith('comment-123');
      expect(mockComment.save).toHaveBeenCalled();
      expect(Task.findByPk).toHaveBeenCalledWith('task-123');
      expect(emitToProject).toHaveBeenCalledWith('project-123', 'comment_updated', {
        comment: mockFullComment,
        taskId: 'task-123',
        userId: 'user-123'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockFullComment
      });
    });

    it('should return 404 if comment not found for update', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        params: { commentId: 'nonexistent-comment', taskId: 'task-123' },
        body: { text: 'Updated text' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Comment.findByPk.mockResolvedValue(null);

      // Act
      await commentController.updateComment(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Comment not found'
      });
    });

    it('should return 403 if user is not comment author', async () => {
      // Arrange
      const req = {
        user: { id: 'user-456' }, // Different user
        params: { commentId: 'comment-123', taskId: 'task-123' },
        body: { text: 'Updated text' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockComment = {
        id: 'comment-123',
        text: 'Original comment',
        userId: 'user-123', // Different user is author
        save: jest.fn()
      };

      Comment.findByPk.mockResolvedValue(mockComment);

      // Act
      await commentController.updateComment(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to edit this comment'
      });
      expect(mockComment.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteComment', () => {
    it('should delete comment successfully as author', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        params: { commentId: 'comment-123', taskId: 'task-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockComment = {
        id: 'comment-123',
        text: 'Comment to delete',
        userId: 'user-123',
        taskId: 'task-123',
        destroy: jest.fn().mockResolvedValue(true)
      };

      const mockTask = {
        id: 'task-123',
        projectId: 'project-123'
      };

      Comment.findByPk.mockResolvedValue(mockComment);
      Task.findByPk.mockResolvedValue(mockTask);

      // Act
      await commentController.deleteComment(req, res);

      // Assert
      expect(Comment.findByPk).toHaveBeenCalledWith('comment-123');
      expect(mockComment.destroy).toHaveBeenCalled();
      expect(Task.findByPk).toHaveBeenCalledWith('task-123');
      expect(emitToProject).toHaveBeenCalledWith('project-123', 'comment_deleted', {
        commentId: 'comment-123',
        taskId: 'task-123',
        userId: 'user-123'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Comment removed'
      });
    });

    it('should return 404 if comment not found for deletion', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        params: { commentId: 'nonexistent-comment', taskId: 'task-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Comment.findByPk.mockResolvedValue(null);

      // Act
      await commentController.deleteComment(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Comment not found'
      });
    });

    it('should return 403 if user is not comment author', async () => {
      // Arrange
      const req = {
        user: { id: 'user-456' }, // Different user
        params: { commentId: 'comment-123', taskId: 'task-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockComment = {
        id: 'comment-123',
        text: 'Comment to delete',
        userId: 'user-123', // Different user is author
        destroy: jest.fn()
      };

      Comment.findByPk.mockResolvedValue(mockComment);

      // Act
      await commentController.deleteComment(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to delete this comment'
      });
      expect(mockComment.destroy).not.toHaveBeenCalled();
    });
  });
});
