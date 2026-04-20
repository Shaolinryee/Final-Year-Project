const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to verify admin authentication
const requireAdminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    console.error('Admin auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

// Middleware to check specific admin role level
const requireAdminLevel = (minLevel) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.adminRole) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin role not found.'
        });
      }

      if (req.user.adminRole.level < minLevel) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient admin privileges.'
        });
      }

      next();
    } catch (error) {
      console.error('Admin level check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authorization.'
      });
    }
  };
};

// Middleware to check if user is super admin
const requireSuperAdmin = requireAdminLevel(3);

// Middleware to check if user is admin or higher
const requireAdmin = requireAdminLevel(2);

// Middleware to check if user has any admin privileges
const requireAnyAdmin = requireAdminLevel(1);

module.exports = {
  requireAdminAuth,
  requireAdminLevel,
  requireSuperAdmin,
  requireAdmin,
  requireAnyAdmin
};
