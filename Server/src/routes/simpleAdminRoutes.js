const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcryptjs');

// Simple admin user creation
router.post('/create-simple-admin', async (req, res) => {
  try {
    console.log('Creating simple admin user...');

    // Hash the password
    const hashedPassword = await bcrypt.hash('password', 10);

    // Create admin user without adminRoleId
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
