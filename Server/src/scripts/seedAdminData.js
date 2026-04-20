const { sequelize } = require('../config/database');
const { AdminRole, AdminPermission, SystemSetting, User } = require('../models');

const seedAdminData = async () => {
  try {
    console.log('Starting admin data seeding...');

    // Sync database
    await sequelize.sync({ force: false });

    // Create default admin permissions
    const permissions = [
      // User permissions
      { name: 'users:read', resource: 'users', action: 'read', category: 'User Management', description: 'View user information' },
      { name: 'users:create', resource: 'users', action: 'create', category: 'User Management', description: 'Create new users' },
      { name: 'users:update', resource: 'users', action: 'update', category: 'User Management', description: 'Update user information' },
      { name: 'users:delete', resource: 'users', action: 'delete', category: 'User Management', description: 'Delete users' },
      { name: 'users:suspend', resource: 'users', action: 'suspend', category: 'User Management', description: 'Suspend users' },
      { name: 'users:assign_role', resource: 'users', action: 'assign_role', category: 'User Management', description: 'Assign admin roles to users' },

      // Project permissions
      { name: 'projects:read', resource: 'projects', action: 'read', category: 'Project Management', description: 'View project information' },
      { name: 'projects:update', resource: 'projects', action: 'update', category: 'Project Management', description: 'Update project information' },
      { name: 'projects:delete', resource: 'projects', action: 'delete', category: 'Project Management', description: 'Delete projects' },
      { name: 'projects:archive', resource: 'projects', action: 'archive', category: 'Project Management', description: 'Archive projects' },

      // System permissions
      { name: 'system:read_logs', resource: 'system', action: 'read_logs', category: 'System Management', description: 'View system logs' },
      { name: 'system:manage_settings', resource: 'system', action: 'manage_settings', category: 'System Management', description: 'Manage system settings' },
      { name: 'system:view_analytics', resource: 'system', action: 'view_analytics', category: 'System Management', description: 'View system analytics' },
      { name: 'system:manage_storage', resource: 'system', action: 'manage_storage', category: 'System Management', description: 'Manage file storage' },

      // Admin permissions
      { name: 'admin:manage_roles', resource: 'admin', action: 'manage_roles', category: 'Admin Management', description: 'Manage admin roles' },
      { name: 'admin:manage_permissions', resource: 'admin', action: 'manage_permissions', category: 'Admin Management', description: 'Manage admin permissions' },
      { name: 'admin:view_audit_logs', resource: 'admin', action: 'view_audit_logs', category: 'Admin Management', description: 'View audit logs' }
    ];

    console.log('Creating permissions...');
    const createdPermissions = [];
    for (const permission of permissions) {
      const [createdPermission, created] = await AdminPermission.findOrCreate({
        where: { name: permission.name },
        defaults: permission
      });
      if (created) {
        createdPermissions.push(createdPermission);
        console.log(`Created permission: ${permission.name}`);
      } else {
        createdPermissions.push(createdPermission);
      }
    }

    // Create default admin roles
    const roles = [
      {
        name: 'super_admin',
        displayName: 'Super Admin',
        description: 'Full system access with all permissions',
        level: 3,
        permissions: createdPermissions // All permissions
      },
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Administrative access to most system features',
        level: 2,
        permissions: createdPermissions.filter(p => 
          !p.name.includes('manage_roles') && 
          !p.name.includes('manage_permissions') &&
          !p.name.includes('delete')
        )
      },
      {
        name: 'support',
        displayName: 'Support Staff',
        description: 'Limited access for support tasks',
        level: 1,
        permissions: createdPermissions.filter(p => 
          p.name.includes('read') || 
          p.name.includes('update') ||
          p.name.includes('suspend')
        )
      },
      {
        name: 'read_only',
        displayName: 'Read Only',
        description: 'View-only access to admin panel',
        level: 0,
        permissions: createdPermissions.filter(p => p.name.includes('read'))
      }
    ];

    console.log('Creating roles...');
    for (const roleData of roles) {
      const [role, created] = await AdminRole.findOrCreate({
        where: { name: roleData.name },
        defaults: {
          name: roleData.name,
          displayName: roleData.displayName,
          description: roleData.description,
          level: roleData.level
        }
      });

      if (created) {
        console.log(`Created role: ${roleData.displayName}`);
        
        // Associate permissions with role
        await role.setPermissions(roleData.permissions);
        console.log(`Assigned ${roleData.permissions.length} permissions to ${roleData.displayName}`);
      }
    }

    // Create default system settings
    const settings = [
      { key: 'site_name', value: 'Task Management System', type: 'string', category: 'General', description: 'Site name displayed in header' },
      { key: 'max_file_size', value: '10485760', type: 'number', category: 'Storage', description: 'Maximum file upload size in bytes' },
      { key: 'enable_user_registration', value: 'true', type: 'boolean', category: 'Authentication', description: 'Allow new user registration' },
      { key: 'session_timeout', value: '3600', type: 'number', category: 'Security', description: 'Session timeout in seconds' },
      { key: 'email_notifications', value: 'true', type: 'boolean', category: 'Notifications', description: 'Enable email notifications' },
      { key: 'maintenance_mode', value: 'false', type: 'boolean', category: 'System', description: 'Enable maintenance mode', isPublic: true }
    ];

    console.log('Creating system settings...');
    for (const setting of settings) {
      const [createdSetting, created] = await SystemSetting.findOrCreate({
        where: { key: setting.key },
        defaults: setting
      });
      if (created) {
        console.log(`Created setting: ${setting.key}`);
      }
    }

    // Create a default super admin user if none exists
    const superAdminRole = await AdminRole.findOne({ where: { name: 'super_admin' } });
    
    const [adminUser, userCreated] = await User.findOrCreate({
      where: { email: 'admin@taskmanager.com' },
      defaults: {
        name: 'System Administrator',
        email: 'admin@taskmanager.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
        role: 'admin',
        adminRoleId: superAdminRole.id,
        isVerified: true,
        isActive: true
      }
    });

    if (userCreated) {
      console.log('Created default admin user: admin@taskmanager.com (password: password)');
    }

    console.log('Admin data seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding admin data:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  seedAdminData()
    .then(() => {
      console.log('Seeding completed. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedAdminData;
