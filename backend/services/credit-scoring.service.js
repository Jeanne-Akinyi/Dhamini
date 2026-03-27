const { CreditScore, Repayment, Loan } = require('../models');
const logger = require('../utils/logger.util');

/**
 * Credit Scoring Service
 * Calculates and updates Dhamini Credit Scores based on repayment behavior
 */

// Score component weights
const WEIGHTS = {
  repaymentConsistency: 35,
  repaymentHistoryDepth: 20,
  creditUtilization: 15,
  incomeStability: 15,
  institutionDiversity: 10,
  fraudDisputeRecord: 5
};

/**
 * Calculate credit score for user
 */
const calculateCreditScore = async (userId, reloadData = false) => {
  try {
    let creditScore = await CreditScore.findOne({ where: { userId } });
    
    if (!creditScore) {
      // Create initial credit score
      creditScore = await CreditScore.create({
        userId,
        dcsScore: 400,
        riskTier: 'D'
      });
      return {
        total: 400,
        tier: 'D',
        components: {
          repaymentConsistency: 0,
          repaymentHistoryDepth: 0,
          creditUtilization: 0,
          incomeStability: 0,
          institutionDiversity: 0,
          fraudDisputeRecord: 100
        }
      };
    }

    // Get repayment history
    const repayments = await Repayment.findAll({
      where: { borrowerId: userId },
      order: [['scheduledDate', 'DESC']],
      include: [{ model: Loan, as: 'loan' }]
    });

    // Get loans
    const loans = await Loan.findAll({
      where: { borrowerId: userId }
    });

    // Calculate score components
    const components = calculateScoreComponents(repayments, loans, creditScore);

    // Calculate weighted total score
    const totalScore = calculateWeightedScore(components);

    // Determine risk tier
    const riskTier = determineRiskTier(totalScore);

    // Update credit score
    creditScore.repaymentConsistency = components.repaymentConsistency;
    creditScore.repaymentHistoryDepth = components.repaymentHistoryDepth;
    creditScore.creditUtilization = components.creditUtilization;
    creditScore.incomeStability = components.incomeStability;
    creditScore.institutionDiversity = components.institutionDiversity;
    creditScore.fraudDisputeRecord = components.fraudDisputeRecord;
    creditScore.dcsScore = totalScore;
    creditScore.riskTier = riskTier;
    creditScore.lastScoreUpdate = new Date();

    // Update aggregate stats
    creditScore.totalRepaymentCount = repayments.length;
    creditScore.onTimeRepaymentCount = repayments.filter(r => !r.isLate && r.status === 'completed').length;
    creditScore.lateRepaymentCount = repayments.filter(r => r.isLate && r.status === 'completed').length;
    creditScore.missedRepaymentCount = repayments.filter(r => r.status === 'failed').length;
    creditScore.totalLoans = loans.length;
    creditScore.activeLoans = loans.filter(l => l.status === 'active' || l.status === 'disbursed').length;
    creditScore.completedLoans = loans.filter(l => l.status === 'completed').length;
    creditScore.defaultedLoans = loans.filter(l => l.status === 'defaulted').length;
    creditScore.totalLoanAmount = loans.reduce((sum, l) => sum + parseFloat(l.loanAmount), 0);
    creditScore.outstandingBalance = loans.filter(l => l.status === 'active' || l.status === 'disbursed')
      .reduce((sum, l) => sum + parseFloat(l.outstandingBalance), 0);

    // Save score history
    const historyEntry = {
      date: new Date().toISOString(),
      score: totalScore,
      tier: riskTier,
      reason: reloadData ? 'Manual recalculation' : 'Repayment event',
      components
    };

    creditScore.scoreHistory = creditScore.scoreHistory || [];
    creditScore.scoreHistory.push(historyEntry);

    // Keep only last 100 history entries
    if (creditScore.scoreHistory.length > 100) {
      creditScore.scoreHistory = creditScore.scoreHistory.slice(-100);
    }

    await creditScore.save();

    logger.info(`Credit score calculated for user ${userId}: ${totalScore} (${riskTier})`);

    return {
      total: totalScore,
      tier: riskTier,
      components
    };
  } catch (error) {
    logger.error('Failed to calculate credit score:', error);
    throw error;
  }
};

/**
 * Calculate score components
 */
function calculateScoreComponents(repayments, loans, currentScore) {
  // Repayment Consistency (35%)
  const repaymentConsistency = calculateRepaymentConsistency(repayments);

  // Repayment History Depth (20%)
  const repaymentHistoryDepth = calculateHistoryDepth(repayments);

  // Credit Utilization (15%)
  const creditUtilization = calculateCreditUtilization(loans);

  // Income Stability (15%) - would be calculated from transaction patterns
  const incomeStability = currentScore?.incomeStability || 0;

  // Institution Diversity (10%)
  const institutionDiversity = calculateInstitutionDiversity(loans);

  // Fraud/Dispute Record (5%) - lower is better
  const fraudDisputeRecord = currentScore?.fraudDisputeRecord || 100;

  return {
    repaymentConsistency,
    repaymentHistoryDepth,
    creditUtilization,
    incomeStability,
    institutionDiversity,
    fraudDisputeRecord
  };
}

/**
 * Calculate repayment consistency
 */
function calculateRepaymentConsistency(repayments) {
  if (repayments.length === 0) return 0;

  const completedRepayments = repayments.filter(r => r.status === 'completed');
  if (completedRepayments.length === 0) return 0;

  const onTimeCount = completedRepayments.filter(r => !r.isLate).length;
  const consistency = (onTimeCount / completedRepayments.length) * 100;

  return Math.round(consistency);
}

/**
 * Calculate history depth
 */
function calculateHistoryDepth(repayments) {
  const completedRepayments = repayments.filter(r => r.status === 'completed');
  if (completedRepayments.length === 0) return 0;

  const months = calculateMonthsOfHistory(completedRepayments);
  
  // Maximum score for 3+ years history
  return Math.min(100, Math.round((months / 36) * 100));
}

/**
 * Calculate credit utilization
 */
function calculateCreditUtilization(loans) {
  const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'disbursed');
  
  if (activeLoans.length === 0) return 100;

  let totalUsed = 0;
  let totalLimit = 0;

  activeLoans.forEach(loan => {
    totalUsed += parseFloat(loan.outstandingBalance);
    totalLimit += parseFloat(loan.loanAmount);
  });

  if (totalLimit === 0) return 0;

  const utilization = (totalUsed / totalLimit) * 100;
  
  // Lower utilization is better
  return Math.max(0, Math.round(100 - utilization));
}

/**
 * Calculate institution diversity
 */
function calculateInstitutionDiversity(loans) {
  const institutions = new Set();
  
  loans.forEach(loan => {
    if (loan.lenderId) {
      institutions.add(loan.lenderId);
    }
  });

  const count = institutions.size;
  
  // More institutions = diversity (max 5)
  return Math.min(100, Math.round((count / 5) * 100));
}

/**
 * Calculate months of history
 */
function calculateMonthsOfHistory(repayments) {
  if (repayments.length === 0) return 0;

  const oldestDate = new Date(repayments[repayments.length - 1].scheduledDate);
  const now = new Date();
  
  const diffTime = Math.abs(now - oldestDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.ceil(diffDays / 30);
}

/**
 * Calculate weighted total score
 */
function calculateWeightedScore(components) {
  let total = 0;

  total += (components.repaymentConsistency / 100) * WEIGHTS.repaymentConsistency;
  total += (components.repaymentHistoryDepth / 100) * WEIGHTS.repaymentHistoryDepth;
  total += (components.creditUtilization / 100) * WEIGHTS.creditUtilization;
  total += (components.incomeStability / 100) * WEIGHTS.incomeStability;
  total += (components.institutionDiversity / 100) * WEIGHTS.institutionDiversity;
  total += (components.fraudDisputeRecord / 100) * WEIGHTS.fraudDisputeRecord;

  // Base score of 300
  return Math.round(300 + total);
}

/**
 * Determine risk tier
 */
function determineRiskTier(score) {
  if (score >= 800) return 'AAA';
  if (score >= 700) return 'AA';
  if (score >= 600) return 'A';
  if (score >= 500) return 'B';
  if (score >= 400) return 'C';
  if (score >= 300) return 'D';
  return 'F';
}

/**
 * Update credit score after repayment
 */
const updateCreditScoreForRepayment = async (repayment) => {
  try {
    const userId = repayment.borrowerId;
    const creditScore = await CreditScore.findOne({ where: { userId } });

    if (!creditScore) {
      return await calculateCreditScore(userId);
    }

    // Get repayment stats
    const repayments = await Repayment.findAll({
      where: { borrowerId: userId }
    });

    // Quick update based on single repayment
    if (repayment.status === 'completed') {
      creditScore.totalRepaymentCount += 1;
      
      if (!repayment.isLate) {
        creditScore.onTimeRepaymentCount += 1;
      } else {
        creditScore.lateRepaymentCount += 1;
      }
    } else if (repayment.status === 'failed') {
      creditScore.missedRepaymentCount += 1;
    }

    // Recalculate full score for accuracy
    const result = await calculateCreditScore(userId, true);

    return result;
  } catch (error) {
    logger.error('Failed to update credit score for repayment:', error);
  }
};

module.exports = {
  calculateCreditScore,
  updateCreditScoreForRepayment,
  calculateRepaymentConsistency,
  calculateHistoryDepth,
  calculateCreditUtilization,
  calculateInstitutionDiversity
};
