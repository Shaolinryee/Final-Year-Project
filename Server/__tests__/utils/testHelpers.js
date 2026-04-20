// Test helper utilities
// Common functions used across multiple test files

const sampleData = require('../fixtures/sampleData');

// Helper to create mock request with authentication
const createAuthenticatedRequest = (user = sampleData.users.regular, overrides = {}) => {
  return {
    ...global.testUtils.createMockRequest(),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    headers: {
      authorization: `Bearer ${global.testUtils.generateTestToken(user.id, user.email, user.name)}`,
      ...overrides.headers
    },
    ...overrides
  };
};

// Helper to create mock response with tracking
const createTrackedResponse = () => {
  const calls = {
    status: [],
    json: [],
    send: [],
    cookie: [],
    clearCookie: []
  };

  const res = {
    status: jest.fn().mockImplementation((code) => {
      calls.status.push(code);
      return res;
    }),
    json: jest.fn().mockImplementation((data) => {
      calls.json.push(data);
      return res;
    }),
    send: jest.fn().mockImplementation((data) => {
      calls.send.push(data);
      return res;
    }),
    cookie: jest.fn().mockImplementation((name, value, options) => {
      calls.cookie.push({ name, value, options });
      return res;
    }),
    clearCookie: jest.fn().mockImplementation((name, options) => {
      calls.clearCookie.push({ name, options });
      return res;
    }),
    _calls: calls // Expose calls for assertions
  };

  return res;
};

// Helper to setup model mocks with specific data
const setupModelMocks = (models, data) => {
  Object.keys(data).forEach(modelName => {
    const model = models[modelName];
    const modelData = data[modelName];
    
    if (model && modelData) {
      // Setup findOne mock
      if (modelData.findOne) {
        model.findOne.mockResolvedValue(modelData.findOne);
      }
      
      // Setup findAll mock
      if (modelData.findAll) {
        model.findAll.mockResolvedValue(modelData.findAll);
      }
      
      // Setup findByPk mock
      if (modelData.findByPk) {
        model.findByPk.mockResolvedValue(modelData.findByPk);
      }
      
      // Setup create mock
      if (modelData.create) {
        model.create.mockResolvedValue(modelData.create);
      }
      
      // Setup update mock
      if (modelData.update) {
        model.update.mockResolvedValue(modelData.update);
      }
      
      // Setup destroy mock
      if (modelData.destroy) {
        model.destroy.mockResolvedValue(modelData.destroy);
      }
    }
  });
};

// Helper to reset all model mocks
const resetModelMocks = (models) => {
  Object.values(models).forEach(model => {
    if (model && typeof model === 'object' && model.findOne) {
      Object.getOwnPropertyNames(model).forEach(method => {
        if (typeof model[method] === 'function' && model[method].mockClear) {
          model[method].mockClear();
        }
      });
    }
  });
};

// Helper to assert response structure
const expectSuccessResponse = (res, expectedData = null) => {
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      success: true,
      ...(expectedData && { data: expectedData })
    })
  );
};

// Helper to assert error response
const expectErrorResponse = (res, statusCode, expectedMessage = null) => {
  expect(res.status).toHaveBeenCalledWith(statusCode);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      success: false,
      ...(expectedMessage && { message: expectedMessage })
    })
  );
};

// Helper to assert created response
const expectCreatedResponse = (res, expectedData = null) => {
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      success: true,
      ...(expectedData && { data: expectedData })
    })
  );
};

// Helper to test async controller function
const testAsyncController = async (controller, req, res, next) => {
  try {
    await controller(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Helper to create mock transaction
const createMockTransaction = () => ({
  commit: jest.fn().mockResolvedValue(true),
  rollback: jest.fn().mockResolvedValue(true)
});

// Helper to setup database transaction mocks
const setupTransactionMocks = (sequelize) => {
  const mockTransaction = createMockTransaction();
  sequelize.transaction.mockImplementation((callback) => {
    return callback(mockTransaction);
  });
  return mockTransaction;
};

// Helper to validate JWT token
const validateTestToken = (token) => {
  const jwt = require('jsonwebtoken');
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Helper to create mock file upload
const createMockFile = (filename = 'test.pdf', mimetype = 'application/pdf') => ({
  fieldname: 'file',
  originalname: filename,
  encoding: '7bit',
  mimetype,
  size: 1024,
  buffer: Buffer.from('test file content'),
  destination: '/uploads',
  filename: `test-${Date.now()}-${filename}`,
  path: `/uploads/test-${Date.now()}-${filename}`
});

// Helper to create mock files array
const createMockFiles = (count = 1) => {
  return Array.from({ length: count }, (_, index) => 
    createMockFile(`test-${index + 1}.pdf`)
  );
};

// Helper to test date comparisons
const expectDateCloseTo = (actual, expected, toleranceMs = 1000) => {
  const actualTime = new Date(actual).getTime();
  const expectedTime = new Date(expected).getTime();
  expect(Math.abs(actualTime - expectedTime)).toBeLessThanOrEqual(toleranceMs);
};

// Helper to test pagination
const expectPaginationStructure = (response) => {
  expect(response).toHaveProperty('data');
  expect(response).toHaveProperty('pagination');
  expect(response.pagination).toHaveProperty('page');
  expect(response.pagination).toHaveProperty('limit');
  expect(response.pagination).toHaveProperty('total');
  expect(response.pagination).toHaveProperty('pages');
};

// Helper to create mock pagination data
const createMockPaginationData = (data, page = 1, limit = 10, total = null) => {
  const totalItems = total !== null ? total : data.length;
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total: totalItems,
      pages: totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

module.exports = {
  createAuthenticatedRequest,
  createTrackedResponse,
  setupModelMocks,
  resetModelMocks,
  expectSuccessResponse,
  expectErrorResponse,
  expectCreatedResponse,
  testAsyncController,
  createMockTransaction,
  setupTransactionMocks,
  validateTestToken,
  createMockFile,
  createMockFiles,
  expectDateCloseTo,
  expectPaginationStructure,
  createMockPaginationData
};
