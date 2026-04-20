require('dotenv').config();
const { User, AdminRole } = require('../models');
const { sequelize } = require('../config/database');

const assignAdminRoleToUser = async () => {
  try {
    console.log('=== Assigning Admin Role to User ===\n');
    
    // Get the admin user
    const adminUser = await User.findOne({
      where: { 
        email: 'admin@taskmanager.com' 
      }
    });

    if (!adminUser) {
      console.log('Admin user not found');
      return;
    }

    console.log(`Found admin user: ${adminUser.name} (${adminUser.email})`);
    console.log(`Current adminRoleId: ${adminUser.adminRoleId || 'NULL'}`);

    // Get the super_admin role
    const adminRole = await AdminRole.findOne({
      where: { name: 'super_admin' }
    });

    if (!adminRole) {
      console.log('Super admin role not found');
      return;
    }

    console.log(`Found admin role: ${adminRole.name}`);

    // Assign the role to the user
    await adminUser.update({ adminRoleId: adminRole.id });
    
    console.log(`Assigned admin role to user ${adminUser.name}`);
    
    // Verify the assignment
    const updatedUser = await User.findOne({
      where: { id: adminUser.id },
      include: [{
        model: AdminRole,
        as: 'adminRole',
        include: [{
          model: require('../models').AdminPermission,
          as: 'permissions'
        }]
      }]
    });

    if (updatedUser && updatedUser.adminRole) {
      console.log('\nVerification successful:');
      console.log(`User: ${updatedUser.name}`);
      console.log(`Role: ${updatedUser.adminRole.name}`);
      console.log(`Permissions: ${updatedUser.adminRole.permissions.length}`);
      
      updatedUser.adminRole.permissions.forEach(perm => {
        console.log(`  - ${perm.name} (${perm.resource}:${perm.action})`);
      });
    }

    console.log('\n=== Assignment Complete ===');
    
  } catch (error) {
    console.error('Error assigning admin role:', error.message);
  } finally {
    await sequelize.close();
  }
};

assignAdminRoleToUser();
