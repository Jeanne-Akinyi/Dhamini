const { CreditScore, User } = require('../models');
const { success } = require('../utils/response.util');
const { AppError, asyncHandler } = require('../middleware/authHandler');
const { calculateCreditScore } = require('../services/credit-scoring.service');
const logger = require('../utils/logger.util');

/**
 * Get credit score for current user
 */
const getMyCreditScore = asyncHandler(async (req, res) => {
  const userId = req.userId;

  let creditScore = await CreditScore.findOne({
    where: { userId },
    include: [
      { 
        model: User, 
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'phoneNumber']
      }
    ]
  });

  if (!creditScore) {
    // Create initial credit score
    creditScore = await CreditScore.create({
      userId,
      dcsScore: 400,
      riskTier: 'D'
    });
  }

  return success(res, { creditScore });
});

/**
 * Get credit score by user ID (Admin/Lender only)
 */
const getUserCreditScore = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const creditScore = await CreditScore.findOne({
    where: { userId },
    include: [
      { 
        model: User, 
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'phoneNumber']
      }
    ]
  });

  if (!creditScore) {
    throw new AppError('Credit score not found for this user', 404);
  }

  return success(res, { creditScore });
});

/**
 * Update credit score manually (Admin/System only)
 */
const updateCreditScore = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { 
    repaymentConsistency,
    repaymentHistoryDepth,
    creditUtilization,
    incomeStability,
    institutionDiversity,
    fraudDisputeRecord,
    notes
  } = req.body;

  let creditScore = await CreditScore.findOne({ where: { userId } });

  if (!creditScore) {
    creditScore = await CreditScore.create({ userId });
  }

  // Update individual components
  if (repaymentConsistency !== undefined) {
    creditScore.repaymentConsistency = repaymentConsistency;
  }
  if (repaymentHistoryDepth !== undefined) {
    creditScore.repaymentHistoryDepth = repaymentHistoryDepth;
  }
  if (creditUtilization !== undefined) {
    creditScore.creditUtilization = creditUtilization;
  }
  if (incomeStability !== undefined) {
    creditScore.incomeStability = incomeStability;
  }
  if (institutionDiversity !== undefined) {
    creditScore.institutionDiversity = institutionDiversity;
  }
  if (fraudDisputeRecord !== undefined) {
    creditScore.fraudDisputeRecord = fraudDisputeRecord;
  }

  // Recalculate total score
  const newScore = calculateCreditScore(creditScore);
  creditScore.dcsScore = newScore.total;
  creditScore.riskTier = newScore.tier;
  creditScore.lastScoreUpdate = new Date();
  creditScore.notes = notes;

  await creditScore.save();

  logger.info(`Credit score updated for user ${userId}: ${newScore.total} (${newScore.tier})`);

  return success(res, {
    message: 'Credit score updated successfully',
    creditScore
  });
});

/**
 * Force recalculate credit score (Admin/System only)
 */
const recalculateCreditScore = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const creditScore = await CreditScore.findOne({ where: { userId } });

  if (!creditScore) {
    throw new AppError('Credit score not found', 404);
  }

  // Full recalculation based on repayment history
  const newScore = await calculateCreditScore(creditScore, true);

  creditScore.dcsScore = newScore.total;
  creditScore.riskTier = newScore.tier;
  creditScore.lastScoreUpdate = new Date();

  // Add to history
  const historyEntry = {
    date: new Date().toISOString(),
    score: newScore.total,
    tier: newScore.tier,
    reason: 'Manual recalculation',
    components: {
      repaymentConsistency: creditScore.repaymentConsistency,
      repaymentHistoryDepth: creditScore.repaymentHistoryDepth,
      creditUtilization: creditScore.creditUtilization,
      incomeStability: creditScore.incomeStability,
      institutionDiversity: creditScore.institutionDiversity,
      fraudDisputeRecord: creditScore.fraudDisputeRecord
    }
  };

  creditScore.scoreHistory = creditScore.scoreHistory || [];
  creditScore.scoreHistory.push(historyEntry);

  await creditScore.save();

  // Log to blockchain
  // await logToBlockchain('credit_score_change', creditScore);

  logger.info(`Credit score recalculated for user ${userId}: ${newScore.total} (${newScore.tier})`);

  return success(res, {
    message: 'Credit score recalculated successfully',
    creditScore,
    newScore
  });
});

/**
 * Get credit score history
 */
const getCreditScoreHistory = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = 50 } = req.query;

  const creditScore = await CreditScore.findOne({ where: { userId } });

  if (!creditScore) {
    throw new AppError('Credit score not found', 404);
  }

  const history = (creditScore.scoreHistory || [])
    .slice(-parseInt(limit))
    .reverse();

  return success(res, { 
    history,
    currentScore: creditScore.dcsScore,
    currentTier: creditScore.riskTier
  });
});

/**
 * Get score statistics (Admin/Analytics only)
 */
const getScoreStatistics = asyncHandler(async (req, res) => {
  const { tier, startDate, endDate } = req.query;

  const where = {};
  if (tier) where.riskTier = tier;
  if (startDate && endDate) {
    where.lastScoreUpdate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const creditScores = await CreditScore.findAll({ where });

  const totalScores = creditScores.length;
  const averageScore = creditScores.reduce((sum, cs) => sum + cs.dcsScore, 0) / totalScores || 0;

  const tierCounts = {
    AAA: 0,
    AA: 0,
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0
  };

  creditScores.forEach(cs => {
    if (tierCounts[cs.riskTier] !== undefined) {
      tierCounts[cs.riskTier]++;
    }
  });

  const scoreDistribution = {
    '800-1000': 0,
    '700-799': 0,
    '600-699': 0,
    '500-599': 0,
    '400-499': 0,
    '300-399': 0,
    'below-300': 0
  };

  creditScores.forEach(cs => {
    const score = cs.dcsScore;
    if (score >= 800) scoreDistribution['800-1000']++;
    else if (score >= 700) scoreDistribution['700-799']++;
    else if (score >= 600) scoreDistribution['600-699']++;
    else if (score >= 500) scoreDistribution['500-599']++;
    else if (score >= 400) scoreDistribution['400-499']++;
    else if (score >= 300) scoreDistribution['300-399']++;
    else scoreDistribution['below-300']++;
  });

  return success(res, {
    totalScores,
    averageScore: Math.round(averageScore),
    tierDistribution: tierCounts,
    scoreDistribution,
    summary: {
      aaaCount: tierCounts.AAA,
      aaCount: tierCounts.AA + tierCounts.AAA,
      goodCredit: tierCounts.A + tierCounts.AA + tierCounts.AAA,
      totalBorrowers: totalScores
    }
  });
});

/**
 * Update CRB data
 */
const updateCRBData = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { crbStatus, crbScore, creditEvents } = req.body;

  let creditScore = await CreditScore.findOne({ where: { userId } });

  if (!creditScore) {
    throw new AppError('Credit score not found', 404);
  }

  creditScore.crbStatus = crbStatus || creditScore.crbStatus;
  if (crbScore) creditScore.crbScore = crbScore;
  if (creditEvents) creditScore.creditEvents = creditEvents;
  creditScore.crbLastUpdated = new Date();

  await creditScore.save();

  logger.info(`CRB data updated for user ${userId}`);

  return success(res, {
    message: 'CRB data updated successfully',
    creditScore
  });
});

module.exports = {
  getMyCreditScore,
  getUserCreditScore,
  updateCreditScore,
  recalculateCreditScore,
  getCreditScoreHistory,
  getScoreStatistics,
  updateCRBData
};
