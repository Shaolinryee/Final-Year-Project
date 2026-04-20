require('dotenv').config();
const { hasPermission } = require('../middleware/adminPermissions');

const debugPermission = async () => {
  try {
    console.log('=== Debugging Permission Check ===\n');
    
    const userId = '195c2af2-4d34-4dea-85ac-50e6651d3f60';
    const resource = 'system';
    const action = 'manage_storage';
    
    console.log(`Checking permission for user: ${userId}`);
    console.log(`Resource: ${resource}`);
    console.log(`Action: ${action}`);
    
    const hasPermissionResult = await hasPermission(userId, resource, action);
    
    console.log(`Permission result: ${hasPermissionResult}`);
    
    console.log('\n=== Debug Complete ===');
    
  } catch (error) {
    console.error('Error debugging permission:', error.message);
    console.error('Stack:', error.stack);
  }
};

debugPermission();
