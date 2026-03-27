const { Repayment, Loan, Mandate, User, Institution, CreditScore } = require('../models');
const { success } = require('../utils/response.util');
const { AppError, asyncHandler } = require('../middleware/authHandler');
const { generateReference } = require('../utils/reference.util');
const { processMpesaSTKPush, processBankDirectDebit, processMpesaStandingOrder } = require('../services/payment.service');
const { logToBlockchain } = require('../services/ledger-gateway.service');
const { updateCreditScoreForRepayment } = require('../services/credit-scoring.service');
const logger = require('../utils/logger.util');

/**
 * Get repayment by ID
 */
const getRepayment = asyncHandler(async (req, res) => {
  const { repaymentId } = req.params;
  const userId = req.userId;

  const repayment = await Repayment.findByPk(repaymentId, {
    include: [
      { 
        model: Loan, 
        as: 'loan',
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
          }
        ]
      },
      { 
        model: Mandate, 
        as: 'mandate'
      }
    ]
  });

  if (!repayment) {
    throw new AppError('Repayment not found', 404);
  }

  // Check permission
  if (req.userRole === 'borrower' && repayment.borrowerId !== userId) {
    throw new AppError('Access denied', 403);
  }

  return success(res, { repayment });
});

/**
 * Get loan repayments
 */
const getLoanRepayments = asyncHandler(async (req, res) => {
  const { loanId } = req.params;
  const { status, limit = 50, offset = 0 } = req.query;

  // Verify loan exists and user has access
  const loan = await Loan.findByPk(loanId);
  if (!loan) {
    throw new AppError('Loan not found', 404);
  }

  if (req.userRole === 'borrower' && loan.borrowerId !== req.userId) {
    throw new AppError('Access denied', 403);
  }

  const where = { loanId };
  if (status) where.status = status;

  const repayments = await Repayment.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['scheduledDate', 'ASC']]
  });

  return success(res, {
    repayments: repayments.rows,
    total: repayments.count,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

/**
 * Get borrower repayments
 */
const getBorrowerRepayments = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { status, limit = 50, offset = 0 } = req.query;

  const where = { borrowerId: userId };
  if (status) where.status = status;

  const repayments = await Repayment.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['scheduledDate', 'DESC']],
    include: [
      { 
        model: Loan, 
        as: 'loan',
        attributes: ['id', 'loanReference', 'lenderId']
      }
    ]
  });

  return success(res, {
    repayments: repayments.rows,
    total: repayments.count,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

/**
 * Process scheduled repayment (system/scheduler)
 */
const processScheduledRepayment = asyncHandler(async (req, res) => {
  const { repaymentId } = req.params;

  const repayment = await Repayment.findByPk(repaymentId, {
    include: [
      { model: Loan, as: 'loan' },
      { model: Mandate, as: 'mandate' }
    ]
  });

  if (!repayment) {
    throw new AppError('Repayment not found', 404);
  }

  if (repayment.status !== 'pending') {
    throw new AppError('Repayment already processed', 400);
  }

  repayment.status = 'processing';
  repayment.initiatedBy = 'scheduler';
  repayment.deductionAttempted = true;
  repayment.deductionAttemptedAt = new Date();
  await repayment.save();

  let result;

  // Process payment based on mandate type
  if (repayment.mandate) {
    switch (repayment.mandate.mandateType) {
      case 'mpesa_stk_push':
        result = await processMpesaSTKPush(repayment, repayment.mandate);
        break;
      case 'bank_direct_debit':
        result = await processBankDirectDebit(repayment, repayment.mandate);
        break;
      case 'mpesa_standing_order':
        result = await processMpesaStandingOrder(repayment, repayment.mandate);
        break;
      default:
        throw new AppError(`Unsupported mandate type: ${repayment.mandate.mandateType}`, 400);
    }
  } else {
    throw new AppError('No mandate found for this repayment', 400);
  }

  return success(res, {
    message: 'Repayment process initiated',
    repayment,
    result
  });
});

/**
 * Handle M-Pesa callback
 */
const handleMpesaCallback = asyncHandler(async (req, res) => {
  const { 
    MerchantRequestID, 
    CheckoutRequestID, 
    ResultCode, 
    ResultDesc,
    Amount,
    MpesaReceiptNumber,
    TransactionDate,
    PhoneNumber 
  } = req.body.Body.stkCallback;

  const repayment = await Repayment.findOne({
    where: { mpesaMerchantRequestID: MerchantRequestID },
    include: [
      { model: Loan, as: 'loan' },
      { model: Mandate, as: 'mandate' }
    ]
  });

  if (!repayment) {
    throw new AppError('Repayment not found for this transaction', 404);
  }

  if (ResultCode === '0') {
    // Success
    repayment.status = 'completed';
    repayment.amountPaid = Amount;
    repayment.paymentReceived = true;
    repayment.paymentReceivedAt = new Date();
    repayment.reconciled = true;
    repayment.reconciledAt = new Date();
    repayment.mpesaCheckoutRequestID = CheckoutRequestID;
    repayment.actualPaymentDate = new Date();
    repayment.paymentReference = MpesaReceiptNumber;
    repayment.daysLate = repayment.daysLate || 0;
    repayment.isLate = repayment.daysLate > 0;
    repayment.merchantRequestId = MerchantRequestID;

    await repayment.save();

    // Update loan balances
    await updateLoanBalances(repayment);

    // Update mandate
    if (repayment.mandate) {
      repayment.mandate.completedDeductions += 1;
      repayment.mandate.amountDeducted += parseFloat(Amount);
      repayment.mandate.lastDeductionDate = new Date();
      await repayment.mandate.save();
    }

    // Log to blockchain
    await logToBlockchain('repayment', repayment);

    // Update credit score
    await updateCreditScoreForRepayment(repayment);

    logger.info(`Repayment ${repayment.repaymentReference} completed successfully`);
  } else {
    // Failed
    repayment.status = 'failed';
    repayment.failureReason = ResultDesc;
    repayment.mpesaResultCode = ResultCode;
    repayment.mpesaResultDesc = ResultDesc;
    repayment.merchantRequestId = MerchantRequestID;

    await repayment.save();

    // Update mandate
    if (repayment.mandate) {
      repayment.mandate.failedDeductions += 1;
      await repayment.mandate.save();
    }

    // Schedule retry if retries remaining
    if (repayment.retryCount < repayment.maxRetries) {
      await scheduleRetry(repayment);
    }

    logger.warn(`Repayment ${repayment.repaymentReference} failed: ${ResultDesc}`);
  }

  return success(res, {
    message: 'Callback processed successfully',
    repaymentId: repayment.id,
    status: repayment.status
  });
});

/**
 * Manual payment (cash/bank transfer)
 */
const recordManualPayment = asyncHandler(async (req, res) => {
  const { repaymentId } = req.params;
  const { amount, paymentMethod, paymentReference, notes } = req.body;

  const repayment = await Repayment.findByPk(repaymentId, {
    include: [{ model: Loan, as: 'loan' }]
  });

  if (!repayment) {
    throw new AppError('Repayment not found', 404);
  }

  if (repayment.status === 'completed') {
    throw new AppError('Repayment already completed', 400);
  }

  repayment.status = 'completed';
  repayment.amountPaid = amount || repayment.totalAmount;
  repayment.paymentMethod = paymentMethod || 'cash';
  repayment.paymentReference = paymentReference;
  repayment.actualPaymentDate = new Date();
  repayment.reconciled = true;
  repayment.reconciledAt = new Date();
  repayment.initiatedBy = 'manual';
  repayment.daysLate = repayment.daysLate || 0;
  repayment.isLate = repayment.daysLate > 0;

  await repayment.save();

  // Update loan balances
  await updateLoanBalances(repayment);

  // Log to blockchain
  await logToBlockchain('repayment', repayment);

  // Update credit score
  await updateCreditScoreForRepayment(repayment);

  logger.info(`Manual payment recorded for repayment ${repayment.repaymentReference}`);

  return success(res, {
    message: 'Payment recorded successfully',
    repayment
  });
});

/**
 * Retry failed repayment
 */
const retryRepayment = asyncHandler(async (req, res) => {
  const { repaymentId } = req.params;

  const repayment = await Repayment.findByPk(repaymentId, {
    include: [
      { model: Loan, as: 'loan' },
      { model: Mandate, as: 'mandate' }
    ]
  });

  if (!repayment) {
    throw new AppError('Repayment not found', 404);
  }

  if (repayment.status !== 'failed') {
    throw new AppError('Only failed repayments can be retried', 400);
  }

  if (repayment.retryCount >= repayment.maxRetries) {
    throw new AppError('Maximum retry attempts reached', 400);
  }

  repayment.status = 'pending';
  repayment.retryCount += 1;
  repayment.failureReason = null;
  await repayment.save();

  // Trigger processing again
  await processScheduledRepayment({ params: { repaymentId } }, res);

  return success(res, {
    message: 'Repayment retry initiated',
    repayment
  });
});

/**
 * Helper functions
 */
async function updateLoanBalances(repayment) {
  const loan = repayment.loan;
  const principalPayment = repayment.principalAmount;
  const interestPayment = repayment.interestAmount;

  loan.principalRepaid = parseFloat(loan.principalRepaid || 0) + parseFloat(principalPayment);
  loan.interestRepaid = parseFloat(loan.interestRepaid || 0) + parseFloat(interestPayment);
  loan.totalRepaid = parseFloat(loan.totalRepaid || 0) + parseFloat(repayment.amountPaid);
  loan.outstandingBalance = parseFloat(loan.totalAmount) - parseFloat(loan.totalRepaid);

  if (loan.outstandingBalance <= 0) {
    loan.status = 'completed';
  }

  await loan.save();
}

async function scheduleRetry(repayment) {
  const retryDelay = [24, 48, 168]; // 1 day, 2 days, 7 days
  const delayHours = retryDelay[repayment.retryCount] || 24;

  const nextRetryDate = new Date();
  nextRetryDate.setHours(nextRetryDate.getHours() + delayHours);

  repayment.nextRetryDate = nextRetryDate;
  await repayment.save();

  // In production, would schedule a job here
  logger.info(`Retry scheduled for repayment ${repayment.repaymentReference} at ${nextRetryDate}`);
}

module.exports = {
  getRepayment,
  getLoanRepayments,
  getBorrowerRepayments,
  processScheduledRepayment,
  handleMpesaCallback,
  recordManualPayment,
  retryRepayment
};
