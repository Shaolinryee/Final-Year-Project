const { sequelize } = require('../config/database');
const { User, AdminRole, AdminPermission } = require('../models');

const createAdminUser = async () => {
  try {
    console.log('Creating admin user...');

    // Sync database
    await sequelize.sync({ alter: true });

    // Create basic permissions
    const permissions = [
      { name: 'users:read', resource: 'users', action: 'read', category: 'User Management' },
      { name: 'users:suspend', resource: 'users', action: 'suspend', category: 'User Management' },
      { name: 'users:assign_role', resource: 'users', action: 'assign_role', category: 'User Management' },
      { name: 'system:manage_settings', resource: 'system', action: 'manage_settings', category: 'System Management' },
      { name: 'system:view_analytics', resource: 'system', action: 'view_analytics', category: 'System Management' },
    ];

    for (const permission of permissions) {
      await AdminPermission.findOrCreate({
        where: { name: permission.name },
        defaults: permission
      });
    }

    // Create super admin role
    const [superAdminRole, created] = await AdminRole.findOrCreate({
      where: { name: 'super_admin' },
      defaults: {
        name: 'super_admin',
        displayName: 'Super Admin',
        description: 'Full system access',
        level: 3
      }
    });

    if (created) {
      console.log('Created super admin role');
      
      // Get all permissions and assign to super admin
      const allPermissions = await AdminPermission.findAll();
      await superAdminRole.setPermissions(allPermissions);
    }

    // Create admin user
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
      console.log('✅ Created admin user: admin@taskmanager.com (password: password)');
    } else {
      // Update existing user with admin role
      await adminUser.update({
        role: 'admin',
        adminRoleId: superAdminRole.id,
        isActive: true
      });
      console.log('✅ Updated existing user with admin role');
    }

    console.log('Admin setup completed successfully!');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('Admin user creation completed. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Admin user creation failed:', error);
      process.exit(1);
    });
}

module.exports = createAdminUser;
