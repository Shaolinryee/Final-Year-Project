require('dotenv').config();
const { sequelize } = require('../config/database');

const testDatabaseConnection = async () => {
  try {
    console.log('=== Database Connection Test ===\n');
    
    // Check environment variables
    console.log('Environment Variables:');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    console.log('DB_NAME:', process.env.DB_NAME || 'NOT SET');
    console.log('DB_USER:', process.env.DB_USER || 'NOT SET');
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
    console.log('DB_HOST:', process.env.DB_HOST || 'NOT SET');
    console.log('DB_PORT:', process.env.DB_PORT || 'NOT SET');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
    console.log('');
    
    // Test basic connection
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('Database connection successful!');
    
    // Test a simple query
    console.log('Testing simple query...');
    const [results] = await sequelize.query('SELECT NOW() as current_time');
    console.log('Query successful:', results[0]);
    
    // Test user table
    console.log('Testing user table access...');
    const [userCount] = await sequelize.query('SELECT COUNT(*) as count FROM users');
    console.log('Users table accessible, count:', userCount[0].count);
    
    console.log('\n=== All Tests Passed ===');
    
  } catch (error) {
    console.error('Database connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.message.includes('password')) {
      console.error('\nPassword-related issue detected:');
      console.error('- Check if DB_PASSWORD is set correctly');
      console.error('- Check if password contains special characters');
      console.error('- Try escaping password in .env file');
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('\nConnection issue detected:');
      console.error('- Check if database server is running');
      console.error('- Check DB_HOST and DB_PORT settings');
    }
    
    if (error.message.includes('SASL')) {
      console.error('\nAuthentication issue detected:');
      console.error('- Check PostgreSQL user permissions');
      console.error('- Check if user exists in database');
      console.error('- Check password authentication method');
    }
  } finally {
    await sequelize.close();
  }
};

testDatabaseConnection();
