/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces strict permission checks based on user roles in projects
 */

const { ProjectMember } = require('../models');

/**
 * Get user's role in a project
 */
const getUserProjectRole = async (userId, projectId) => {
  const membership = await ProjectMember.findOne({
    where: { userId, projectId }
  });
  return membership?.role || null;
};

/**
 * Middleware to check if user has required role in project
 */
const requireProjectRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const { projectId } = req.params;
      
      if (!projectId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Project ID is required' 
        });
      }

      const userRole = await getUserProjectRole(req.user.id, projectId);
      
      if (!userRole) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not a member of this project' 
        });
      }

      // Role hierarchy: owner > admin > member
      const roleHierarchy = {
        member: 1,
        admin: 2,
        owner: 3
      };

      const userRoleLevel = roleHierarchy[userRole.toLowerCase()] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole.toLowerCase()] || 0;

      if (userRoleLevel < requiredRoleLevel) {
        return res.status(403).json({ 
          success: false, 
          message: `Insufficient permissions. Required role: ${requiredRole}, Your role: ${userRole}` 
        });
      }

      // Add user role to request for use in controllers
      req.userProjectRole = userRole;
      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Permission check failed' 
      });
    }
  };
};

/**
 * Middleware to check if user is project owner
 */
const requireProjectOwner = requireProjectRole('owner');

/**
 * Middleware to check if user is project admin or owner
 */
const requireProjectAdmin = (minimumRole = 'admin') => {
  return async (req, res, next) => {
    try {
      const { projectId } = req.params;
      
      if (!projectId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Project ID is required' 
        });
      }

      const userRole = await getUserProjectRole(req.user.id, projectId);
      
      if (!userRole) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not a member of this project' 
        });
      }

      // Allow both admin and owner
      if (userRole.toLowerCase() !== 'owner' && userRole.toLowerCase() !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: `Insufficient permissions. Required role: admin or owner, Your role: ${userRole}` 
        });
      }

      req.userProjectRole = userRole;
      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Permission check failed' 
      });
    }
  };
};

/**
 * Middleware to check if user is at least a member (any role)
 */
const requireProjectMember = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Project ID is required' 
        });
    }

    const userRole = await getUserProjectRole(req.user.id, projectId);
    
    if (!userRole) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not a member of this project' 
        });
    }

    req.userProjectRole = userRole;
    next();
  } catch (error) {
    console.error('RBAC middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Permission check failed' 
    });
  }
};

module.exports = {
  getUserProjectRole,
  requireProjectRole,
  requireProjectOwner,
  requireProjectAdmin,
  requireProjectMember,
};
