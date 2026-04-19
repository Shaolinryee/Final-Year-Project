const { Sequelize } = require('sequelize');

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT || 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      }
    );

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected Successfully');
    
    // Add ENUM values manually if they don't exist
    try {
      await sequelize.query("ALTER TYPE \"enum_tasks_status\" ADD VALUE 'rejected'");
      await sequelize.query("ALTER TYPE \"enum_tasks_status\" ADD VALUE 'support'");
    } catch (err) {}

    try {
      await sequelize.query("ALTER TYPE \"enum_activities_action\" ADD VALUE 'uploaded_attachment'");
      await sequelize.query("ALTER TYPE \"enum_activities_action\" ADD VALUE 'deleted_attachment'");
    } catch (err) {}

    try {
      await sequelize.query("ALTER TABLE \"attachments\" ADD COLUMN \"commentId\" UUID");
    } catch (err) {}

    // Sync models without destructive alter (prevents Sequelize Postgres sync bugs)
    await sequelize.sync({ alter: false });
    console.log('Database models synced');
    
    return sequelize;
  } catch (error) {
    console.error('Database Connection Error:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
