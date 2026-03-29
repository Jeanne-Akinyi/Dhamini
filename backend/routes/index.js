const express = require('express');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         phoneNumber:
 *           type: string
 *         role:
 *           type: string
 *           enum: [borrower, lender, admin, sacco_admin, chama_admin, field_agent, regulator]
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended, pending]
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *     AuthRequest:
 *       type: object
 *       required:
 *         - phoneNumber
 *         - password
 *       properties:
 *         phoneNumber:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - phoneNumber
 *         - password
 *       properties:
 *         phoneNumber:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 */

// Controllers
const authController = require('../controllers/auth.controller');
const kycController = require('../controllers/kyc.controller');
const loanController = require('../controllers/loan.controller');
const repaymentController = require('../controllers/repayment.controller');
const creditScoreController = require('../controllers/creditScore.controller');
const mpesaController = require('../controllers/mpesa.controller');

// Middleware
const { authenticate } = require('../middleware/auth.middleware');

// ==================== AUTH ROUTES ====================
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: User already exists
 */
router.post('/auth/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/auth/login', authController.login);
router.post('/auth/verify-phone', authController.verifyPhone);
router.post('/auth/logout', authController.logout);
router.post('/auth/refresh-token', authController.refreshToken);

// Protected auth routes
/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
router.get('/auth/profile', authenticate, authController.getProfile);
router.put('/auth/profile', authenticate, authController.updateProfile);

// ==================== KYC ROUTES ====================
/**
 * @swagger
 * /api/kyc:
 *   get:
 *     summary: Get KYC status for current user
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KYC status
 */
router.get('/kyc', authenticate, kycController.getKYCStatus);

/**
 * @swagger
 * /api/kyc/tier1:
 *   post:
 *     summary: Submit Tier 1 KYC (Phone verification)
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: KYC submitted
 */
router.post('/kyc/tier1', authenticate, kycController.submitTier1KYC);

/**
 * @swagger
 * /api/kyc/tier2:
 *   post:
 *     summary: Submit Tier 2 KYC (Basic details)
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: KYC submitted
 */
router.post('/kyc/tier2', authenticate, kycController.submitTier2KYC);

/**
 * @swagger
 * /api/kyc/tier3:
 *   post:
 *     summary: Submit Tier 3 KYC (Full verification)
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: KYC submitted
 */
router.post('/kyc/tier3', authenticate, kycController.submitTier3KYC);

/**
 * @swagger
 * /api/kyc/pending:
 *   get:
 *     summary: Get pending KYC submissions
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending KYCs
 */
router.get('/kyc/pending', authenticate, kycController.getPendingKYCs);

/**
 * @swagger
 * /api/kyc/{kycId}/approve:
 *   post:
 *     summary: Approve a KYC submission
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kycId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: KYC approved
 */
router.post('/kyc/:kycId/approve', authenticate, kycController.approveKYC);

/**
 * @swagger
 * /api/kyc/{kycId}/reject:
 *   post:
 *     summary: Reject a KYC submission
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kycId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: KYC rejected
 */
router.post('/kyc/:kycId/reject', authenticate, kycController.rejectKYC);

/**
 * @swagger
 * /api/kyc/institution:
 *   get:
 *     summary: Get KYC submissions for institution
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of institution KYCs
 */
router.get('/kyc/institution', authenticate, kycController.getInstitutionKYCs);

// ==================== LOAN ROUTES ====================
/**
 * @swagger
 * /api/loans:
 *   post:
 *     summary: Create a new loan application
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Loan created
 */
router.post('/loans', authenticate, loanController.createLoan);

/**
 * @swagger
 * /api/loans/my:
 *   get:
 *     summary: Get current user's loans
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's loans
 */
router.get('/loans/my', authenticate, loanController.getBorrowerLoans);

/**
 * @swagger
 * /api/loans/{loanId}:
 *   get:
 *     summary: Get loan by ID
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Loan details
 */
router.get('/loans/:loanId', authenticate, loanController.getLoan);

/**
 * @swagger
 * /api/loans/{loanId}/mandate:
 *   post:
 *     summary: Create mandate for loan
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Mandate created
 */
router.post('/loans/:loanId/mandate', authenticate, loanController.createMandate);

/**
 * @swagger
 * /api/mandates/{mandateId}/verify:
 *   post:
 *     summary: Verify a mandate
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mandateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mandate verified
 */
router.post('/mandates/:mandateId/verify', authenticate, loanController.verifyMandate);

/**
 * @swagger
 * /api/loans/{loanId}/cancel:
 *   post:
 *     summary: Cancel a loan
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Loan cancelled
 */
router.post('/loans/:loanId/cancel', authenticate, loanController.cancelLoan);

// Lender Routes
/**
 * @swagger
 * /api/lender/loans:
 *   get:
 *     summary: Get all loans for lender
 *     tags: [Lender]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of lender's loans
 */
router.get('/lender/loans', authenticate, loanController.getLenderLoans);

/**
 * @swagger
 * /api/lender/loans/{loanId}/approve:
 *   post:
 *     summary: Approve a loan
 *     tags: [Lender]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Loan approved
 */
router.post('/lender/loans/:loanId/approve', authenticate, loanController.approveLoan);

/**
 * @swagger
 * /api/lender/loans/{loanId}/disburse:
 *   post:
 *     summary: Disburse a loan
 *     tags: [Lender]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Loan disbursed
 */
router.post('/lender/loans/:loanId/disburse', authenticate, loanController.disburseLoan);

// ==================== REPAYMENT ROUTES ====================
/**
 * @swagger
 * /api/repayments/{repaymentId}:
 *   get:
 *     summary: Get repayment by ID
 *     tags: [Repayments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: repaymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Repayment details
 */
router.get('/repayments/:repaymentId', authenticate, repaymentController.getRepayment);

/**
 * @swagger
 * /api/loans/{loanId}/repayments:
 *   get:
 *     summary: Get repayments for a loan
 *     tags: [Repayments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of loan repayments
 */
router.get('/loans/:loanId/repayments', authenticate, repaymentController.getLoanRepayments);

/**
 * @swagger
 * /api/repayments/my:
 *   get:
 *     summary: Get current user's repayments
 *     tags: [Repayments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's repayments
 */
router.get('/repayments/my', authenticate, repaymentController.getBorrowerRepayments);

/**
 * @swagger
 * /api/repayments/{repaymentId}/process:
 *   post:
 *     summary: Process a scheduled repayment
 *     tags: [Repayments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: repaymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Repayment processed
 */
router.post('/repayments/:repaymentId/process', authenticate, repaymentController.processScheduledRepayment);

/**
 * @swagger
 * /api/repayments/{repaymentId}/retry:
 *   post:
 *     summary: Retry a failed repayment
 *     tags: [Repayments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: repaymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Repayment retry initiated
 */
router.post('/repayments/:repaymentId/retry', authenticate, repaymentController.retryRepayment);

/**
 * @swagger
 * /api/repayments/{repaymentId}/manual:
 *   post:
 *     summary: Record a manual payment
 *     tags: [Repayments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: repaymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Manual payment recorded
 */
router.post('/repayments/:repaymentId/manual', authenticate, repaymentController.recordManualPayment);

/**
 * @swagger
 * /api/repayments/mpesa/callback:
 *   post:
 *     summary: M-Pesa payment callback
 *     tags: [Repayments]
 *     responses:
 *       200:
 *         description: Callback received
 */
router.post('/repayments/mpesa/callback', repaymentController.handleMpesaCallback);

// ==================== CREDIT SCORE ROUTES ====================
/**
 * @swagger
 * /api/credit-score/me:
 *   get:
 *     summary: Get current user's credit score
 *     tags: [Credit Score]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's credit score
 */
router.get('/credit-score/me', authenticate, creditScoreController.getMyCreditScore);

/**
 * @swagger
 * /api/credit-score/{userId}/history:
 *   get:
 *     summary: Get credit score history for a user
 *     tags: [Credit Score]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Credit score history
 */
router.get('/credit-score/:userId/history', authenticate, creditScoreController.getCreditScoreHistory);

/**
 * @swagger
 * /api/credit-score/users/{userId}:
 *   get:
 *     summary: Get user's credit score (Admin/Lender)
 *     tags: [Credit Score]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User's credit score
 */
router.get('/credit-score/users/:userId', authenticate, creditScoreController.getUserCreditScore);

/**
 * @swagger
 * /api/credit-score/users/{userId}:
 *   put:
 *     summary: Update user's credit score
 *     tags: [Credit Score]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Credit score updated
 */
router.put('/credit-score/users/:userId', authenticate, creditScoreController.updateCreditScore);

/**
 * @swagger
 * /api/credit-score/users/{userId}/recalculate:
 *   post:
 *     summary: Recalculate user's credit score
 *     tags: [Credit Score]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Credit score recalculated
 */
router.post('/credit-score/users/:userId/recalculate', authenticate, creditScoreController.recalculateCreditScore);

/**
 * @swagger
 * /api/credit-score/statistics:
 *   get:
 *     summary: Get credit score statistics
 *     tags: [Credit Score]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Credit score statistics
 */
router.get('/credit-score/statistics', authenticate, creditScoreController.getScoreStatistics);

// ==================== M-PESA ROUTES ====================
/**
 * @swagger
 * /api/mpesa/config:
 *   get:
 *     summary: Check M-Pesa configuration status
 *     tags: [M-Pesa]
 *     responses:
 *       200:
 *         description: Configuration status
 */
router.get('/mpesa/config', mpesaController.getConfig);

/**
 * @swagger
 * /api/mpesa/token:
 *   post:
 *     summary: Get M-Pesa access token
 *     tags: [M-Pesa]
 *     responses:
 *       200:
 *         description: Access token
 */
router.post('/mpesa/token', mpesaController.getAccessToken);

/**
 * @swagger
 * /api/mpesa/stkpush:
 *   post:
 *     summary: Initiate STK Push payment
 *     tags: [M-Pesa]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - amount
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Customer phone number
 *               amount:
 *                 type: number
 *                 description: Amount to collect
 *               accountReference:
 *                 type: string
 *                 description: Account reference
 *               transactionDesc:
 *                 type: string
 *                 description: Transaction description
 *     responses:
 *       200:
 *         description: STK Push initiated
 */
router.post('/mpesa/stkpush', mpesaController.initiateSTKPush);

/**
 * @swagger
 * /api/mpesa/stkquery:
 *   post:
 *     summary: Query STK Push status
 *     tags: [M-Pesa]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - checkoutRequestID
 *             properties:
 *               checkoutRequestID:
 *                 type: string
 *     responses:
 *       200:
 *         description: Query result
 */
router.post('/mpesa/stkquery', mpesaController.querySTKStatus);

/**
 * @swagger
 * /api/mpesa/b2c:
 *   post:
 *     summary: Initiate B2C payment (disbursement)
 *     tags: [M-Pesa]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - amount
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               amount:
 *                 type: number
 *               remarks:
 *                 type: string
 *               occasion:
 *                 type: string
 *     responses:
 *       200:
 *         description: B2C payment initiated
 */
router.post('/mpesa/b2c', mpesaController.initiateB2CPayment);

/**
 * @swagger
 * /api/mpesa/c2b-register:
 *   post:
 *     summary: Register C2B callback URLs
 *     tags: [M-Pesa]
 *     responses:
 *       200:
 *         description: URLs registered
 */
router.post('/mpesa/c2b-register', mpesaController.registerC2BURLs);

/**
 * @swagger
 * /api/mpesa/c2b-simulate:
 *   post:
 *     summary: Simulate C2B transaction (Sandbox only)
 *     tags: [M-Pesa]
 *     responses:
 *       200:
 *         description: Transaction simulated
 */
router.post('/mpesa/c2b-simulate', mpesaController.simulateC2B);

/**
 * @swagger
 * /api/mpesa/balance:
 *   post:
 *     summary: Query account balance
 *     tags: [M-Pesa]
 *     responses:
 *       200:
 *         description: Balance query result
 */
router.post('/mpesa/balance', mpesaController.queryAccountBalance);

/**
 * @swagger
 * /api/mpesa/transaction-status:
 *   post:
 *     summary: Query transaction status
 *     tags: [M-Pesa]
 *     responses:
 *       200:
 *         description: Transaction status
 */
router.post('/mpesa/transaction-status', mpesaController.queryTransactionStatus);

/**
 * @swagger
 * /api/mpesa/reversal:
 *   post:
 *     summary: Reverse a transaction
 *     tags: [M-Pesa]
 *     responses:
 *       200:
 *         description: Reversal initiated
 */
router.post('/mpesa/reversal', mpesaController.reverseTransaction);

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
        },
        mpesa: {
          base: '/api/mpesa',
          methods: {
            config: 'GET /api/mpesa/config',
            token: 'POST /api/mpesa/token',
            stkpush: 'POST /api/mpesa/stkpush',
            stkquery: 'POST /api/mpesa/stkquery',
            b2c: 'POST /api/mpesa/b2c',
            c2bRegister: 'POST /api/mpesa/c2b-register',
            c2bSimulate: 'POST /api/mpesa/c2b-simulate',
            balance: 'POST /api/mpesa/balance',
            transactionStatus: 'POST /api/mpesa/transaction-status',
            reversal: 'POST /api/mpesa/reversal'
          }
        }
      }
    }
  });
});

module.exports = router;
