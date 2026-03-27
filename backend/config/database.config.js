const { Sequelize } = require('sequelize');
const logger = require('../utils/logger.util');
const redis = require('./redis.config');

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'dhamini_db',
  process.env.DB_USER || 'dhamini_user',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
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
    
    // Sync all models
    await sequelize.sync({ force, alter: !force });
    logger.info('Database models synchronized successfully');
    
    // Initialize Redis connection
    await redis.connect();
    
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
    await redis.disconnect();
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
