require('dotenv').config();
const { sequelize } = require('../config/database');

const addAdminRoleIdColumn = async () => {
  try {
    console.log('Adding adminRoleId column to users table...');
    
    // Check if column already exists
    const checkColumnQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'adminRoleId'
    `;
    
    const [result] = await sequelize.query(checkColumnQuery);
    
    if (result.length > 0) {
      console.log('adminRoleId column already exists');
      return;
    }
    
    // Add the column
    const addColumnQuery = `
      ALTER TABLE users 
      ADD COLUMN "adminRoleId" UUID,
      ADD CONSTRAINT "users_adminRoleId_fkey" 
      FOREIGN KEY ("adminRoleId") 
      REFERENCES "admin_roles" ("id") 
      ON DELETE SET NULL ON UPDATE CASCADE
    `;
    
    await sequelize.query(addColumnQuery);
    
    console.log('adminRoleId column added successfully');
    
    // Verify the column was added
    const [verifyResult] = await sequelize.query(checkColumnQuery);
    if (verifyResult.length > 0) {
      console.log('Column verification successful');
      console.log('Column details:', verifyResult[0]);
    }
    
  } catch (error) {
    console.error('Error adding adminRoleId column:', error.message);
    if (error.message.includes('already exists')) {
      console.log('Column might already exist, continuing...');
    }
  } finally {
    await sequelize.close();
  }
};

addAdminRoleIdColumn();
