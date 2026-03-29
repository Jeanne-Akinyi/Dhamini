const { Sequelize } = require('sequelize');
const logger = require('../utils/logger.util');

// Database configuration
const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;

// If DATABASE_URL is provided, use it directly; otherwise use individual params
const sequelizeConfig = databaseUrl
  ? {
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
      pool: {
        max: parseInt(process.env.DB_POOL_MAX) || 20,
        min: parseInt(process.env.DB_POOL_MIN) || 5,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true
      }
    }
  : {
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'dhamini_db',
      username: process.env.DB_USER || 'dhamini_user',
      password: process.env.DB_PASSWORD || 'password',
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
      pool: {
        max: parseInt(process.env.DB_POOL_MAX) || 20,
        min: parseInt(process.env.DB_POOL_MIN) || 5,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true
      }
    };

const sequelize = new Sequelize(
  databaseUrl || 'postgres://dhamini_user:password@localhost:5432/dhamini_db',
  sequelizeConfig
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};

// Initialize database with models and sync
const initializeDatabase = async (force = false) => {
  try {
    await testConnection();
    
    // Import all models
    const models = require('../models');
    
    // Sync all models - use force:true to drop and recreate tables (fixes UNIQUE constraint issues)
    await sequelize.sync({ force: true });
    logger.info('Database models synchronized successfully');
    
    return true;
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
};

// Graceful shutdown
const closeConnection = async () => {
  try {
    await sequelize.close();
    logger.info('Database connections closed successfully');
  } catch (error) {
    logger.error('Error closing database connections:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  initializeDatabase,
  closeConnection
};
