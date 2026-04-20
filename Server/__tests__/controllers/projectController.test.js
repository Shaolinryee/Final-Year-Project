// Tests for Project Controller
// Tests project management functionality with permissions and associations

// Mock models before importing
jest.mock('../../src/models', () => ({
  Project: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  User: {
    findByPk: jest.fn()
  },
  ProjectMember: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  },
  Task: {
    findAll: jest.fn(),
    count: jest.fn()
  }
}));

jest.mock('sequelize', () => ({
  Op: {
    ne: Symbol.for('ne'),
    fn: jest.fn(),
    col: jest.fn()
  }
}));

// Mock utilities and middleware
jest.mock('../../src/utils/activity', () => ({
  logActivity: jest.fn().mockResolvedValue(true)
}));

jest.mock('../../src/socket', () => ({
  emitToProject: jest.fn()
}));

// Import controller and mocked modules
const projectController = require('../../src/controllers/projectController');
const { Project, User, ProjectMember, Task } = require('../../src/models');
const { Op } = require('sequelize');
const { logActivity } = require('../../src/utils/activity');
const { emitToProject } = require('../../src/socket');

describe('Project Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjects', () => {
    it('should get all projects for current user (owned and member)', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const ownedProjects = [
        {
          id: 'project-1',
          name: 'Owned Project 1',
          owner: { id: 'user-123', name: 'Test User', email: 'test@example.com' }
        }
      ];

      const memberProjects = [
        {
          id: 'project-2',
          name: 'Member Project 1',
          owner: { id: 'user-456', name: 'Other User', email: 'other@example.com' }
        }
      ];

      Project.findAll
        .mockResolvedValueOnce(ownedProjects) // First call for owned projects
        .mockResolvedValueOnce(memberProjects); // Second call for member projects

      // Act
      await projectController.getProjects(req, res);

      // Assert
      expect(Project.findAll).toHaveBeenCalledTimes(2);
      
      // Check owned projects query
      expect(Project.findAll).toHaveBeenNthCalledWith(1, {
        where: { ownerId: 'user-123' },
        include: [
          { model: User, as: 'owner', attributes: ['id', 'name', 'email'] }
        ]
      });

      // Check member projects query
      expect(Project.findAll).toHaveBeenNthCalledWith(2, {
        where: {
          '$members.userId$': 'user-123',
          ownerId: { [Op.ne]: 'user-123' }
        },
        include: [
          { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
          { model: ProjectMember, as: 'members', where: { userId: 'user-123' }, required: true }
        ],
        distinct: true
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [...ownedProjects, ...memberProjects]
      });
    });

    it('should handle empty project list', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Project.findAll
        .mockResolvedValueOnce([]) // No owned projects
        .mockResolvedValueOnce([]); // No member projects

      // Act
      await projectController.getProjects(req, res);

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

      Project.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      await projectController.getProjects(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('getProjectById', () => {
    it('should get project by ID successfully', async () => {
      // Arrange
      const req = {
        params: { id: 'project-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockProject = {
        id: 'project-123',
        name: 'Test Project',
        description: 'Test Description',
        owner: { id: 'user-123', name: 'Test User', email: 'test@example.com' }
      };

      Project.findByPk.mockResolvedValue(mockProject);

      // Act
      await projectController.getProjectById(req, res);

      // Assert
      expect(Project.findByPk).toHaveBeenCalledWith('project-123', {
        include: [
          { model: User, as: 'owner', attributes: ['id', 'name', 'email'] }
        ]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProject
      });
    });

    it('should return 404 if project not found', async () => {
      // Arrange
      const req = {
        params: { id: 'nonexistent-project' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Project.findByPk.mockResolvedValue(null);

      // Act
      await projectController.getProjectById(req, res);

      // Assert
      expect(Project.findByPk).toHaveBeenCalledWith('nonexistent-project', {
        include: [
          { model: User, as: 'owner', attributes: ['id', 'name', 'email'] }
        ]
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Project not found'
      });
    });
  });

  describe('createProject', () => {
    it('should create a project successfully', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123', name: 'Test User' },
        body: {
          name: 'New Project',
          description: 'Project Description',
          color: '#FF5733'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockProject = {
        id: 'project-123',
        name: 'New Project',
        description: 'Project Description',
        color: '#FF5733',
        ownerId: 'user-123'
      };

      Project.create.mockResolvedValue(mockProject);

      // Act
      await projectController.createProject(req, res);

      // Assert
      expect(Project.create).toHaveBeenCalledWith({
        name: 'New Project',
        description: 'Project Description',
        color: '#FF5733',
        ownerId: 'user-123'
      });
      expect(logActivity).toHaveBeenCalledWith({
        userId: 'user-123',
        projectId: 'project-123',
        action: 'created_project',
        details: 'Created project New Project'
      });
      expect(ProjectMember.create).toHaveBeenCalledWith({
        projectId: 'project-123',
        userId: 'user-123',
        role: 'owner'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProject
      });
    });

    it('should return error if project name is missing', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        body: {
          description: 'Project Description'
          // Missing name
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      // Act
      await projectController.createProject(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Project name is required'
      });
      expect(Project.create).not.toHaveBeenCalled();
    });

    it('should handle database errors during creation', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        body: {
          name: 'New Project',
          description: 'Project Description'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Project.create.mockRejectedValue(new Error('Database error'));

      // Act
      await projectController.createProject(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('updateProject', () => {
    it('should update a project successfully as owner', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        params: { id: 'project-123' },
        body: {
          name: 'Updated Project',
          description: 'Updated Description'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockProject = {
        id: 'project-123',
        name: 'Old Project',
        description: 'Old Description',
        ownerId: 'user-123',
        update: jest.fn().mockResolvedValue({
          id: 'project-123',
          name: 'Updated Project',
          description: 'Updated Description'
        })
      };

      Project.findByPk.mockResolvedValueOnce(mockProject).mockResolvedValueOnce({
        id: 'project-123',
        name: 'Updated Project',
        description: 'Updated Description'
      });

      // Act
      await projectController.updateProject(req, res);

      // Assert
      expect(Project.findByPk).toHaveBeenCalledWith('project-123');
      expect(mockProject.update).toHaveBeenCalledWith({
        name: 'Updated Project',
        description: 'Updated Description'
      });
      expect(logActivity).toHaveBeenCalledWith({
        userId: 'user-123',
        projectId: 'project-123',
        action: 'updated_project',
        details: 'Updated project Updated Project'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 'project-123',
          name: 'Updated Project',
          description: 'Updated Description'
        })
      });
    });

    it('should return 404 if project not found for update', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        params: { id: 'nonexistent-project' },
        body: { name: 'Updated Project' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Project.findByPk.mockResolvedValue(null);

      // Act
      await projectController.updateProject(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Project not found'
      });
    });

    it('should return 403 if user is not project owner', async () => {
      // Arrange
      const req = {
        user: { id: 'user-456' },
        params: { id: 'project-123' },
        body: { name: 'Updated Project' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockProject = {
        id: 'project-123',
        name: 'Test Project',
        ownerId: 'user-123', // Different user is owner
        update: jest.fn()
      };

      Project.findByPk.mockResolvedValue(mockProject);

      // Act
      await projectController.updateProject(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to update this project'
      });
      expect(mockProject.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteProject', () => {
    it('should delete a project successfully as owner', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        params: { id: 'project-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockProject = {
        id: 'project-123',
        name: 'Test Project',
        ownerId: 'user-123',
        destroy: jest.fn().mockResolvedValue(true)
      };

      Project.findByPk.mockResolvedValue(mockProject);
      ProjectMember.findOne.mockResolvedValue(null); // Not an admin, but owner

      // Act
      await projectController.deleteProject(req, res);

      // Assert
      expect(Project.findByPk).toHaveBeenCalledWith('project-123');
      expect(ProjectMember.findOne).toHaveBeenCalledWith({ 
        where: { projectId: 'project-123', userId: 'user-123' } 
      });
      expect(mockProject.destroy).toHaveBeenCalled();
      expect(emitToProject).toHaveBeenCalledWith('project-123', 'project_deleted', {
        projectId: 'project-123',
        userId: 'user-123'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Project removed'
      });
    });

    it('should return 404 if project not found for deletion', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123' },
        params: { id: 'nonexistent-project' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      Project.findByPk.mockResolvedValue(null);

      // Act
      await projectController.deleteProject(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Project not found'
      });
    });

    it('should return 403 if user is not project owner', async () => {
      // Arrange
      const req = {
        user: { id: 'user-456' },
        params: { id: 'project-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      const mockProject = {
        id: 'project-123',
        name: 'Test Project',
        ownerId: 'user-123', // Different user is owner
        destroy: jest.fn()
      };

      Project.findByPk.mockResolvedValue(mockProject);

      // Act
      await projectController.deleteProject(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to delete this project'
      });
      expect(mockProject.destroy).not.toHaveBeenCalled();
    });
  });

  // Note: getProjectAnalytics tests omitted for complexity
// Can be added later if needed
});
