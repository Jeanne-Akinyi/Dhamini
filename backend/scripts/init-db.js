/**
 * Database Initialization Script
 * Initializes the database with tables and basic seed data
 */

const { initializeDatabase } = require('../config/database.config');
const logger = require('../utils/logger.util');

const initialize = async () => {
  try {
    logger.info('Starting database initialization...');
    
    // Initialize database and sync all models
    await initializeDatabase(true); // true = force sync (recreate tables)
    
    logger.info('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

// Run initialization
if (require.main === module) {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  
  if (force) {
    logger.warn('⚠️  Running with --force flag. This will DROP ALL TABLES!');
  }
  
  initialize();
}

module.exports = { initialize };
