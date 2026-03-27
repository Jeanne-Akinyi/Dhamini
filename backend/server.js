const express = require("express");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/authHandler");
const { initializeDatabase, closeConnection } = require("./config/database.config");
const { initializeScheduler, stopScheduler } = require("./services/scheduler.service");
const routes = require("./routes");
const logger = require('./utils/logger.util');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Dhamini API",
    version: "1.0.0",
    description: "Consent-based Automated Loan Repayment & Credit Intelligence Platform",
    blockchain: "Hyperledger Fabric",
    timestamp: new Date().toISOString()
  });
});

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "Dhamini API - Consent-based Automated Loan Repayment & Credit Intelligence Platform",
    version: "1.0.0",
    blockchain: "Hyperledger Fabric",
    endpoints: {
      authentication: {
        base: "/api/auth",
        register: "POST /api/auth/register",
        verifyPhone: "POST /api/auth/verify-phone",
        verifyOTP: "POST /api/auth/verify-otp",
        login: "POST /api/auth/login",
        logout: "POST /api/auth/logout",
        refreshToken: "POST /api/auth/refresh-token",
        profile: "GET /api/auth/profile",
        updateProfile: "PUT /api/auth/profile"
      },
      kyc: {
        base: "/api/kyc",
        tier1: "POST /api/kyc/tier1",
        tier2: "POST /api/kyc/tier2",
        tier3: "POST /api/kyc/tier3",
        status: "GET /api/kyc/status",
        listAll: "GET /api/kyc/all (admin)",
        approveTier: "PUT /api/kyc/approve/:userId/:tier (admin)",
        rejectTier: "PUT /api/kyc/reject/:userId/:tier (admin)"
      },
      loans: {
        base: "/api/loans",
        create: "POST /api/loans",
        getAll: "GET /api/loans",
        getById: "GET /api/loans/:loanId",
        approve: "PUT /api/loans/:loanId/approve (lender)",
        disburse: "PUT /api/loans/:loanId/disburse (lender)",
        reject: "PUT /api/loans/:loanId/reject (lender)",
        myLoans: "GET /api/loans/my-loans"
      },
      mandates: {
        base: "/api/mandates",
        create: "POST /api/loans/:loanId/mandates",
        getById: "GET /api/mandates/:mandateId",
        verifyOTP: "POST /api/mandates/:mandateId/verify-otp",
        myMandates: "GET /api/mandates/my-mandates"
      },
      repayments: {
        base: "/api/repayments",
        process: "POST /api/repayments/process",
        retry: "POST /api/repayments/:repaymentId/retry",
        manual: "POST /api/repayments/manual",
        mpesaCallback: "POST /api/repayments/mpesa/callback",
        allRepayments: "GET /api/repayments",
        byLoan: "GET /api/repayments/loan/:loanId",
        byMandate: "GET /api/repayments/mandate/:mandateId"
      },
      creditScore: {
        base: "/api/credit-score",
        myScore: "GET /api/credit-score",
        userScore: "GET /api/credit-score/user/:userId",
        updateScore: "PUT /api/credit-score/:userId (admin)",
        history: "GET /api/credit-score/:userId/history",
        statistics: "GET /api/credit-score/statistics (admin)",
        crbCheck: "POST /api/credit-score/crb-check"
      },
      health: {
        healthCheck: "GET /health"
      }
    }
  });
});

// 404 handler (must be after all routes)
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  console.log(`
╔═════════════════════════════════════════════════════════════════╗
║                                                               ║
║         💎 DHAMINI API SERVER STARTED 💎                       ║
║                                                               ║
║    Consent-based Automated Loan Repayment &                  ║
║    Credit Intelligence Platform                                ║
║                                                               ║
║    Target Market: Kenya & East Africa                        ║
║    Blockchain: Hyperledger Fabric Network                    ║
║                                                               ║
║    ────────────────────────────────────────────────────────   ║
║                                                               ║
║    Server: http://localhost:${PORT}                            ║
║    Health: http://localhost:${PORT}/health                     ║
║    API Docs: http://localhost:${PORT}/api                      ║
║                                                               ║
║    Ready for:                                                  ║
║    • Bank-SACCO-Chama Integration                             ║
║    • M-Pesa STK Push + Bank Debits                            ║
║    • IPRS/KRA Identity Verification                           ║
║    • Automated Mandate Execution                              ║
║    • AI Credit Scoring (DCS)                                  ║
║                                                               ║
╚═════════════════════════════════════════════════════════════════╝
  `);

  // Initialize services
  try {
    await initializeDatabase();
    logger.info('✅ Database initialized successfully');
    await initializeScheduler();
    logger.info('✅ Scheduler initialized successfully');
    logger.info('🚀 Dhamini server ready to accept requests');
  } catch (error) {
    logger.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
});

module.exports = app;
