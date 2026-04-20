const { User, SystemLog } = require('../models');
const { v4: uuidv4 } = require('uuid');

const seedSampleLogs = async () => {
  try {
    console.log('Seeding sample activity logs...');

    // Get a user to associate with logs
    const adminUser = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!adminUser) {
      console.log('No admin user found. Creating sample logs without user association.');
    }

    const sampleLogs = [
      {
        id: uuidv4(),
        userId: adminUser?.id || null,
        action: 'login',
        resource: 'admin',
        resourceId: adminUser?.id || null,
        details: { description: 'Admin logged into admin panel', method: 'POST', url: '/admin/login' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'info',
        category: 'admin_action',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: uuidv4(),
        userId: adminUser?.id || null,
        action: 'view',
        resource: 'user',
        resourceId: uuidv4(),
        details: { description: 'Viewed user management page', method: 'GET', url: '/admin/users' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'info',
        category: 'admin_action',
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000) // 1.5 hours ago
      },
      {
        id: uuidv4(),
        userId: adminUser?.id || null,
        action: 'update',
        resource: 'user',
        resourceId: uuidv4(),
        details: { description: 'Updated user status', method: 'PATCH', url: '/admin/users/123/status', previousStatus: 'active', newStatus: 'suspended' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'warning',
        category: 'user_management',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      },
      {
        id: uuidv4(),
        userId: adminUser?.id || null,
        action: 'create',
        resource: 'project',
        resourceId: uuidv4(),
        details: { description: 'Created new project', method: 'POST', url: '/projects', projectName: 'Sample Project' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'info',
        category: 'project_management',
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      },
      {
        id: uuidv4(),
        userId: adminUser?.id || null,
        action: 'delete',
        resource: 'task',
        resourceId: uuidv4(),
        details: { description: 'Deleted task', method: 'DELETE', url: '/tasks/456', taskTitle: 'Sample Task' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'error',
        category: 'project_management',
        createdAt: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
      },
      {
        id: uuidv4(),
        userId: adminUser?.id || null,
        action: 'export',
        resource: 'system',
        resourceId: null,
        details: { description: 'Exported system settings', method: 'GET', url: '/admin/settings/export', format: 'json' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'info',
        category: 'admin_action',
        createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      },
      {
        id: uuidv4(),
        userId: adminUser?.id || null,
        action: 'login',
        resource: 'user',
        resourceId: uuidv4(),
        details: { description: 'User login attempt', method: 'POST', url: '/login', email: 'user@example.com', success: true },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        severity: 'info',
        category: 'security',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      },
      {
        id: uuidv4(),
        userId: adminUser?.id || null,
        action: 'failed_login',
        resource: 'user',
        resourceId: null,
        details: { description: 'Failed login attempt', method: 'POST', url: '/login', email: 'hacker@bad.com', reason: 'invalid_password' },
        ipAddress: '10.0.0.1',
        userAgent: 'Mozilla/5.0 (compatible; scanner/1.0)',
        severity: 'critical',
        category: 'security',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      }
    ];

    // Create the logs
    await SystemLog.bulkCreate(sampleLogs);

    console.log(`Successfully created ${sampleLogs.length} sample activity logs`);
    console.log('Sample logs created with different:');
    console.log('- Actions: login, view, update, create, delete, export, failed_login');
    console.log('- Resources: admin, user, project, task, system');
    console.log('- Severities: info, warning, error, critical');
    console.log('- Categories: admin_action, user_management, project_management, security');
    console.log('- Time ranges: From 4 hours ago to 5 minutes ago');

  } catch (error) {
    console.error('Error seeding sample logs:', error);
  }
};

// Run the seeder
if (require.main === module) {
  seedSampleLogs()
    .then(() => {
      console.log('Sample logs seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Sample logs seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedSampleLogs;
