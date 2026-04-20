// Tests for authentication utility functions
// These are pure functions and perfect for unit testing

const { hashPassword, comparePassword, generateToken } = require('../../src/utils/auth');

describe('Auth Utils', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      // Arrange
      const password = 'testPassword123';

      // Act
      const result = await hashPassword(password);

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBe(password); // Should be different from original
      expect(result.length).toBeGreaterThan(50); // bcrypt hashes are typically 60 chars
    });

    it('should generate different hashes for the same password', async () => {
      // Arrange
      const password = 'testPassword123';

      // Act
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      // Assert
      expect(hash1).not.toBe(hash2); // Different salts should produce different hashes
    });

    it('should handle empty password', async () => {
      // Arrange
      const password = '';

      // Act
      const result = await hashPassword(password);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(50);
    });
  });

  describe('comparePassword', () => {
    it('should compare passwords successfully when they match', async () => {
      // Arrange
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);

      // Act
      const result = await comparePassword(password, hashedPassword);

      // Assert
      expect(result).toBe(true);
    });

    it('should compare passwords successfully when they don\'t match', async () => {
      // Arrange
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hashedPassword = await hashPassword(password);

      // Act
      const result = await comparePassword(wrongPassword, hashedPassword);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for empty password comparison', async () => {
      // Arrange
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);

      // Act
      const result = await comparePassword('', hashedPassword);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('generateToken', () => {
    const mockUserId = 'user-123';
    const mockUserEmail = 'test@example.com';
    const mockUserName = 'Test User';

    it('should generate a JWT token with default expiration', () => {
      // Act
      const result = generateToken(mockUserId, mockUserEmail, mockUserName);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(50); // JWT tokens are typically longer
    });

    it('should generate a JWT token with custom expiration', () => {
      // Arrange
      const customExpiration = '24h';

      // Act
      const result = generateToken(mockUserId, mockUserEmail, mockUserName, customExpiration);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(50);
    });

    it('should generate different tokens for different users', () => {
      // Act
      const token1 = generateToken(mockUserId, mockUserEmail, mockUserName);
      const token2 = generateToken('user-456', 'other@example.com', 'Other User');

      // Assert
      expect(token1).not.toBe(token2);
    });

    it('should include correct user data in token payload', () => {
      // Arrange
      const jwt = require('jsonwebtoken');

      // Act
      const token = generateToken(mockUserId, mockUserEmail, mockUserName);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Assert
      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.email).toBe(mockUserEmail);
      expect(decoded.name).toBe(mockUserName);
    });

    it('should use environment JWT_SECRET', () => {
      // Arrange
      const jwt = require('jsonwebtoken');

      // Act
      const token = generateToken(mockUserId, mockUserEmail, mockUserName);
      
      // Assert - Should be verifiable with the test secret
      expect(() => {
        jwt.verify(token, process.env.JWT_SECRET);
      }).not.toThrow();
    });

    it('should handle null/undefined user data gracefully', () => {
      // Act & Assert - Should not throw
      expect(() => {
        generateToken(null, undefined, '');
      }).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should work end-to-end: hash and compare password', async () => {
      // Arrange
      const password = 'testPassword123';

      // Act
      const hashed = await hashPassword(password);
      const isMatch = await comparePassword(password, hashed);

      // Assert
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(isMatch).toBe(true);
    });

    it('should work end-to-end: generate token and verify structure', () => {
      // Arrange
      const userData = {
        userId: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      };
      const jwt = require('jsonwebtoken');

      // Act
      const token = generateToken(userData.userId, userData.email, userData.name);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Assert
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(decoded.userId).toBe(userData.userId);
      expect(decoded.email).toBe(userData.email);
      expect(decoded.name).toBe(userData.name);
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle empty password in hashPassword', async () => {
      // Arrange
      const password = '';

      // Act
      const result = await hashPassword(password);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(50);
    });

    it('should handle empty strings in comparePassword', async () => {
      // Arrange
      const hashedPassword = await hashPassword('test');

      // Act
      const result = await comparePassword('', hashedPassword);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle very long passwords', async () => {
      // Arrange
      const longPassword = 'a'.repeat(1000);

      // Act
      const result = await hashPassword(longPassword);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(50);
    });
  });
});
