const express = require('express');
const router = express.Router();
const { User, AdminRole, AdminPermission } = require('../models');
const bcrypt = require('bcryptjs');

// Temporary endpoint to create admin user
router.post('/create-admin', async (req, res) => {
  try {
    console.log('Creating admin user...');

    // Create super admin role if it doesn't exist
    const [superAdminRole, roleCreated] = await AdminRole.findOrCreate({
      where: { name: 'super_admin' },
      defaults: {
        name: 'super_admin',
        displayName: 'Super Admin',
        description: 'Full system access',
        level: 3
      }
    });

    if (roleCreated) {
      console.log('Created super admin role');
      
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

      // Get all permissions and assign to super admin
      const allPermissions = await AdminPermission.findAll();
      await superAdminRole.setPermissions(allPermissions);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('password', 10);

    // Create admin user
    const [adminUser, userCreated] = await User.findOrCreate({
      where: { email: 'admin@taskmanager.com' },
      defaults: {
        name: 'System Administrator',
        email: 'admin@taskmanager.com',
        password: hashedPassword,
        role: 'admin',
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
        isActive: true
      });
      console.log('✅ Updated existing user with admin role');
    }

    res.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        email: 'admin@taskmanager.com',
        password: 'password'
      }
    });
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
