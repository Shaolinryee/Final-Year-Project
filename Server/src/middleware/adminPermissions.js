const { User, AdminRole, AdminPermission, SystemLog } = require('../models');

// Get user's admin permissions
const getUserPermissions = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      include: [{
        model: AdminRole,
        as: 'adminRole',
        include: [{
          model: AdminPermission,
          as: 'permissions'
        }]
      }]
    });

    if (!user || !user.adminRole) {
      return [];
    }

    return user.adminRole.permissions || [];
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
};

// Check if user has specific permission
const hasPermission = async (userId, resource, action) => {
  try {
    const user = await User.findByPk(userId, {
      include: [{
        model: AdminRole,
        as: 'adminRole',
        include: [{
          model: AdminPermission,
          as: 'permissions'
        }]
      }]
    });

    if (!user || !user.adminRole) {
      return false;
    }

    // Super admins have all permissions
    if (user.adminRole.name === 'super_admin') {
      return true;
    }

    // Check for specific permission
    const hasSpecificPermission = user.adminRole.permissions.some(permission => 
      permission.resource === resource && 
      permission.action === action &&
      permission.isActive
    );

    return hasSpecificPermission;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

// Middleware to require specific permission
const requirePermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const hasRequiredPermission = await hasPermission(userId, resource, action);

      if (!hasRequiredPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Permission required: ${action} ${resource}`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during permission check.'
      });
    }
  };
};

// Middleware to require any of the specified permissions
const requireAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      let hasAnyPermission = false;

      for (const { resource, action } of permissions) {
        const hasPermissionResult = await hasPermission(userId, resource, action);
        if (hasPermissionResult) {
          hasAnyPermission = true;
          break;
        }
      }

      if (!hasAnyPermission) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. None of the required permissions found.'
        });
      }

      next();
    } catch (error) {
      console.error('Multiple permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during permission check.'
      });
    }
  };
};

// Log admin action for audit trail
const logAdminAction = async (userId, action, resource, resourceId = null, details = {}, ipAddress = null, userAgent = null) => {
  try {
    await SystemLog.create({
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
      severity: 'info',
      category: 'admin_action'
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
};

// Middleware to log admin actions
const auditLog = (action, resource) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Only log successful actions
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAdminAction(
          req.user.id,
          action,
          resource,
          req.params.id || null,
          {
            method: req.method,
            url: req.originalUrl,
            body: req.body,
            query: req.query
          },
          req.ip,
          req.get('User-Agent')
        );
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Permission constants for easy reference
const PERMISSIONS = {
  USER: {
    READ: 'users:read',
    CREATE: 'users:create',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
    SUSPEND: 'users:suspend',
    ASSIGN_ROLE: 'users:assign_role'
  },
  PROJECT: {
    READ: 'projects:read',
    UPDATE: 'projects:update',
    DELETE: 'projects:delete',
    ARCHIVE: 'projects:archive'
  },
  SYSTEM: {
    READ_LOGS: 'system:read_logs',
    MANAGE_SETTINGS: 'system:manage_settings',
    VIEW_ANALYTICS: 'system:view_analytics',
    MANAGE_STORAGE: 'system:manage_storage'
  },
  ADMIN: {
    MANAGE_ROLES: 'admin:manage_roles',
    MANAGE_PERMISSIONS: 'admin:manage_permissions',
    VIEW_AUDIT_LOGS: 'admin:view_audit_logs'
  }
};

module.exports = {
  getUserPermissions,
  hasPermission,
  requirePermission,
  requireAnyPermission,
  logAdminAction,
  auditLog,
  PERMISSIONS
};
