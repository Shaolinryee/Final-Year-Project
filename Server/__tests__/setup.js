// Global test setup file
// This runs before each test file

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_EXPIRE = '7d';
process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_DIALECT = 'postgres';

// Mock console methods to reduce noise during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Only show console output in verbose mode or when explicitly needed
if (!process.env.VERBOSE_TESTS) {
  console.log = jest.fn();
  console.error = jest.fn();
}

// Restore console methods after all tests
afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Global test timeout
jest.setTimeout(10000);

// Mock external modules that might cause issues in tests
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  }))
}));

// Mock socket.io
jest.mock('../src/socket', () => ({
  initSocket: jest.fn(),
  emitToProject: jest.fn(),
  emitToUser: jest.fn()
}));

// Mock file upload
jest.mock('multer', () => ({
  single: jest.fn(() => (req, res, next) => next()),
  array: jest.fn(() => (req, res, next) => next())
}));

// Mock UUID
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234-5678-9abc-def012345678'),
  v1: jest.fn(() => 'test-uuid-v1-1234-5678-9abc-def012345678')
}));

// Mock QR Code
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,testqrcode')
}));

// Mock Speakeasy for 2FA
jest.mock('speakeasy', () => ({
  generateSecret: jest.fn(() => ({
    base32: 'JBSWY3DPEHPK3PXP',
    ascii: 'JBSWY3DPEHPK3PXP',
    hex: '26066c2e4644626c2e4644626c',
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?data=otpauth://totp/SecretKey'
  })),
  totp: {
    verify: jest.fn().mockReturnValue({ valid: true })
  }
}));

// Global test utilities
global.testUtils = {
  // Create mock request object
  createMockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    user: null,
    headers: {},
    ...overrides
  }),

  // Create mock response object
  createMockResponse: () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis()
    };
    return res;
  },

  // Create mock next function
  createMockNext: () => jest.fn(),

  // Generate test JWT token
  generateTestToken: (userId = 'test-user-id', email = 'test@example.com', name = 'Test User') => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId, email, name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  },

  // Sample user data for tests
  sampleUser: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword',
    role: 'user',
    avatar: 'test-avatar.jpg',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Sample project data for tests
  sampleProject: {
    id: 'test-project-id',
    name: 'Test Project',
    description: 'A test project',
    ownerId: 'test-user-id',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Sample task data for tests
  sampleTask: {
    id: 'test-task-id',
    title: 'Test Task',
    description: 'A test task description',
    status: 'todo',
    priority: 'medium',
    projectId: 'test-project-id',
    assigneeId: 'test-user-id',
    creatorId: 'test-user-id',
    createdAt: new Date(),
    updatedAt: new Date()
  }
};
