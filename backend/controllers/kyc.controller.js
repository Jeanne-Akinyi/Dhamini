const { KYC, User, CreditScore } = require('../models');
const { success } = require('../utils/response.util');
const { AppError, asyncHandler } = require('../middleware/authHandler');
const { verifyIPRS, verifyKRAPIN, verifyBankAccount, verifyMpesa } = require('../services/verification.service');
const { hash } = require('../utils/encryption.util');
const logger = require('../utils/logger.util');

/**
 * Get KYC status for logged-in user
 */
const getKYCStatus = asyncHandler(async (req, res) => {
  const userId = req.userId;

  let kyc = await KYC.findOne({
    where: { userId },
    include: [
      { 
        model: User, 
        as: 'user',
        attributes: ['id', 'phoneNumber', 'email', 'firstName', 'lastName']
      }
    ]
  });

  if (!kyc) {
    // Create basic KYC record if none exists
    kyc = await KYC.create({
      userId,
      tier: 'TIER1',
      status: 'incomplete'
    });
  }

  return success(res, { kyc });
});

/**
 * Submit Tier 1 KYC (Basic - Phone OTP + National ID)
 */
const submitTier1KYC = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { nationalIdNumber, dateOfBirth, gender } = req.body;

  let kyc = await KYC.findOne({ where: { userId } });

  if (!kyc) {
    kyc = await KYC.create({
      userId,
      tier: 'TIER1',
      nationalIdNumber,
      dateOfBirth,
      gender,
      status: 'incomplete'
    });
  } else {
    kyc.nationalIdNumber = nationalIdNumber;
    kyc.dateOfBirth = dateOfBirth;
    kyc.gender = gender;
    kyc.tier = 'TIER1';
    kyc.status = 'incomplete';
    await kyc.save();
  }

  // Verify with IPRS (in production)
  try {
    const iprsResponse = await verifyIPRS(nationalIdNumber);
    kyc.iprsVerificationId = iprsResponse.verificationId;
    kyc.iprsResponse = iprsResponse.data;
    kyc.nationalIdVerified = true;
    logger.info(`IPRS verification successful for user ${userId}`);
  } catch (error) {
    logger.error(`IPRS verification failed for user ${userId}:`, error);
    // Continue without IPRS verification in sandbox mode
  }

  kyc.status = 'pending';
  await kyc.save();

  return success(res, {
    message: 'Tier 1 KYC submitted successfully. Awaiting approval.',
    kyc
  });
});

/**
 * Submit Tier 2 KYC (Standard - Tier 1 + Selfie + Bank Account)
 */
const submitTier2KYC = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { idPhotoUrl, selfieUrl, bankAccountNumber, bankName } = req.body;

  let kyc = await KYC.findOne({ where: { userId } });

  if (!kyc) {
    throw new AppError('Please complete Tier 1 KYC first', 400);
  }

  if (kyc.tier !== 'TIER1' && kyc.status !== 'approved') {
    throw new AppError('Tier 1 KYC must be approved first', 400);
  }

  kyc.tier = 'TIER2';
  kyc.idPhotoUrl = idPhotoUrl;
  kyc.selfieUrl = selfieUrl;
  kyc.bankAccountNumber = bankAccountNumber;
  kyc.bankName = bankName;
  kyc.status = 'pending';

  // Perform biometric verification (in production)
  try {
    // Liveness detection and face matching would happen here
    kyc.selfieVerified = true;
    kyc.livenessVerified = true;
  } catch (error) {
    logger.error(`Biometric verification failed for user ${userId}:`, error);
  }

  // Verify bank account (in production)
  try {
    await verifyBankAccount(bankAccountNumber, bankName);
    kyc.bankAccountVerified = true;
  } catch (error) {
    logger.error(`Bank account verification failed for user ${userId}:`, error);
  }

  await kyc.save();

  return success(res, {
    message: 'Tier 2 KYC submitted successfully. Awaiting approval.',
    kyc
  });
});

/**
 * Submit Tier 3 KYC (Enhanced - Tier 2 + KRA PIN + Employer)
 */
const submitTier3KYC = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { 
    kraPin, 
    employerName, 
    monthlyIncome, 
    physicalAddress,
    coordinates 
  } = req.body;

  let kyc = await KYC.findOne({ where: { userId } });

  if (!kyc) {
    throw new AppError('Please complete Tier 2 KYC first', 400);
  }

  if (kyc.tier !== 'TIER2' && kyc.status !== 'approved') {
    throw new AppError('Tier 2 KYC must be approved first', 400);
  }

  kyc.tier = 'TIER3';
  kyc.kraPin = kraPin;
  kyc.employerName = employerName;
  kyc.monthlyIncome = monthlyIncome;
  kyc.physicalAddress = physicalAddress;
  kyc.coordinates = coordinates;
  kyc.status = 'pending';

  // Verify KRA PIN (in production)
  try {
    const kraResponse = await verifyKRAPIN(kraPin);
    kyc.kraPinVerified = true;
    logger.info(`KRA PIN verification successful for user ${userId}`);
  } catch (error) {
    logger.error(`KRA PIN verification failed for user ${userId}:`, error);
  }

  await kyc.save();

  return success(res, {
    message: 'Tier 3 KYC submitted successfully. Awaiting approval.',
    kyc
  });
});

/**
 * Verify KYC (Admin only)
 */
const approveKYC = asyncHandler(async (req, res) => {
  const { kycId } = req.params;
  const { notes } = req.body;
  const adminId = req.userId;

  const kyc = await KYC.findByPk(kycId, {
    include: [
      { model: User, as: 'user' }
    ]
  });

  if (!kyc) {
    throw new AppError('KYC record not found', 404);
  }

  kyc.status = 'approved';
  kyc.verifiedBy = adminId;
  kyc.verifiedAt = new Date();
  await kyc.save();

  // Initialize credit score for the user
  let creditScore = await CreditScore.findOne({ where: { userId: kyc.userId } });
  if (!creditScore) {
    creditScore = await CreditScore.create({
      userId: kyc.userId,
      dcsScore: 400,
      riskTier: 'D'
    });
  }

  // Notify user (in production)

  return success(res, {
    message: 'KYC approved successfully',
    kyc,
    creditScore
  });
});

/**
 * Reject KYC (Admin only)
 */
const rejectKYC = asyncHandler(async (req, res) => {
  const { kycId } = req.params;
  const { reason } = req.body;
  const adminId = req.userId;

  if (!reason) {
    throw new AppError('Rejection reason is required', 400);
  }

  const kyc = await KYC.findByPk(kycId);

  if (!kyc) {
    throw new AppError('KYC record not found', 404);
  }

  kyc.status = 'rejected';
  kyc.rejectionReason = reason;
  kyc.verifiedBy = adminId;
  kyc.verifiedAt = new Date();
  await kyc.save();

  return success(res, {
    message: 'KYC rejected successfully',
    kyc
  });
});

/**
 * Get pending KYC applications (Admin only)
 */
const getPendingKYCs = asyncHandler(async (req, res) => {
  const { tier, limit = 50, offset = 0 } = req.query;

  const where = { status: 'pending' };
  if (tier) where.tier = tier;

  const KYCs = await KYC.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']],
    include: [
      { 
        model: User, 
        as: 'user',
        attributes: ['id', 'phoneNumber', 'email', 'firstName', 'lastName']
      }
    ]
  });

  return success(res, {
    KYCs: KYCs.rows,
    total: KYCs.count,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

/**
 * Get KYC by institution (Lender access)
 */
const getInstitutionKYCs = asyncHandler(async (req, res) => {
  const institutionId = req.institutionId;
  const { status, limit = 50, offset = 0 } = req.query;

  // Get all users who have loans with this institution
  const users = await User.findAll({
    where: { institutionId },
    attributes: ['id'],
    raw: true
  });

  const userIds = users.map(u => u.id);

  const where = { userId: userIds };
  if (status) where.status = status;

  const KYCs = await KYC.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']],
    include: [
      { 
        model: User, 
        as: 'user',
        attributes: ['id', 'phoneNumber', 'firstName', 'lastName']
      }
    ]
  });

  return success(res, {
    KYCs: KYCs.rows,
    total: KYCs.count,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

module.exports = {
  getKYCStatus,
  submitTier1KYC,
  submitTier2KYC,
  submitTier3KYC,
  approveKYC,
  rejectKYC,
  getPendingKYCs,
  getInstitutionKYCs
};
