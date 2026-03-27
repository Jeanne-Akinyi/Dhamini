const cron = require('node-cron');
const { Repayment, Loan, Mandate } = require('../models');
const processMpesaSTKPush = require('./payment.service').processMpesaSTKPush;
const logger = require('../utils/logger.util');
const { Op } = require('sequelize');

/**
 * Scheduler Service
 * Handles scheduled tasks like repayment processing
 */

// Store active cron jobs
const cronJobs = {};

/**
 * Schedule all repayments for a loan
 */
const scheduleRepayments = async (loan) => {
  try {
    const repayments = await Repayment.findAll({
      where: {
        loanId: loan.id,
        status: 'pending'
      },
      order: [['scheduledDate', 'ASC']]
    });

    for (const repayment of repayments) {
      // Schedule job for each repayment date
      const scheduledDate = new Date(repayment.scheduledDate);
      const cronExpression = formatCronExpression(scheduledDate);
      
      const job = cron.schedule(cronExpression, async () => {
        await processRepayment(repayment);
      }, {
        scheduled: true,
        timezone: 'Africa/Nairobi'
      });

      cronJobs[repayment.id] = job;
      
      logger.info(`Scheduled repayment ${repayment.repaymentReference} for ${scheduledDate.toISOString()}`);
    }

    return {
      success: true,
      count: repayments.length
    };
  } catch (error) {
    logger.error('Failed to schedule repayments:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Process scheduled repayment
 */
const processRepayment = async (repayment) => {
  try {
    // Reload repayment to check status
    await repayment.reload();
    
    if (!repayment || repayment.status !== 'pending') {
      logger.info(`Repayment ${repayment.repaymentReference} already processed (${repayment.status})`);
      return;
    }

    // Get mandate
    const mandate = await Mandate.findByPk(repayment.mandateId);
    
    if (!mandate || mandate.status !== 'active') {
      logger.warn(`No active mandate for repayment ${repayment.repaymentReference}`);
      return;
    }

    // Process payment
    const result = await processMpesaSTKPush(repayment, mandate);
    
    logger.info(`Repayment ${repayment.repaymentReference} processed:`, result);
    
    // Cancel scheduled job
    if (cronJobs[repayment.id]) {
      cronJobs[repayment.id].stop();
      delete cronJobs[repayment.id];
    }
  } catch (error) {
    logger.error(`Failed to process repayment ${repayment.repaymentReference}:`, error);
  }
};

/**
 * Run daily at 6 AM to process due repayments
 */
const dailyRepaymentJob = cron.schedule('0 6 * * *', async () => {
  logger.info('Starting daily repayment processing...');
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueRepayments = await Repayment.findAll({
      where: {
        status: 'pending',
        scheduledDate: {
          [Op.lte]: today
        }
      },
      include: [
        { model: Loan, as: 'loan' },
        { model: Mandate, as: 'mandate' }
      ]
    });

    logger.info(`Found ${dueRepayments.length} due repayments for today`);

    for (const repayment of dueRepayments) {
      await processRepayment(repayment);
    }

    logger.info(`Daily repayment processing completed. Processed ${dueRepayments.length} repayments.`);
  } catch (error) {
    logger.error('Daily repayment job failed:', error);
  }
}, {
  timezone: 'Africa/Nairobi',
  scheduled: true
});

/**
 * Run daily at 10 PM to check for salary arrivals
 */
const salaryDetectionJob = cron.schedule('0 22 * * *', async () => {
  logger.info('Starting salary detection...');
  
  try {
    // This would analyze M-Pesa transaction patterns
    // to identify actual salary arrival dates
    logger.info('Salary detection completed');
  } catch (error) {
    logger.error('Salary detection job failed:', error);
  }
}, {
  timezone: 'Africa/Nairobi',
  scheduled: true
});

/**
 * Cancel scheduled repayment
 */
const cancelScheduledRepayment = (repaymentId) => {
  if (cronJobs[repaymentId]) {
    cronJobs[repaymentId].stop();
    delete cronJobs[repaymentId];
    logger.info(`Cancelled scheduled repayment ${repaymentId}`);
  }
};

/**
 * Format date to cron expression
 */
function formatCronExpression(date) {
  // For specific date: minute hour day month dayofweek
  const minute = date.getMinutes();
  const hour = date.getHours();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  
  return `${minute} ${hour} ${day} ${month} *`;
}

/**
 * Initialize all scheduled jobs
 */
const initializeScheduler = () => {
  logger.info('Initializing payment scheduler...');
  
  // Start daily jobs
  dailyRepaymentJob.start();
  salaryDetectionJob.start();
  
  logger.info('Payment scheduler initialized successfully');
};

/**
 * Stop all scheduled jobs
 */
const stopScheduler = () => {
  logger.info('Stopping all scheduled jobs...');
  
  Object.keys(cronJobs).forEach(jobId => {
    if (cronJobs[jobId]) {
      cronJobs[jobId].stop();
    }
  });
  
  dailyRepaymentJob?.stop();
  salaryDetectionJob?.stop();
  
  logger.info('All scheduled jobs stopped');
};

module.exports = {
  scheduleRepayments,
  processRepayment,
  cancelScheduledRepayment,
  initializeScheduler,
  stopScheduler,
  dailyRepaymentJob,
  salaryDetectionJob
};
