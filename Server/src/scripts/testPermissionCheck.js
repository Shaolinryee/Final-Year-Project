require('dotenv').config();
const { User } = require('../models');
const { sequelize } = require('../config/database');

const testPermissionCheck = async () => {
  try {
    console.log('=== Testing Permission Check ===\n');
    
    // Get the admin user
    const adminUser = await User.findOne({
      where: { 
        email: 'admin@taskmanager.com' 
      },
      include: [{
        model: require('../models').AdminRole,
        as: 'adminRole',
        include: [{
          model: require('../models').AdminPermission,
          as: 'permissions'
        }]
      }]
    });

    if (!adminUser) {
      console.log('Admin user not found');
      return;
    }

    console.log(`User: ${adminUser.name}`);
    console.log(`Admin Role: ${adminUser.adminRole?.name || 'None'}`);
    
    if (adminUser.adminRole && adminUser.adminRole.permissions) {
      console.log(`Permissions: ${adminUser.adminRole.permissions.length}`);
      
      // Check for storage permission
      const storagePermission = adminUser.adminRole.permissions.find(p => 
        p.resource === 'system' && p.action === 'manage_storage'
      );
      
      if (storagePermission) {
        console.log('Storage permission found:');
        console.log(`  Name: ${storagePermission.name}`);
        console.log(`  Resource: ${storagePermission.resource}`);
        console.log(`  Action: ${storagePermission.action}`);
        console.log(`  Active: ${storagePermission.isActive}`);
      } else {
        console.log('Storage permission NOT found');
        console.log('Available permissions:');
        adminUser.adminRole.permissions.forEach(perm => {
          console.log(`  - ${perm.name} (${perm.resource}:${perm.action})`);
        });
      }
    } else {
      console.log('No admin role or permissions found');
    }

    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Error testing permission:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
};

testPermissionCheck();
