// Final working tests for Authentication Controller
// Properly mocks all dependencies

// Mock models BEFORE importing authController
jest.mock('../../src/models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  SystemLog: {
    create: jest.fn()
  }
}));

// Mock utilities
jest.mock('../../src/utils/auth', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashedPassword123'),
  comparePassword: jest.fn().mockResolvedValue(true),
  generateToken: jest.fn().mockReturnValue('mock-jwt-token')
}));

jest.mock('../../src/utils/email', () => ({
  sendOTPEmail: jest.fn().mockResolvedValue(true)
}));

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn(),
  }))
}));

global.fetch = jest.fn();

// Now import the controller
const authController = require('../../src/controllers/authController');

// Import mocked modules for test assertions
const { User, SystemLog } = require('../../src/models');
const { hashPassword, comparePassword, generateToken } = require('../../src/utils/auth');
const { sendOTPEmail } = require('../../src/utils/email');

describe('Auth Controller - Final Working Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const req = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      User.findOne.mockResolvedValue(null); // No existing user
      User.create.mockResolvedValue({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        avatar: null
      });

      // Act
      await authController.register(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(hashPassword).toHaveBeenCalledWith('password123');
      expect(User.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123',
        isVerified: true
      });
      expect(generateToken).toHaveBeenCalledWith('user-123', 'test@example.com', 'Test User');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          avatar: null
        }
      });
    });

    it('should return error if required fields are missing', async () => {
      // Arrange
      const req = {
        body: {
          name: 'Test User',
          email: 'test@example.com'
          // Missing password
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      // Act
      await authController.register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please provide name, email and password'
      });
      expect(User.findOne).not.toHaveBeenCalled();
      expect(hashPassword).not.toHaveBeenCalled();
    });

    it('should return error if user already exists', async () => {
      // Arrange
      const req = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      User.findOne.mockResolvedValue({ id: 'existing-user' }); // Existing user

      // Act
      await authController.register(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User already exists'
      });
      expect(hashPassword).not.toHaveBeenCalled();
      expect(User.create).not.toHaveBeenCalled();
    });

    it('should handle server errors during registration', async () => {
      // Arrange
      const req = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      User.findOne.mockRejectedValue(new Error('Database error'));

      // Act
      await authController.register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      // Arrange
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123'
        },
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-browser')
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        avatar: 'avatar.jpg',
        loginCount: 5,
        update: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      SystemLog.create.mockResolvedValue({ id: 'log-123' });

      // Act
      await authController.login(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(comparePassword).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(mockUser.update).toHaveBeenCalledWith({
        lastLoginAt: expect.any(Date),
        loginCount: 6
      });
      expect(SystemLog.create).toHaveBeenCalledWith({
        userId: 'user-123',
        action: 'login',
        resource: 'authentication',
        details: { 
          loginMethod: 'password',
          timestamp: expect.any(String)
        },
        ipAddress: '127.0.0.1',
        userAgent: 'test-browser',
        severity: 'info',
        category: 'authentication'
      });
      expect(generateToken).toHaveBeenCalledWith('user-123', 'test@example.com', 'Test User');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          avatar: 'avatar.jpg'
        }
      });
    });

    it('should return error if credentials are missing', async () => {
      // Arrange
      const req = {
        body: {
          email: 'test@example.com'
          // Missing password
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      // Act
      await authController.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please provide email and password'
      });
      expect(User.findOne).not.toHaveBeenCalled();
    });

    it('should return error if user not found', async () => {
      // Arrange
      const req = {
        body: {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      User.findOne.mockResolvedValue(null);

      // Act
      await authController.login(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
      expect(comparePassword).not.toHaveBeenCalled();
    });

    it('should return error if password doesn\'t match', async () => {
      // Arrange
      const req = {
        body: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      User.findOne.mockResolvedValue({
        id: 'user-123',
        password: 'hashedPassword'
      });
      comparePassword.mockResolvedValue(false);

      // Act
      await authController.login(req, res);

      // Assert
      expect(comparePassword).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });
  });

  describe('signUpWithOTP', () => {
    it('should send OTP for existing user', async () => {
      // Arrange
      const req = {
        body: {
          email: 'test@example.com',
          name: 'Test User'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        verificationToken: null,
        resetPasswordExpires: null,
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(mockUser);

      // Act
      await authController.signUpWithOTP(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(mockUser.verificationToken).toMatch(/^\d{6}$/); // 6-digit OTP
      expect(mockUser.resetPasswordExpires).toBeInstanceOf(Date);
      expect(mockUser.save).toHaveBeenCalled();
      expect(sendOTPEmail).toHaveBeenCalledWith('test@example.com', { 
        otp: expect.stringMatching(/^\d{6}$/) 
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Verification code sent to your email'
      });
    });

    it('should create new user and send OTP for non-existing user', async () => {
      // Arrange
      const req = {
        body: {
          email: 'newuser@example.com'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      User.findOne.mockResolvedValue(null); // User doesn't exist
      User.create.mockResolvedValue({
        id: 'new-user-123',
        email: 'newuser@example.com',
        name: 'newuser'
      });

      // Act
      await authController.signUpWithOTP(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'newuser@example.com' } });
      expect(User.create).toHaveBeenCalledWith({
        name: 'newuser',
        email: 'newuser@example.com',
        password: expect.stringMatching(/^[a-f0-9]{32}$/), // 32-char hex string
        verificationToken: expect.stringMatching(/^\d{6}$/),
        resetPasswordExpires: expect.any(Date),
        isVerified: false
      });
      expect(sendOTPEmail).toHaveBeenCalledWith('newuser@example.com', { 
        otp: expect.stringMatching(/^\d{6}$/) 
      });
    });

    it('should return error if email is missing', async () => {
      // Arrange
      const req = {
        body: {
          name: 'Test User'
          // Missing email
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      // Act
      await authController.signUpWithOTP(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email is required'
      });
    });
  });

  describe('resetPassword', () => {
    it('should send reset password OTP', async () => {
      // Arrange
      const req = {
        body: {
          email: 'test@example.com'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        resetPasswordToken: null,
        resetPasswordExpires: null,
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(mockUser);

      // Act
      await authController.resetPassword(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(mockUser.resetPasswordToken).toMatch(/^\d{6}$/); // 6-digit OTP
      expect(mockUser.resetPasswordExpires).toBeInstanceOf(Date);
      expect(mockUser.save).toHaveBeenCalled();
      expect(sendOTPEmail).toHaveBeenCalledWith('test@example.com', { 
        otp: expect.stringMatching(/^\d{6}$/),
        type: 'password_reset'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password reset code sent to your email'
      });
    });

    it('should return error if user not found', async () => {
      // Arrange
      const req = {
        body: {
          email: 'nonexistent@example.com'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      User.findOne.mockResolvedValue(null);

      // Act
      await authController.resetPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No user found with this email'
      });
    });
  });
});
