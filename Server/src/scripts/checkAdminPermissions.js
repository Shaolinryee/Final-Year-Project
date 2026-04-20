const { User, AdminRole, AdminPermission } = require('../models');
const { sequelize } = require('../config/database');

const checkAdminPermissions = async () => {
  try {
    console.log('=== Checking Admin Permissions ===\n');
    
    // Get all admin users
    const adminUsers = await User.findAll({
      include: [{
        model: AdminRole,
        as: 'adminRole',
        include: [{
          model: AdminPermission,
          as: 'permissions'
        }]
      }]
    });

    if (adminUsers.length === 0) {
      console.log('No admin users found');
      return;
    }

    console.log(`Found ${adminUsers.length} admin user(s):\n`);

    adminUsers.forEach(user => {
      console.log(`User: ${user.name} (${user.email})`);
      console.log(`Role: ${user.adminRole?.name || 'No role'}`);
      
      if (user.adminRole && user.adminRole.permissions) {
        console.log('Permissions:');
        user.adminRole.permissions.forEach(perm => {
          console.log(`  - ${perm.name} (${perm.key})`);
          if (perm.key === 'system:manage_storage') {
            console.log('    >>> HAS STORAGE MANAGEMENT PERMISSION <<<');
          }
        });
      } else {
        console.log('No permissions found');
      }
      console.log('');
    });

    // Check if system:manage_storage permission exists
    const storagePermission = await AdminPermission.findOne({
      where: { key: 'system:manage_storage' }
    });

    if (storagePermission) {
      console.log('Storage permission exists in database');
    } else {
      console.log('Storage permission NOT found in database - creating it...');
      
      await AdminPermission.create({
        name: 'Manage Storage',
        key: 'system:manage_storage',
        description: 'Can manage system storage and files'
      });
      
      console.log('Storage permission created');
    }

  } catch (error) {
    console.error('Error checking permissions:', error.message);
  } finally {
    await sequelize.close();
  }
};

checkAdminPermissions();
