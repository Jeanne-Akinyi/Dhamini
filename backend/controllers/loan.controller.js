const { Loan, Mandate, Repayment, User, Institution, CreditScore } = require('../models');
const { success } = require('../utils/response.util');
const { AppError, asyncHandler } = require('../middleware/authHandler');
const { generateReference } = require('../utils/reference.util');
const { scheduleRepayments } = require('../services/scheduler.service');
const logger = require('../utils/logger.util');

/**
 * Create a new loan application
 */
const createLoan = asyncHandler(async (req, res) => {
  const borrowerId = req.userId;
  const lenderId = req.institutionId || req.body.lenderId;
  const {
    loanAmount,
    interestRate,
    term,
    repaymentFrequency,
    firstRepaymentDate,
    purpose,
    security,
    autopayEnabled,
    bankAccountNumber,
    mpesaPhoneNumber
  } = req.body;

  // Verify lender exists
  const lender = await Institution.findByPk(lenderId);
  if (!lender) {
    throw new AppError('Lender institution not found', 404);
  }

  // Calculate loan details
  const interestAmount = (loanAmount * interestRate / 100 * term) / 12;
  const totalAmount = parseFloat(loanAmount) + parseFloat(interestAmount);

  // Calculate final repayment date
  const finalRepaymentDate = calculateFinalRepaymentDate(firstRepaymentDate, term, repaymentFrequency);

  // Create loan
  const loan = await Loan.create({
    loanReference: generateReference('LN'),
    borrowerId,
    lenderId,
    loanAmount,
    interestRate,
    interestAmount,
    totalAmount,
    term,
    repaymentFrequency,
    firstRepaymentDate,
    finalRepaymentDate,
    purpose,
    security,
    autopayEnabled: autopayEnabled !== false,
    bankAccountNumber,
    mpesaPhoneNumber,
    status: 'pending',
    outstandingBalance: totalAmount
  });

  logger.info(`Loan ${loan.loanReference} created for borrower ${borrowerId}`);

  return success(res, {
    message: 'Loan application submitted successfully',
    loan
  }, 201);
});

/**
 * Get loan by ID
 */
const getLoan = asyncHandler(async (req, res) => {
  const { loanId } = req.params;
  const userId = req.userId;

  const loan = await Loan.findByPk(loanId, {
    include: [
      { 
        model: User, 
        as: 'borrower',
        attributes: ['id', 'firstName', 'lastName', 'phoneNumber']
      },
      { 
        model: Institution, 
        as: 'lender',
        attributes: ['id', 'name', 'type']
      },
      { 
        model: Mandate, 
        as: 'mandate'
      },
      {
        model: Repayment,
        as: 'repayments',
        order: [['scheduledDate', 'ASC']]
      }
    ]
  });

  if (!loan) {
    throw new AppError('Loan not found', 404);
  }

  // Check permission
  const userRole = req.userRole;
  if (userRole === 'borrower' && loan.borrowerId !== userId) {
    throw new AppError('Access denied', 403);
  }

  return success(res, { loan });
});

/**
 * Get borrower loans
 */
const getBorrowerLoans = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { status, limit = 20, offset = 0 } = req.query;

  const where = { borrowerId: userId };
  if (status) where.status = status;

  const loans = await Loan.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']],
    include: [
      { 
        model: Institution, 
        as: 'lender',
        attributes: ['id', 'name', 'type']
      }
    ]
  });

  return success(res, {
    loans: loans.rows,
    total: loans.count,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

/**
 * Get lender loans
 */
const getLenderLoans = asyncHandler(async (req, res) => {
  const institutionId = req.institutionId;
  const { status, limit = 50, offset = 0 } = req.query;

  const where = { lenderId: institutionId };
  if (status) where.status = status;

  const loans = await Loan.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']],
    include: [
      { 
        model: User, 
        as: 'borrower',
        attributes: ['id', 'firstName', 'lastName', 'phoneNumber']
      }
    ]
  });

  return success(res, {
    loans: loans.rows,
    total: loans.count,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

/**
 * Approve loan (Lender only)
 */
const approveLoan = asyncHandler(async (req, res) => {
  const { loanId } = req.params;
  const lenderId = req.institutionId;
  const { disbursementDate, disbursementMethod } = req.body;

  const loan = await Loan.findOne({
    where: { id: loanId, lenderId }
  });

  if (!loan) {
    throw new AppError('Loan not found or access denied', 404);
  }

  loan.status = 'approved';
  loan.disbursementDate = disbursementDate;
  loan.disbursementMethod = disbursementMethod;
  await loan.save();

  logger.info(`Loan ${loan.loanReference} approved`);

  return success(res, {
    message: 'Loan approved successfully',
    loan
  });
});

/**
 * Disburse loan (Lender only)
 */
const disburseLoan = asyncHandler(async (req, res) => {
  const { loanId } = req.params;
  const lenderId = req.institutionId;

  const loan = await Loan.findOne({
    where: { id: loanId, lenderId },
    include: [{ model: User, as: 'borrower' }]
  });

  if (!loan) {
    throw new AppError('Loan not found or access denied', 404);
  }

  if (loan.status !== 'approved') {
    throw new AppError('Loan must be approved before disbursement', 400);
  }

  // Update loan status
  loan.status = 'disbursed';
  loan.disbursementDate = new Date();
  await loan.save();

  // Schedule repayments
  await scheduleRepayments(loan);

  // Update credit score
  await updateCreditScoreForNewLoan(loan.borrowerId);

  logger.info(`Loan ${loan.loanReference} disbursed`);

  return success(res, {
    message: 'Loan disbursed successfully',
    loan
  });
});

/**
 * Create mandate for loan
 */
const createMandate = asyncHandler(async (req, res) => {
  const { loanId } = req.params;
  const {
    mandateType,
    accountType,
    accountNumber,
    accountName,
    bankCode,
    mpesaPhoneNumber,
    deductionAmount,
    deductionDate,
    startDate,
    endDate,
    frequency,
    iprsConsent,
    creditScoringConsent,
    dataSharingConsent,
    digitalSignature
  } = req.body;

  const loan = await Loan.findByPk(loanId);
  if (!loan || loan.borrowerId !== req.userId) {
    throw new AppError('Loan not found or access denied', 404);
  }

  // Create mandate
  const mandate = await Mandate.create({
    mandateReference: generateReference('MD'),
    loanId,
    borrowerId: req.userId,
    mandateType,
    accountType,
    accountNumber,
    accountName,
    bankCode,
    mpesaPhoneNumber,
    deductionAmount,
    deductionDate,
    startDate: startDate || new Date(),
    endDate,
    frequency: frequency || 'monthly',
    totalDeductions: loan.term,
    status: 'pending_approval',
    iprsConsent: iprsConsent || false,
    creditScoringConsent: creditScoringConsent || false,
    dataSharingConsent,
    digitalSignature,
    otpVerified: false
  });

  logger.info(`Mandate ${mandate.mandateReference} created for loan ${loan.loanReference}`);

  return success(res, {
    message: 'Mandate created successfully',
    mandate
  }, 201);
});

/**
 * Verify mandate with OTP
 */
const verifyMandate = asyncHandler(async (req, res) => {
  const { mandateId } = req.params;
  const { otp } = req.body;

  const mandate = await Mandate.findByPk(mandateId, {
    include: [{ model: Loan, as: 'loan' }]
  });

  if (!mandate || mandate.borrowerId !== req.userId) {
    throw new AppError('Mandate not found or access denied', 404);
  }

  if (mandate.status !== 'pending_approval') {
    throw new AppError('Mandate is not in pending approval state', 400);
  }

  // Verify OTP (in production)
  // For MVP, we'll auto-verify
  const isValid = true; // await verifyOTP(mandate.borrowerId, otp);

  if (!isValid) {
    throw new AppError('Invalid OTP', 400);
  }

  mandate.otpVerified = true;
  mandate.otpVerifiedAt = new Date();
  mandate.status = 'active';
  await mandate.save();

  // Log to blockchain
  // await logMandateToBlockchain(mandate);

  // Update loan status if approved
  if (mandate.loan.status === 'pending') {
    mandate.loan.status = 'approved';
    await mandate.loan.save();
  }

  logger.info(`Mandate ${mandate.mandateReference} verified and activated`);

  return success(res, {
    message: 'Mandate verified successfully',
    mandate
  });
});

/**
 * Cancel loan
 */
const cancelLoan = asyncHandler(async (req, res) => {
  const { loanId } = req.params;
  const userId = req.userId;
  const { reason } = req.body;

  const loan = await Loan.findOne({
    where: { id: loanId, borrowerId: userId }
  });

  if (!loan) {
    throw new AppError('Loan not found or access denied', 404);
  }

  if (loan.status === 'disbursed' || loan.status === 'active') {
    throw new AppError('Cannot cancel a disbursed loan', 400);
  }

  loan.status = 'cancelled';
  loan.rejectionReason = reason;
  await loan.save();

  logger.info(`Loan ${loan.loanReference} cancelled`);

  return success(res, {
    message: 'Loan cancelled successfully',
    loan
  });
});

/**
 * Helper functions
 */
function calculateFinalRepaymentDate(startDate, termMonths, frequency) {
  const date = new Date(startDate);
  
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + (termMonths * 4 * 7));
      break;
    case 'biweekly':
      date.setDate(date.getDate() + (termMonths * 2 * 7));
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + termMonths);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + (termMonths * 3));
      break;
    default:
      date.setMonth(date.getMonth() + termMonths);
  }
  
  return date;
}

async function updateCreditScoreForNewLoan(userId) {
  const creditScore = await CreditScore.findOne({ where: { userId } });
  if (creditScore) {
    creditScore.totalLoans += 1;
    creditScore.activeLoans += 1;
    creditScore.totalLoanAmount = parseFloat(creditScore.totalLoanAmount || 0);
    await creditScore.save();
  }
}

module.exports = {
  createLoan,
  getLoan,
  getBorrowerLoans,
  getLenderLoans,
  approveLoan,
  disburseLoan,
  createMandate,
  verifyMandate,
  cancelLoan
};
