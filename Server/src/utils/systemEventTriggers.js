const { sendAdminNotification } = require('./adminNotification');
const { User, SystemLog } = require('../models');

class SystemEventTriggers {
  /**
   * Trigger notification for user registration
   */
  static async onUserRegistration(userData) {
    try {
      await sendAdminNotification({
        type: 'user_registration',
        category: 'user_management',
        priority: 'LOW',
        title: 'New User Registration',
        message: `New user ${userData.name} (${userData.email}) has registered.`,
        details: {
          userName: userData.name,
          userEmail: userData.email,
          userId: userData.id,
          ipAddress: userData.ipAddress,
          timestamp: new Date(),
          userAgent: userData.userAgent
        },
        actionLink: `/admin/users/${userData.id}`,
        source: 'user_registration'
      });
    } catch (error) {
      console.error('Error triggering user registration notification:', error);
    }
  }

  /**
   * Trigger notification for user suspension/unsuspension
   */
  static async onUserSuspension(userData, adminData, reason, isSuspension) {
    try {
      const action = isSuspension ? 'suspended' : 'unsuspended';
      
      await sendAdminNotification({
        type: 'user_suspension',
        category: 'user_management',
        priority: 'MEDIUM',
        title: `User ${action.charAt(0).toUpperCase() + action.slice(1)}`,
        message: `User ${userData.name} has been ${action} by ${adminData.name}.`,
        details: {
          userName: userData.name,
          userEmail: userData.email,
          userId: userData.id,
          adminName: adminData.name,
          adminId: adminData.id,
          action,
          reason,
          timestamp: new Date(),
          isSuspension
        },
        actionLink: `/admin/users/${userData.id}`,
        source: 'user_management'
      });
    } catch (error) {
      console.error('Error triggering user suspension notification:', error);
    }
  }

  /**
   * Trigger notification for failed login attempts
   */
  static async onFailedLogin(email, ipAddress, userAgent, attemptCount) {
    try {
      // Only trigger after multiple failed attempts
      if (attemptCount >= 5) {
        await sendAdminNotification({
          type: 'failed_login_attempt',
          category: 'security_events',
          priority: attemptCount >= 10 ? 'HIGH' : 'MEDIUM',
          title: 'Multiple Failed Login Attempts',
          message: `${attemptCount} failed login attempts detected for ${email} from ${ipAddress}.`,
          details: {
            userEmail: email,
            ipAddress,
            userAgent,
            attemptCount,
            timestamp: new Date()
          },
          actionLink: `/admin/logs?searchTerm=${email}&category=security_events`,
          source: 'security_monitoring'
        });
      }
    } catch (error) {
      console.error('Error triggering failed login notification:', error);
    }
  }

  /**
   * Trigger notification for permission changes
   */
  static async onPermissionChange(userData, adminData, changes) {
    try {
      await sendAdminNotification({
        type: 'permission_change',
        category: 'security_events',
        priority: 'MEDIUM',
        title: 'User Permissions Changed',
        message: `Permissions changed for ${userData.name} by ${adminData.name}.`,
        details: {
          userName: userData.name,
          userEmail: userData.email,
          userId: userData.id,
          adminName: adminData.name,
          adminId: adminData.id,
          changes,
          timestamp: new Date()
        },
        actionLink: `/admin/users/${userData.id}`,
        source: 'permission_management'
      });
    } catch (error) {
      console.error('Error triggering permission change notification:', error);
    }
  }

  /**
   * Trigger notification for system setting changes
   */
  static async onSystemSettingChange(settingName, oldValue, newValue, adminData) {
    try {
      await sendAdminNotification({
        type: 'system_setting_change',
        category: 'admin_actions',
        priority: 'HIGH',
        title: 'System Setting Changed',
        message: `System setting "${settingName}" changed by ${adminData.name}.`,
        details: {
          settingName,
          oldValue,
          newValue,
          adminName: adminData.name,
          adminId: adminData.id,
          timestamp: new Date()
        },
        actionLink: '/admin/settings',
        source: 'system_settings'
      });
    } catch (error) {
      console.error('Error triggering system setting change notification:', error);
    }
  }

  /**
   * Trigger notification for user deletion
   */
  static async onUserDeletion(userData, adminData, reason) {
    try {
      await sendAdminNotification({
        type: 'user_deletion',
        category: 'admin_actions',
        priority: 'HIGH',
        title: 'User Account Deleted',
        message: `User account for ${userData.name} has been deleted by ${adminData.name}.`,
        details: {
          userName: userData.name,
          userEmail: userData.email,
          adminName: adminData.name,
          adminId: adminData.id,
          reason,
          timestamp: new Date()
        },
        actionLink: '/admin/users',
        source: 'user_management'
      });
    } catch (error) {
      console.error('Error triggering user deletion notification:', error);
    }
  }

  /**
   * Trigger notification for backup failure
   */
  static async onBackupFailure(backupType, errorMessage, scheduledTime) {
    try {
      await sendAdminNotification({
        type: 'backup_failure',
        category: 'system_health',
        priority: 'CRITICAL',
        title: 'System Backup Failed',
        message: `System backup failed: ${errorMessage}`,
        details: {
          backupType,
          errorMessage,
          scheduledTime,
          timestamp: new Date()
        },
        actionLink: '/admin/settings?tab=backup',
        source: 'backup_system'
      });
    } catch (error) {
      console.error('Error triggering backup failure notification:', error);
    }
  }

  /**
   * Trigger notification for performance degradation
   */
  static async onPerformanceDegradation(metric, value, threshold, serverName) {
    try {
      await sendAdminNotification({
        type: 'performance_degradation',
        category: 'system_health',
        priority: value > threshold * 1.5 ? 'HIGH' : 'MEDIUM',
        title: 'System Performance Degradation',
        message: `System performance degraded: ${metric} is ${value} (threshold: ${threshold})`,
        details: {
          metric,
          value,
          threshold,
          serverName,
          timestamp: new Date()
        },
        actionLink: '/admin/dashboard',
        source: 'performance_monitor'
      });
    } catch (error) {
      console.error('Error triggering performance degradation notification:', error);
    }
  }

  /**
   * Trigger notification for admin impersonation
   */
  static async onAdminImpersonation(adminData, targetUserData) {
    try {
      await sendAdminNotification({
        type: 'admin_impersonation',
        category: 'security_events',
        priority: 'HIGH',
        title: 'Admin User Impersonation',
        message: `Admin ${adminData.name} is impersonating user ${targetUserData.name}.`,
        details: {
          adminName: adminData.name,
          adminId: adminData.id,
          targetUserName: targetUserData.name,
          targetUserId: targetUserData.id,
          timestamp: new Date()
        },
        actionLink: `/admin/logs?searchTerm=impersonation`,
        source: 'impersonation_system'
      });
    } catch (error) {
      console.error('Error triggering admin impersonation notification:', error);
    }
  }

  /**
   * Trigger notification for data export
   */
  static async onDataExport(adminData, exportType, recordCount, fileSize) {
    try {
      await sendAdminNotification({
        type: 'data_export',
        category: 'security_events',
        priority: 'MEDIUM',
        title: 'Large Data Export',
        message: `Admin ${adminData.name} exported ${recordCount} records (${fileSize}).`,
        details: {
          adminName: adminData.name,
          adminId: adminData.id,
          exportType,
          recordCount,
          fileSize,
          timestamp: new Date()
        },
        actionLink: `/admin/logs?searchTerm=export`,
        source: 'data_export'
      });
    } catch (error) {
      console.error('Error triggering data export notification:', error);
    }
  }

  /**
   * Trigger notification for maintenance mode
   */
  static async onMaintenanceMode(enabled, adminData, reason) {
    try {
      await sendAdminNotification({
        type: 'maintenance_mode',
        category: 'admin_actions',
        priority: 'HIGH',
        title: `Maintenance Mode ${enabled ? 'Enabled' : 'Disabled'}`,
        message: `Maintenance mode has been ${enabled ? 'enabled' : 'disabled'} by ${adminData.name}.`,
        details: {
          enabled,
          adminName: adminData.name,
          adminId: adminData.id,
          reason,
          timestamp: new Date()
        },
        actionLink: '/admin/settings',
        source: 'maintenance_system'
      });
    } catch (error) {
      console.error('Error triggering maintenance mode notification:', error);
    }
  }

  /**
   * Trigger notification for admin role assignment
   */
  static async onAdminRoleAssignment(userData, adminData, role, isAssignment) {
    try {
      const action = isAssignment ? 'assigned' : 'removed';
      
      await sendAdminNotification({
        type: 'admin_role_assignment',
        category: 'admin_actions',
        priority: 'HIGH',
        title: `Admin Role ${action.charAt(0).toUpperCase() + action.slice(1)}`,
        message: `Admin role ${action} to ${userData.name} by ${adminData.name}.`,
        details: {
          userName: userData.name,
          userEmail: userData.email,
          userId: userData.id,
          adminName: adminData.name,
          adminId: adminData.id,
          role,
          action,
          timestamp: new Date()
        },
        actionLink: `/admin/users/${userData.id}`,
        source: 'role_management'
      });
    } catch (error) {
      console.error('Error triggering admin role assignment notification:', error);
    }
  }

  /**
   * Monitor system logs for suspicious patterns
   */
  static async monitorSystemLogs() {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      // Check for unusual error patterns
      const errorLogs = await SystemLog.findAll({
        where: {
          createdAt: { [Op.gte]: fiveMinutesAgo },
          severity: 'error'
        },
        limit: 50
      });

      const errorCount = errorLogs.length;
      const uniqueIPs = [...new Set(errorLogs.map(log => log.ipAddress))];
      
      // Alert if many errors from same IP
      if (uniqueIPs.length === 1 && errorCount > 10) {
        await sendAdminNotification({
          type: 'security_breach',
          category: 'security_events',
          priority: 'HIGH',
          title: 'Suspicious Activity Detected',
          message: `${errorCount} errors detected from IP ${uniqueIPs[0]} in last 5 minutes.`,
          details: {
            ipAddress: uniqueIPs[0],
            errorCount,
            timeWindow: '5 minutes',
            recentErrors: errorLogs.slice(0, 5).map(log => ({
              action: log.action,
              resource: log.resource,
              timestamp: log.createdAt
            })),
            timestamp: new Date()
          },
          actionLink: `/admin/logs?searchTerm=${uniqueIPs[0]}`,
          source: 'security_monitor'
        });
      }

      // Alert for high error rate overall
      if (errorCount > 50) {
        await sendAdminNotification({
          type: 'security_breach',
          category: 'security_events',
          priority: 'HIGH',
          title: 'High Error Rate Detected',
          message: `${errorCount} errors detected in the last 5 minutes.`,
          details: {
            errorCount,
            timeWindow: '5 minutes',
            uniqueIPs: uniqueIPs.length,
            timestamp: new Date()
          },
          actionLink: '/admin/logs?severity=error',
          source: 'security_monitor'
        });
      }
    } catch (error) {
      console.error('Error monitoring system logs:', error);
    }
  }

  /**
   * Monitor for mass user operations
   */
  static async onMassUserOperation(operation, count, adminData) {
    try {
      await sendAdminNotification({
        type: 'mass_user_import',
        category: 'user_management',
        priority: 'HIGH',
        title: `Mass User ${operation}`,
        message: `Admin ${adminData.name} performed mass ${operation} on ${count} users.`,
        details: {
          operation,
          count,
          adminName: adminData.name,
          adminId: adminData.id,
          timestamp: new Date()
        },
        actionLink: '/admin/users',
        source: 'user_management'
      });
    } catch (error) {
      console.error('Error triggering mass user operation notification:', error);
    }
  }
}

module.exports = SystemEventTriggers;
