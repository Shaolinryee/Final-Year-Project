const express = require('express');
const router = express.Router();

// Import middleware
const { requireAdminAuth, requireAdmin, requireSuperAdmin } = require('../middleware/adminAuth');
const { requirePermission, auditLog, PERMISSIONS } = require('../middleware/adminPermissions');
const { uploadProfilePhoto } = require('../middleware/upload');

// Import controllers
const adminController = require('../controllers/adminController');
const storageController = require('../controllers/storageController');
const adminNotificationController = require('../controllers/adminNotificationController');
const adminProfileController = require('../controllers/adminProfileController');

// Apply admin authentication to all admin routes
router.use(requireAdminAuth);

// Dashboard routes
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/health', adminController.getSystemHealth);

// Admin users management
router.get('/users/admin', adminController.getAdminUsers);
router.get('/users', adminController.getAllUsers);
router.post('/users/:id/suspend', 
  requirePermission(PERMISSIONS.USER.SUSPEND),
  auditLog('suspend', 'user'),
  adminController.suspendUser
);
router.post('/users/:id/unsuspend', 
  requirePermission(PERMISSIONS.USER.SUSPEND),
  auditLog('unsuspend', 'user'),
  adminController.unsuspendUser
);
router.patch('/users/:id/status', 
  auditLog('toggle_status', 'user'),
  adminController.toggleUserStatus
);
router.post('/users/:id/role', 
  auditLog('assign_role', 'user'),
  adminController.assignAdminRole
);

// Project Management
router.get('/projects', adminController.getAllProjects);
router.get('/projects/:id/permissions', adminController.getProjectPermissions);
router.put('/projects/:id/permissions', 
  auditLog('update_project_permissions', 'project'),
  adminController.updateProjectPermissions
);
router.post('/projects/:id/reset-permissions', 
  auditLog('reset_project_permissions', 'project'),
  adminController.resetProjectPermissions
);

// System settings
router.get('/settings', adminController.getSystemSettings);
router.get('/settings/schema', adminController.getSettingsSchema);
router.put('/settings', 
  auditLog('update', 'system_setting'),
  adminController.updateSystemSetting
);
router.post('/settings/bulk', 
  auditLog('bulk_update', 'system_setting'),
  adminController.updateMultipleSettings
);
router.post('/settings/reset', 
  auditLog('reset', 'system_setting'),
  adminController.resetSystemSettings
);
router.get('/settings/export', 
  auditLog('export', 'system_setting'),
  adminController.exportSettings
);
router.post('/settings/import', 
  auditLog('import', 'system_setting'),
  adminController.importSettings
);
router.get('/settings/history', 
  auditLog('view', 'settings_history'),
  adminController.getSettingsHistory
);

// Activity Logs
router.get('/logs', 
  auditLog('view', 'activity_logs'),
  adminController.getActivityLogs
);
router.get('/logs/analytics', 
  auditLog('view', 'log_analytics'),
  adminController.getLogsAnalytics
);
router.get('/logs/users', 
  auditLog('view', 'log_users'),
  adminController.getLogUsers
);
router.get('/logs/actions', 
  auditLog('view', 'log_actions'),
  adminController.getLogActions
);
router.get('/logs/resources', 
  auditLog('view', 'log_resources'),
  adminController.getLogResources
);
router.get('/logs/categories', 
  auditLog('view', 'log_categories'),
  adminController.getLogCategories
);
router.get('/logs/export', 
  auditLog('export', 'activity_logs'),
  adminController.exportLogs
);
router.get('/logs/:id', 
  auditLog('view', 'log_details'),
  adminController.getLogDetails
);

// Storage Management routes
router.get('/storage/analytics', 
  requirePermission('system', 'manage_storage'),
  storageController.getStorageAnalytics
);

router.get('/storage/files', 
  requirePermission('system', 'manage_storage'),
  storageController.getFiles
);

router.get('/storage/files/:id', 
  requirePermission('system', 'manage_storage'),
  storageController.getFile
);

router.get('/storage/files/:id/download', 
  requirePermission('system', 'manage_storage'),
  auditLog('download', 'storage_file'),
  storageController.downloadFile
);

router.delete('/storage/files/:id', 
  requirePermission('system', 'manage_storage'),
  auditLog('delete', 'storage_file'),
  storageController.deleteFile
);

router.post('/storage/files/bulk-delete', 
  requirePermission('system', 'manage_storage'),
  auditLog('bulk_delete', 'storage_files'),
  storageController.bulkDeleteFiles
);

// Admin Notifications routes
router.get('/notifications', adminNotificationController.getAdminNotifications);
router.get('/notifications/categories', adminNotificationController.getNotificationCategories);
router.get('/notifications/stats', adminNotificationController.getNotificationStats);
router.get('/notifications/preferences', adminNotificationController.getNotificationPreferences);
router.put('/notifications/preferences', adminNotificationController.updateNotificationPreferences);
router.post('/notifications/global', 
  requirePermission('system', 'manage_settings'),
  auditLog('send', 'global_notification'),
  adminNotificationController.sendGlobalNotificationController
);
router.put('/notifications/:id/read', adminNotificationController.markNotificationAsRead);
router.put('/notifications/read-all', adminNotificationController.markAllNotificationsAsRead);
router.delete('/notifications/:id', adminNotificationController.deleteNotification);
router.get('/notifications/templates', adminNotificationController.getNotificationTemplates);
router.get('/notifications/delivery-stats', adminNotificationController.getDeliveryStats);

// Admin Profile routes
router.get('/profile/me', adminProfileController.getAdminProfile);
router.put('/profile/update', adminProfileController.updateAdminProfile);
router.put('/profile/change-password', adminProfileController.changePassword);
router.post('/profile/upload-photo', uploadProfilePhoto, adminProfileController.uploadProfilePhoto);
router.get('/profile/login-history', adminProfileController.getLoginHistory);
router.get('/profile/sessions', adminProfileController.getActiveSessions);
router.delete('/profile/sessions/:sessionId', adminProfileController.revokeSession);
router.post('/profile/2fa/enable', adminProfileController.enable2FA);
router.post('/profile/2fa/verify', adminProfileController.verify2FASetup);

module.exports = router;
