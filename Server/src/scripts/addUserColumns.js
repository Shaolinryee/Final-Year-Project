const { sequelize } = require('../config/database');

const addUserColumns = async () => {
  try {
    console.log('Adding user columns...');

    // Add user-related columns to users table
    const queries = [
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "loginCount" INTEGER DEFAULT 0`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "suspendedAt" TIMESTAMP`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "suspendedBy" UUID REFERENCES "users"("id")`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "suspensionReason" TEXT`
    ];

    for (const query of queries) {
      try {
        await sequelize.query(query);
        console.log(`Executed: ${query.split(' ADD COLUMN ')[1]}`);
      } catch (error) {
        console.log(`Column may already exist: ${error.message}`);
      }
    }

    console.log('User columns added successfully!');
    
  } catch (error) {
    console.error('Error adding user columns:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  addUserColumns()
    .then(() => {
      console.log('Column addition completed. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Column addition failed:', error);
      process.exit(1);
    });
}

module.exports = addUserColumns;
