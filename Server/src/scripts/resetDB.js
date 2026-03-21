require('dotenv').config();
const { sequelize } = require('../config/database');
const models = require('../models');

async function resetDB() {
  try {
    console.log('--- Database Reset Start ---');
    
    // Authenticate first
    await sequelize.authenticate();
    console.log('Connection established successfully.');

    // Force sync will DROP all tables defined in current models and recreate them
    // This solves the relationship issues if data/schema was inconsistent
    await sequelize.sync({ force: true });
    
    console.log('--- Database Reset Complete ---');
    console.log('All tables dropped and recreated with latest relations.');
    
    process.exit(0);
  } catch (error) {
    console.error('--- Database Reset Failed ---');
    console.error(error);
    process.exit(1);
  }
}

resetDB();
