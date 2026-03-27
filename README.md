# Dhamini
Dhamini (Swahili for "Guarantee") is a middleware platform designed to automate loan repayments and create a unified credit scoring system for the Kenyan market.
# 🏦 Dhamini — Swahili for "Guarantee"

**Automated Loan Repayment & Credit Infrastructure Middleware**

Dhamini is a consent-based automated loan repayment and credit intelligence platform built for the East African financial market. We bridge the gap between Commercial Banks, SACCOs, Chamas, and Digital Lenders using a unified repayment and AI-driven credit scoring infrastructure.

---

## 🚀 The Problem
Lenders in Kenya face a 20–35% default rate and spend up to 30% of their budgets chasing payments. Meanwhile, borrowers pay high interest because their positive repayment history in SACCOs or Chamas is invisible to formal banks.

## ✨ Core Pillars
* **Consent-based Automated Deduction:** Automated repayment via M-Pesa Daraja, Bank APIs, and SACCO payroll systems.
* **Universal KYC Layer:** A single identity verification (IPRS/KRA) shared across institutions with borrower consent.
* **AI Credit Scoring (DCS):** A live score built from real repayment behavior across all platforms, not just CRB history.
* **Blockchain Audit Trail:** Every mandate and repayment is logged immutably on the Polygon network for transparency.

## 🛠️ Technical Stack
- **Backend:** Python (FastAPI), Node.js (Microservices), Apache Kafka
- **Frontend:** React (Web), React Native (Mobile), Africa's Talking (USSD)
- **Database:** PostgreSQL, TimescaleDB (Time-series), Redis
- **Blockchain:** Solidity Smart Contracts (Polygon PoS)
- **Payments:** M-Pesa Daraja API, PesaLink, Bank Open APIs

## 🏗️ System Architecture
Dhamini operates as a five-layer middleware system:
1. **Frontend:** Borrower portal, Lender dashboard, and Field agent app.
2. **API Gateway:** Auth, Universal KYC, and Consent management.
3. **Middleware Core:** Mandate engine, Deduction scheduler, and Payment adapters.
4. **AI Engine:** ML models for Credit Scoring and Salary Detection.
5. **External Integrations:** Safaricom Daraja, IPRS, KRA, and Commercial Banks.

## 📅 Hackathon Roadmap (Phase 1 MVP)
- [x] Backend API with Hyperledger Fabric integration
- [x] Database models and relationships
- [x] Authentication & authorization system
- [ ] M-Pesa STK Push mandate flow (in development)
- [ ] Digital Mandate hashing to Hyperledger Fabric network (in development)
- [ ] Automated repayment simulation via Daraja Sandbox (in development)
- [ ] Real-time DCS (Dhamini Credit Score) update (in development)
- [ ] Basic Lender & Borrower Dashboards (in development)

## 📁 Project Structure

```
dhamini/
├── backend/                    # Node.js API Server
│   ├── config/                # Configuration files
│   │   ├── database.config.js # PostgreSQL/Sequelize setup
│   │   ├── redis.config.js    # Redis caching layer
│   │   └── fabric.config.js   # Hyperledger Fabric network config
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.js      # User authentication
│   │   ├── kyc.controller.js       # KYC verification
│   │   ├── loan.controller.js      # Loan management
│   │   ├── repayment.controller.js # Payment processing
│   │   └── creditScore.controller.js # Credit scoring
│   ├── middleware/            # Express middleware
│   │   ├── auth.middleware.js      # JWT verification & authorization
│   │   └── authHandler.js           # Error handling
│   ├── models/                # Sequelize ORM models
│   │   ├── User.js           # User accounts & roles
│   │   ├── KYC.js            # Multi-tier KYC data
│   │   ├── Institution.js    # Lender profiles
│   │   ├── Loan.js           # Loan lifecycle
│   │   ├── Mandate.js        # Debit mandates
│   │   ├── Repayment.js      # Payment records
│   │   ├── CreditScore.js    # DCS scoring
│   │   ├── BlockchainRecord.js # Audit trails
│   │   └── index.js          # Model associations
│   ├── routes/               # API route definitions
│   │   └── index.js          # Consolidated routes
│   ├── services/             # Business logic layer
│   │   ├── jwt.service.js           # Token management
│   │   ├── otp.service.js           # OTP generation & SMS
│   │   ├── payment.service.js       # M-Pesa & bank payments
│   │   ├── scheduler.service.js     # Payment scheduling
│   │   ├── credit-scoring.service.js # DCS algorithm
│   │   ├── verification.service.js  # IPRS/KRA verification
│   │   └── ledger-gateway.service.js # Fabric integration
│   ├── utils/                # Utility functions
│   │   ├── logger.util.js    # Winston logging
│   │   ├── response.util.js  # Standardized responses
│   │   ├── encryption.util.js # AES-256 encryption
│   │   └── reference.util.js # Reference number generation
│   ├── scripts/              # Initialization scripts
│   │   ├── init-db.js        # Database setup
│   │   └── seed-data.js      # Test data generation
│   ├── tests/                # Test files (to be added)
│   ├── .env.example         # Environment template
│   ├── package.json          # Dependencies & scripts
│   └── server.js             # Express server entry point
│
├── frontend/                 # React Web Application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── api/              # API integration
│   │   │   └── api.js        # Axios client setup
│   │   ├── assets/           # Images, icons
│   │   └── components/       # React components (to be added)
│   ├── .gitignore
│   └── package.json
│
├── Docker/                   # Docker configurations (to be added)
├── Docs/                     # Documentation
│   └── PROJECT_STRUCTURE.md  # Detailed system specs
├── .gitignore
└── README.md                 # This file
```

## 🔧 How It Works

### User Flow

1. **Registration & Identity Verification**
   - User creates account with phone number
   - Receives OTP via SMS (Africa's Talking) for verification
   - Submits KYC documents tier by tier (TIER1: Basic, TIER2: IPRS/KRA, TIER3: Bank/M-Pesa)
   - Admin verifies KYC at each level

2. **Loan Application**
   - User selects lender institution (Bank, SACCO, Chama, Digital Lender)
   - Fills loan application with amount, term, repayment method
   - Lender reviews and approves loan request

3. **Mandate Signing (Consent)**
   - User receives mandate details via chosen method (M-Pesa STK Push, Bank Direct Debit, Standing Order)
   - User verifies and signs digital consent with OTP
   - Mandate hashed and recorded on Hyperledger Fabric network
   - Blockchain transaction logged with immutable timestamp

4. **Loan Disbursement**
   - Lender disburses funds to user's account
   - Loan marked as "active" in system
   - Repayment schedule generated

5. **Automated Repayments**
   - Scheduler runs daily at 6 AM Kenya time
   - For each active mandate:
     - Deducts scheduled amount from user's source (M-Pesa wallet/bank)
     - Processes payment via M-Pesa Daraja or Bank API
     - Records transaction in Repayment model
     - Logs transaction on blockchain for audit trail
   - On failure: retries up to 3 times, notifies lender and user

6. **Credit Score Updates**
   - Each successful repayment updates Dhamini Credit Score (DCS)
   - Score calculated from six weighted components:
     - Repayment Consistency (35%)
     - Repayment History Depth (20%)
     - Credit Utilization (15%)
     - Income Stability (15%)
     - Institution Diversity (10%)
     - Fraud/Dispute Record (5%)
   - Risk tier assigned: AAA, AA, A, BBB, BB, B, CCC, CC, C, D (300-1000 range)
   - Score change logged on blockchain for transparency

### Lender Flow

1. **Registration**
   - Institution registers as lender
   - Specifies type: Commercial Bank, SACCO, Chama, MFI, Digital Lender
   - Configures payment methods (M-Pesa, Bank API, Payroll)

2. **Loan Management**
   - Reviews loan applications
   - Approves or rejects based on credit score and risk assessment
   - Disburses approved loans
   - Monitors repayment progress

3. **Credit Assessment**
   - Views borrower's DCS score and history
   - Checks CRB status via API
   - Analyzes repayment patterns across all institutions

### System Operations

- **Cron Scheduler**: Runs daily at 6 AM for repayments, 10 PM for salary detection
- **Redis Caching**: Stores OTP tokens, session data, frequently accessed scores
- **Hyperledger Fabric**: Provides immutable audit trail for all mandates and repayments
- **PostgreSQL**: Primary database with connection pooling (5-20 connections)
- **Winston Logger**: Tracks all operations with file rotation

## ✨ Key Features

### 1. Multi-tier KYC System
- **TIER 1**: Full name, phone, national ID, date of birth, gender (self-verified)
- **TIER 2**: KRA PIN verified with IPRS and KRA APIs, income source
- **TIER 3**: Bank account ownership & M-Pesa wallet verified
- **TIER 4**: Biometric liveness, face matching, employer contact, employment proof

### 2. Consent-based Digital Mandates
- Multiple payment methods: M-Pesa STK Push, Bank Direct Debit, Standing Order
- OTP-verified digital signatures
- Flexible scheduling (daily, weekly, bi-weekly, monthly)
- Max deduction limits configurable per mandate
- Blockchain hash for immutability

### 3. Automated Payment Processing
- Daily cron job processes scheduled repayments
- M-Pesa STK Push for mobile money deductions
- Bank APIs for direct debit transactions
- Standing order integration via bank systems
- Automatic retry on failure (up to 3 attempts)
- Notifications sent to lender and borrower

### 4. AI Credit Scoring (DCS)
- Dynamic scoring adapts to real-time repayment behavior
- Weights: Consistency (35%), History (20%), Utilization (15%), Income (15%), Diversity (10%), Fraud (5%)
- Risk tiers from AAA (excellent) to F (poor) with 300-1000 score range
- Immediate score updates after each repayment
- Score history tracking for trend analysis

### 5. Role-Based Access Control
- **Borrower**: Access own loans, KYC status, credit score, repayments
- **Lender**: Manage loans, approve applications, view repayment reports
- **SACCO Admin**: Manage SACCO loans and members
- **Chama Admin**: Manage Chama loans and members
- **Admin**: Full system access, KYC approvals, institution management

### 6. Hyperledger Fabric Integration
- Channel: dhaminichannel
- Chaincode: dhaminicontract
- Records mandates, repayments, credit score changes
- Hash-based verification of data integrity
- Immutable audit trail for regulatory compliance

### 7. Multi-Institution Support
- Commercial Banks
- SACCOs (Savings & Credit Cooperative Organizations)
- Chamas (Informal investment groups)
- Microfinance Institutions (MFIs)
- Digital Lenders

### 8. Payment Versatility
- M-Pesa Daraja API (STK Push, C2B, B2C)
- Bank Open APIs (PesaLink compatible)
- Payroll deduction systems
- Standing orders
- Cash payments via M-Pesa agents

### 9. External API Integration
- **IPRS**: National ID verification
- **KRA**: Tax compliance & PIN validation
- **Africa's Talking**: SMS gateway for OTP
- **M-Pesa Daraja**: Mobile money payments
- **CRB**: Credit bureau checks (optional)

### 10. Security Features
- AES-256 encryption for sensitive data at rest
- SHA-256 hashing for passwords and blockchain references
- JWT-based authentication with refresh tokens
- Rate limiting on OTP endpoint (5 attempts/hour)
- Input validation on all API endpoints

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Hyperledger Fabric network (or use development mode)

### Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. Initialize database:
```bash
npm run init-db
```

4. Seed test data (optional):
```bash
node scripts/seed-data.js
```

5. Start server:
```bash
npm start       # Production
npm run dev     # Development with auto-reload
```

6. Access API:
- Health check: http://localhost:4000/health
- API documentation: http://localhost:4000/api

### Frontend Setup (Coming Soon)
```bash
cd frontend
npm install
npm run dev
```

---

**Authors:** 
Humphrey Maina- Backend/ Blockchain Developer

**License:** Confidential & Proprietary
