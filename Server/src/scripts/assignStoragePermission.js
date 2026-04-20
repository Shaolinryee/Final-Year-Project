require('dotenv').config();
const { AdminRole, AdminPermission } = require('../models');
const { sequelize } = require('../config/database');

const assignStoragePermission = async () => {
  try {
    console.log('=== Assigning Storage Permission ===\n');
    
    // Find or create the storage permission
    let storagePermission = await AdminPermission.findOne({
      where: { 
        resource: 'system',
        action: 'manage_storage' 
      }
    });

    if (!storagePermission) {
      console.log('Creating storage permission...');
      storagePermission = await AdminPermission.create({
        name: 'Manage Storage',
        resource: 'system',
        action: 'manage_storage',
        description: 'Can manage system storage and files',
        category: 'system'
      });
      console.log('Storage permission created');
    } else {
      console.log('Storage permission already exists');
    }

    // Get all admin roles
    const adminRoles = await AdminRole.findAll();
    
    if (adminRoles.length === 0) {
      console.log('No admin roles found');
      return;
    }

    console.log(`\nFound ${adminRoles.length} admin role(s):`);

    // Assign storage permission to all admin roles
    for (const role of adminRoles) {
      console.log(`\nRole: ${role.name}`);
      
      // Check if role already has storage permission
      const hasPermission = await role.hasPermission(storagePermission);
      
      if (!hasPermission) {
        await role.addPermission(storagePermission);
        console.log(`  + Added storage permission to ${role.name}`);
      } else {
        console.log(`  - Already has storage permission`);
      }

      // Show all permissions for this role
      const permissions = await role.getPermissions();
      console.log(`  Current permissions (${permissions.length}):`);
      permissions.forEach(perm => {
        console.log(`    - ${perm.name} (${perm.key})`);
      });
    }

    console.log('\n=== Assignment Complete ===');
    console.log('All admin roles now have storage management permission!');
    
  } catch (error) {
    console.error('Error assigning permission:', error.message);
  } finally {
    await sequelize.close();
  }
};

assignStoragePermission();
