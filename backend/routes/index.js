const express = require('express');
const router = express.Router();

// Controllers
const authController = require('../controllers/auth.controller');
const kycController = require('../controllers/kyc.controller');
const loanController = require('../controllers/loan.controller');
const repaymentController = require('../controllers/repayment.controller');
const creditScoreController = require('../controllers/creditScore.controller');

// Middleware
const { authenticate } = require('../middleware/authMiddleware');

// ==================== AUTH ROUTES ====================
router.post('/auth/register', authController.register);
router.post('/auth/verify-phone', authController.verifyPhone);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.post('/auth/refresh-token', authController.refreshToken);

// Protected auth routes
router.get('/auth/profile', authenticate, authController.getProfile);
router.put('/auth/profile', authenticate, authController.updateProfile);

// ==================== KYC ROUTES ====================
router.get('/kyc', authenticate, kycController.getKYCStatus);

// KYC Submission Routes (Borrower)
router.post('/kyc/tier1', authenticate, kycController.submitTier1KYC);
router.post('/kyc/tier2', authenticate, kycController.submitTier2KYC);
router.post('/kyc/tier3', authenticate, kycController.submitTier3KYC);

// KYC Admin Routes
router.get('/kyc/pending', authenticate, kycController.getPendingKYCs);
router.post('/kyc/:kycId/approve', authenticate, kycController.approveKYC);
router.post('/kyc/:kycId/reject', authenticate, kycController.rejectKYC);
router.get('/kyc/institution', authenticate, kycController.getInstitutionKYCs);

// ==================== LOAN ROUTES ====================
// Borrower Routes
router.post('/loans', authenticate, loanController.createLoan);
router.get('/loans/my', authenticate, loanController.getBorrowerLoans);
router.get('/loans/:loanId', authenticate, loanController.getLoan);
router.post('/loans/:loanId/mandate', authenticate, loanController.createMandate);
router.post('/mandates/:mandateId/verify', authenticate, loanController.verifyMandate);
router.post('/loans/:loanId/cancel', authenticate, loanController.cancelLoan);

// Lender Routes
router.get('/lender/loans', authenticate, loanController.getLenderLoans);
router.post('/lender/loans/:loanId/approve', authenticate, loanController.approveLoan);
router.post('/lender/loans/:loanId/disburse', authenticate, loanController.disburseLoan);

// ==================== REPAYMENT ROUTES ====================
// Get Repayments
router.get('/repayments/:repaymentId', authenticate, repaymentController.getRepayment);
router.get('/loans/:loanId/repayments', authenticate, repaymentController.getLoanRepayments);
router.get('/repayments/my', authenticate, repaymentController.getBorrowerRepayments);

// Payment Processing
router.post('/repayments/:repaymentId/process', authenticate, repaymentController.processScheduledRepayment);
router.post('/repayments/:repaymentId/retry', authenticate, repaymentController.retryRepayment);
router.post('/repayments/:repaymentId/manual', authenticate, repaymentController.recordManualPayment);

// M-Pesa Callback (public endpoint)
router.post('/repayments/mpesa/callback', repaymentController.handleMpesaCallback);

// ==================== CREDIT SCORE ROUTES ====================
// User Routes
router.get('/credit-score/me', authenticate, creditScoreController.getMyCreditScore);
router.get('/credit-score/:userId/history', authenticate, creditScoreController.getCreditScoreHistory);

// Admin/Lender Routes
router.get('/credit-score/users/:userId', authenticate, creditScoreController.getUserCreditScore);
router.put('/credit-score/users/:userId', authenticate, creditScoreController.updateCreditScore);
router.post('/credit-score/users/:userId/recalculate', authenticate, creditScoreController.recalculateCreditScore);
router.put('/credit-score/users/:userId/crb', authenticate, creditScoreController.updateCRBData);

// Statistics (Admin/Analytics)
router.get('/credit-score/statistics', authenticate, creditScoreController.getScoreStatistics);

// ==================== HEALTH AND INFO ====================
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Dhamini API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

router.get('/', (req, res) => {
  res.json({
    message: 'Dhamini API - Consent-based Loan Repayment and Credit Intelligence Platform',
    version: '1.0.0',
    documentation: {
      baseUrl: process.env.BASE_URL || 'http://localhost:4000',
      endpoints: {
        auth: {
          base: '/api/auth',
          methods: {
            register: 'POST /api/auth/register',
            verifyPhone: 'POST /api/auth/verify-phone',
            login: 'POST /api/auth/login',
            logout: 'POST /api/auth/logout',
            refreshToken: 'POST /api/auth/refresh-token',
            getProfile: 'GET /api/auth/profile',
            updateProfile: 'PUT /api/auth/profile'
          }
        },
        kyc: {
          base: '/api/kyc',
          methods: {
            getStatus: 'GET /api/kyc',
            submitTier1: 'POST /api/kyc/tier1',
            submitTier2: 'POST /api/kyc/tier2',
            submitTier3: 'POST /api/kyc/tier3',
            getPending: 'GET /api/kyc/pending',
            approve: 'POST /api/kyc/:kycId/approve',
            reject: 'POST /api/kyc/:kycId/reject',
            getInstitution: 'GET /api/kyc/institution'
          }
        },
        loans: {
          base: '/api/loans',
          methods: {
            create: 'POST /api/loans',
            getMine: 'GET /api/loans/my',
            getById: 'GET /api/loans/:loanId',
            createMandate: 'POST /api/loans/:loanId/mandate',
            verifyMandate: 'POST /api/mandates/:mandateId/verify',
            cancel: 'POST /api/loans/:loanId/cancel'
          }
        },
        lender: {
          base: '/api/lender',
          methods: {
            getLoans: 'GET /api/lender/loans',
            approveLoan: 'POST /api/lender/loans/:loanId/approve',
            disburseLoan: 'POST /api/lender/loans/:loanId/disburse'
          }
        },
        repayments: {
          base: '/api/repayments',
          methods: {
            getById: 'GET /api/repayments/:repaymentId',
            getByLoan: 'GET /api/loans/:loanId/repayments',
            getMine: 'GET /api/repayments/my',
            process: 'POST /api/repayments/:repaymentId/process',
            retry: 'POST /api/repayments/:repaymentId/retry',
            manualPayment: 'POST /api/repayments/:repaymentId/manual',
            mpesaCallback: 'POST /api/repayments/mpesa/callback'
          }
        },
        creditScore: {
          base: '/api/credit-score',
          methods: {
            getMine: 'GET /api/credit-score/me',
            getUserScore: 'GET /api/credit-score/users/:userId',
            history: 'GET /api/credit-score/:userId/history',
            update: 'PUT /api/credit-score/users/:userId',
            recalculate: 'POST /api/credit-score/users/:userId/recalculate',
            updateCRB: 'PUT /api/credit-score/users/:userId/crb',
            statistics: 'GET /api/credit-score/statistics'
          }
        }
      }
    }
  });
});

module.exports = router;
