const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Hash Password
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Error hashing password');
  }
};

// Compare Password
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Error comparing password');
  }
};

// Generate JWT Token
const generateToken = (userId, userEmail, userName, expiresIn = null) => {
  return jwt.sign(
    { userId, email: userEmail, name: userName },
    process.env.JWT_SECRET,
    { expiresIn: expiresIn || process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
};
