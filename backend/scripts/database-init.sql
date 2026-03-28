-- ============================================
-- Dhamini Database Initialization Script
-- For Supabase PostgreSQL
-- ============================================
-- This script creates all required tables for the Dhamini platform
-- Run this in Supabase Dashboard → Database → SQL Editor
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

-- User role enum
CREATE TYPE user_role AS ENUM (
    'borrower', 'lender', 'admin', 'sacco_admin', 'chama_admin', 'field_agent', 'regulator'
);

-- User status enum
CREATE TYPE user_status AS ENUM (
    'active', 'inactive', 'suspended', 'pending'
);

-- Institution type enum
CREATE TYPE institution_type AS ENUM (
    'commercial_bank', 'sacco', 'chama', 'mfi', 'digital_lender', 'other'
);

-- Institution status enum
CREATE TYPE institution_status AS ENUM (
    'active', 'inactive', 'suspended', 'pending'
);

-- Loan status enum
CREATE TYPE loan_status AS ENUM (
    'pending', 'approved', 'disbursed', 'active', 'completed', 'defaulted', 'cancelled'
);

-- Repayment frequency enum
CREATE TYPE repayment_frequency AS ENUM (
    'weekly', 'biweekly', 'monthly', 'quarterly'
);

-- Disbursement method enum
CREATE TYPE disbursement_method AS ENUM (
    'bank_transfer', 'mpesa', 'cash', 'chama_wallet'
);

-- Mandate type enum
CREATE TYPE mandate_type AS ENUM (
    'bank_direct_debit', 'mpesa_stk_push', 'mpesa_standing_order', 
    'sacco_payroll', 'chama_contribution', 'mfi_field_collection'
);

-- Account type enum
CREATE TYPE account_type AS ENUM (
    'bank_account', 'mpesa_wallet', 'sacco_account', 'chama_wallet'
);

-- Mandate frequency enum
CREATE TYPE mandate_frequency AS ENUM (
    'once', 'weekly', 'biweekly', 'monthly', 'quarterly'
);

-- Mandate status enum
CREATE TYPE mandate_status AS ENUM (
    'draft', 'pending_approval', 'active', 'paused', 'completed', 'revoked', 'cancelled'
);

-- Payment method enum
CREATE TYPE payment_method AS ENUM (
    'bank_direct_debit', 'mpesa_stk_push', 'mpesa_c2b', 'mpesa_b2c', 
    'sacco_payroll', 'chama_wallet', 'cash', 'other'
);

-- Repayment status enum
CREATE TYPE repayment_status AS ENUM (
    'pending', 'processing', 'completed', 'failed', 'partially_paid', 'cancelled'
);

-- Initiated by enum
CREATE TYPE initiated_by AS ENUM (
    'auto', 'manual', 'scheduler', 'api'
);

-- Payment gateway enum
CREATE TYPE payment_gateway AS ENUM (
    'mpesa', 'pesalink', 'equity', 'kcb', 'co_op', 'ncba', 'absa', 'other'
);

-- Risk tier enum
CREATE TYPE risk_tier AS ENUM (
    'AAA', 'AA', 'A', 'B', 'C', 'D', 'F'
);

-- CRB status enum
CREATE TYPE crb_status AS ENUM (
    'clean', 'listed', 'not_checked'
);

-- Income estimation source enum
CREATE TYPE income_estimation_source AS ENUM (
    'mpesa', 'bank', 'payroll', 'none'
);

-- Blockchain record type enum
CREATE TYPE blockchain_record_type AS ENUM (
    'mandate_creation', 'mandate_revocation', 'repayment', 'credit_score_change', 
    'kyc_completion', 'dispute', 'correction'
);

-- Blockchain entity enum
CREATE TYPE blockchain_entity AS ENUM (
    'mandate', 'repayment', 'loan', 'kyc', 'credit_score', 'dispute'
);

-- Blockchain network enum
CREATE TYPE blockchain_network AS ENUM (
    'fabric_testnet', 'fabric_mainnet'
);

-- Blockchain record status enum
CREATE TYPE blockchain_record_status AS ENUM (
    'pending', 'submitted', 'confirmed', 'failed', 'invalid'
);

-- KYC tier enum
CREATE TYPE kyc_tier AS ENUM (
    'TIER1', 'TIER2', 'TIER3', 'TIER4'
);

-- KYC status enum
CREATE TYPE kyc_status AS ENUM (
    'pending', 'approved', 'rejected', 'incomplete'
);

-- ============================================
-- TABLES
-- ============================================

-- ============================================
-- INSTITUTIONS TABLE
-- ============================================
CREATE TABLE Institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    type institution_type NOT NULL,
    code VARCHAR(50) UNIQUE,
    country VARCHAR(100) NOT NULL DEFAULT 'Kenya',
    address TEXT,
    city VARCHAR(100),
    phoneNumber VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    logoUrl TEXT,
    registrationNumber VARCHAR(100),
    regulatoryBody VARCHAR(100),
    regulatoryLicenseNumber VARCHAR(100),
    status institution_status NOT NULL DEFAULT 'pending',
    mpesaShortcode VARCHAR(10),
    mpesaApiKey TEXT,
    bankApiEndpoint TEXT,
    bankApiCredentials JSONB,
    webhookUrl TEXT,
    webhookSecret VARCHAR(255),
    maxLoanAmount DECIMAL(15, 2),
    minLoanAmount DECIMAL(15, 2),
    defaultInterestRate DECIMAL(5, 2),
    dhaminiIntegrationEnabled BOOLEAN DEFAULT false,
    blockchainWalletAddress VARCHAR(255),
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for Institutions
CREATE INDEX idx_institutions_type ON Institutions(type);
CREATE INDEX idx_institutions_status ON Institutions(status);
CREATE INDEX idx_institutions_code ON Institutions(code);
CREATE INDEX idx_institutions_dhamini_integration ON Institutions(dhaminiIntegrationEnabled);

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phoneNumber VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    supabaseUserId VARCHAR(255) UNIQUE,
    role user_role NOT NULL DEFAULT 'borrower',
    status user_status NOT NULL DEFAULT 'pending',
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    institutionId UUID REFERENCES Institutions(id),
    isPhoneVerified BOOLEAN DEFAULT false,
    isEmailVerified BOOLEAN DEFAULT false,
    lastLogin TIMESTAMP,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT users_phone_check CHECK (phoneNumber ~ '^[0-9+]+$'),
    CONSTRAINT users_email_check CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for Users
CREATE INDEX idx_users_phoneNumber ON Users(phoneNumber);
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_role ON Users(role);
CREATE INDEX idx_users_institutionId ON Users(institutionId);
CREATE INDEX idx_users_supabaseUserId ON Users(supabaseUserId);

-- Comment on supabaseUserId column
COMMENT ON COLUMN Users.supabaseUserId IS 'User ID from Supabase Auth';

-- ============================================
-- KYC TABLE
-- ============================================
CREATE TABLE KYC (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES Users(id),
    tier kyc_tier NOT NULL DEFAULT 'TIER1',
    nationalIdNumber VARCHAR(20) UNIQUE,
    nationalIdVerified BOOLEAN DEFAULT false,
    kraPin VARCHAR(11),
    kraPinVerified BOOLEAN DEFAULT false,
    dateOfBirth DATE,
    gender VARCHAR(10),
    idPhotoUrl TEXT,
    selfieUrl TEXT,
    selfieVerified BOOLEAN DEFAULT false,
    livenessVerified BOOLEAN DEFAULT false,
    bankAccountVerified BOOLEAN DEFAULT false,
    bankAccountNumber VARCHAR(30),
    bankName VARCHAR(100),
    mpesaPhoneNumber VARCHAR(20),
    mpesaVerified BOOLEAN DEFAULT false,
    employerName VARCHAR(200),
    employerVerified BOOLEAN DEFAULT false,
    monthlyIncome DECIMAL(15, 2),
    incomeVerified BOOLEAN DEFAULT false,
    physicalAddress TEXT,
    coordinates JSONB,
    status kyc_status NOT NULL DEFAULT 'pending',
    rejectionReason TEXT,
    verifiedBy UUID REFERENCES Users(id),
    verifiedAt TIMESTAMP,
    iprsVerificationId VARCHAR,
    iprsResponse JSONB,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for KYC
CREATE UNIQUE INDEX idx_kyc_userId ON KYC(userId);
CREATE INDEX idx_kyc_nationalIdNumber ON KYC(nationalIdNumber);
CREATE INDEX idx_kyc_mpesaPhoneNumber ON KYC(mpesaPhoneNumber);
CREATE INDEX idx_kyc_tier ON KYC(tier);
CREATE INDEX idx_kyc_status ON KYC(status);

-- ============================================
-- LOANS TABLE
-- ============================================
CREATE TABLE Loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loanReference VARCHAR(50) NOT NULL UNIQUE,
    borrowerId UUID NOT NULL REFERENCES Users(id),
    lenderId UUID NOT NULL REFERENCES Institutions(id),
    loanAmount DECIMAL(15, 2) NOT NULL,
    interestRate DECIMAL(5, 2) NOT NULL,
    interestAmount DECIMAL(15, 2) NOT NULL,
    totalAmount DECIMAL(15, 2) NOT NULL,
    term INTEGER NOT NULL,
    repaymentFrequency repayment_frequency NOT NULL DEFAULT 'monthly',
    firstRepaymentDate DATE NOT NULL,
    finalRepaymentDate DATE NOT NULL,
    status loan_status NOT NULL DEFAULT 'pending',
    disbursementDate DATE,
    disbursementMethod disbursement_method,
    principalRepaid DECIMAL(15, 2) NOT NULL DEFAULT 0,
    interestRepaid DECIMAL(15, 2) NOT NULL DEFAULT 0,
    totalRepaid DECIMAL(15, 2) NOT NULL DEFAULT 0,
    outstandingBalance DECIMAL(15, 2) NOT NULL,
    amountInArrears DECIMAL(15, 2) NOT NULL DEFAULT 0,
    daysInArrears INTEGER NOT NULL DEFAULT 0,
    nextRepaymentAmount DECIMAL(15, 2),
    nextRepaymentDate DATE,
    purpose VARCHAR(500),
    security VARCHAR(200),
    guarantorUserId UUID REFERENCES Users(id),
    collateralDetails JSONB,
    autopayEnabled BOOLEAN DEFAULT true,
    bankAccountNumber VARCHAR(30),
    mpesaPhoneNumber VARCHAR(20),
    rejectionReason TEXT,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for Loans
CREATE INDEX idx_loans_loanReference ON Loans(loanReference);
CREATE INDEX idx_loans_borrowerId ON Loans(borrowerId);
CREATE INDEX idx_loans_lenderId ON Loans(lenderId);
CREATE INDEX idx_loans_status ON Loans(status);
CREATE INDEX idx_loans_disbursementDate ON Loans(disbursementDate);
CREATE INDEX idx_loans_nextRepaymentDate ON Loans(nextRepaymentDate);
CREATE INDEX idx_loans_createdAt ON Loans(createdAt);

-- Comment on term column
COMMENT ON COLUMN Loans.term IS 'Loan term in months';

-- ============================================
-- MANDATES TABLE
-- ============================================
CREATE TABLE Mandates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mandateReference VARCHAR(50) NOT NULL UNIQUE,
    loanId UUID NOT NULL REFERENCES Loans(id),
    borrowerId UUID NOT NULL REFERENCES Users(id),
    mandateType mandate_type NOT NULL,
    accountType account_type NOT NULL,
    accountNumber VARCHAR(30),
    accountName VARCHAR(200),
    bankCode VARCHAR(20),
    mpesaPhoneNumber VARCHAR(20),
    deductionAmount DECIMAL(15, 2) NOT NULL,
    deductionDate INTEGER NOT NULL,
    deductionTimeWindow VARCHAR(100),
    startDate DATE NOT NULL,
    endDate DATE,
    frequency mandate_frequency NOT NULL DEFAULT 'monthly',
    totalDeductions INTEGER NOT NULL DEFAULT 0,
    completedDeductions INTEGER NOT NULL DEFAULT 0,
    failedDeductions INTEGER NOT NULL DEFAULT 0,
    amountDeducted DECIMAL(15, 2) NOT NULL DEFAULT 0,
    status mandate_status NOT NULL DEFAULT 'draft',
    digitalSignature TEXT,
    otpVerified BOOLEAN DEFAULT false,
    otpVerifiedAt TIMESTAMP,
    iprsConsent BOOLEAN DEFAULT false,
    creditScoringConsent BOOLEAN DEFAULT false,
    dataSharingConsent JSONB,
    mandateHash VARCHAR(64),
    blockchainTxId VARCHAR(255),
    documentUrl TEXT,
    revocationReason TEXT,
    revokedAt TIMESTAMP,
    revokedBy UUID REFERENCES Users(id),
    lastDeductionDate DATE,
    nextDeductionDate DATE,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for Mandates
CREATE INDEX idx_mandates_mandateReference ON Mandates(mandateReference);
CREATE INDEX idx_mandates_loanId ON Mandates(loanId);
CREATE INDEX idx_mandates_borrowerId ON Mandates(borrowerId);
CREATE INDEX idx_mandates_status ON Mandates(status);
CREATE INDEX idx_mandates_deductionDate ON Mandates(deductionDate);
CREATE INDEX idx_mandates_nextDeductionDate ON Mandates(nextDeductionDate);
CREATE INDEX idx_mandates_mandateHash ON Mandates(mandateHash);

-- Comments on Mandates columns
COMMENT ON COLUMN Mandates.deductionDate IS 'Day of month for deduction (1-31)';
COMMENT ON COLUMN Mandates.deductionTimeWindow IS 'Time window for deduction (e.g., 06:00-12:00)';
COMMENT ON COLUMN Mandates.dataSharingConsent IS 'Consent for sharing data with specific institutions';
COMMENT ON COLUMN Mandates.mandateHash IS 'SHA-256 hash for blockchain verification';

-- ============================================
-- REPAYMENTS TABLE
-- ============================================
CREATE TABLE Repayments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repaymentReference VARCHAR(50) NOT NULL UNIQUE,
    loanId UUID NOT NULL REFERENCES Loans(id),
    mandateId UUID REFERENCES Mandates(id),
    borrowerId UUID NOT NULL REFERENCES Users(id),
    lenderId UUID NOT NULL REFERENCES Institutions(id),
    scheduledDate DATE NOT NULL,
    actualPaymentDate DATE,
    installmentNumber INTEGER NOT NULL,
    totalInstallments INTEGER NOT NULL,
    principalAmount DECIMAL(15, 2) NOT NULL,
    interestAmount DECIMAL(15, 2) NOT NULL,
    feesAmount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    penaltyAmount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    totalAmount DECIMAL(15, 2) NOT NULL,
    amountPaid DECIMAL(15, 2) NOT NULL DEFAULT 0,
    paymentMethod payment_method,
    paymentReference VARCHAR(100),
    status repayment_status NOT NULL DEFAULT 'pending',
    failureReason TEXT,
    retryCount INTEGER NOT NULL DEFAULT 0,
    maxRetries INTEGER NOT NULL DEFAULT 3,
    nextRetryDate DATE,
    initiatedBy initiated_by NOT NULL DEFAULT 'auto',
    processedBy UUID REFERENCES Users(id),
    deductionAttempted BOOLEAN DEFAULT false,
    deductionAttemptedAt TIMESTAMP,
    paymentReceived BOOLEAN DEFAULT false,
    paymentReceivedAt TIMESTAMP,
    reconciled BOOLEAN DEFAULT false,
    reconciledAt TIMESTAMP,
    daysLate INTEGER NOT NULL DEFAULT 0,
    isLate BOOLEAN DEFAULT false,
    blockchainTxId VARCHAR(255),
    paymentGateway payment_gateway,
    mpesaResultCode VARCHAR(10),
    mpesaResultDesc VARCHAR(500),
    mpesaMerchantRequestID VARCHAR(100),
    mpesaCheckoutRequestID VARCHAR(100),
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for Repayments
CREATE INDEX idx_repayments_repaymentReference ON Repayments(repaymentReference);
CREATE INDEX idx_repayments_loanId ON Repayments(loanId);
CREATE INDEX idx_repayments_mandateId ON Repayments(mandateId);
CREATE INDEX idx_repayments_borrowerId ON Repayments(borrowerId);
CREATE INDEX idx_repayments_lenderId ON Repayments(lenderId);
CREATE INDEX idx_repayments_scheduledDate ON Repayments(scheduledDate);
CREATE INDEX idx_repayments_status ON Repayments(status);
CREATE INDEX idx_repayments_installmentNumber ON Repayments(installmentNumber);
CREATE INDEX idx_repayments_paymentMethod ON Repayments(paymentMethod);
CREATE INDEX idx_repayments_mpesaMerchantRequestID ON Repayments(mpesaMerchantRequestID);
CREATE INDEX idx_repayments_mpesaCheckoutRequestID ON Repayments(mpesaCheckoutRequestID);

-- Comment on paymentReference column
COMMENT ON COLUMN Repayments.paymentReference IS 'Transaction reference from payment provider';

-- ============================================
-- CREDIT SCORES TABLE
-- ============================================
CREATE TABLE CreditScores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES Users(id),
    dcsScore INTEGER NOT NULL DEFAULT 400,
    riskTier risk_tier NOT NULL DEFAULT 'D',
    repaymentConsistency DECIMAL(5, 2) NOT NULL DEFAULT 0,
    repaymentHistoryDepth DECIMAL(5, 2) NOT NULL DEFAULT 0,
    creditUtilization DECIMAL(5, 2) NOT NULL DEFAULT 0,
    incomeStability DECIMAL(5, 2) NOT NULL DEFAULT 0,
    institutionDiversity DECIMAL(5, 2) NOT NULL DEFAULT 0,
    fraudDisputeRecord DECIMAL(5, 2) NOT NULL DEFAULT 100,
    totalRepaymentCount INTEGER NOT NULL DEFAULT 0,
    onTimeRepaymentCount INTEGER NOT NULL DEFAULT 0,
    lateRepaymentCount INTEGER NOT NULL DEFAULT 0,
    missedRepaymentCount INTEGER NOT NULL DEFAULT 0,
    totalLoans INTEGER NOT NULL DEFAULT 0,
    activeLoans INTEGER NOT NULL DEFAULT 0,
    completedLoans INTEGER NOT NULL DEFAULT 0,
    defaultedLoans INTEGER NOT NULL DEFAULT 0,
    totalLoanAmount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    outstandingBalance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    availableCreditLimit DECIMAL(15, 2) NOT NULL DEFAULT 0,
    incomeEstimate DECIMAL(15, 2),
    incomeEstimationSource income_estimation_source,
    lastSalaryDate DATE,
    salaryRegularityScore DECIMAL(5, 2),
    institutionTypesUsed JSONB,
    lastScoreUpdate TIMESTAMP NOT NULL DEFAULT NOW(),
    scoreHistory JSONB,
    crbStatus crb_status NOT NULL DEFAULT 'not_checked',
    crbScore INTEGER,
    crbLastUpdated TIMESTAMP,
    creditEvents JSONB,
    flags JSONB,
    notes TEXT,
    calculatedBy VARCHAR(100) NOT NULL DEFAULT 'system',
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT credit_scores_userId_unique UNIQUE (userId),
    CONSTRAINT credit_scores_dcsScore_range CHECK (dcsScore >= 300 AND dcsScore <= 1000)
);

-- Create indexes for CreditScores
CREATE INDEX idx_creditscores_userId ON CreditScores(userId);
CREATE INDEX idx_creditscores_dcsScore ON CreditScores(dcsScore);
CREATE INDEX idx_creditscores_riskTier ON CreditScores(riskTier);
CREATE INDEX idx_creditscores_lastScoreUpdate ON CreditScores(lastScoreUpdate);
CREATE INDEX idx_creditscores_crbStatus ON CreditScores(crbStatus);

-- Comments on CreditScores columns
COMMENT ON COLUMN CreditScores.dcsScore IS 'Dhamini Credit Score (300-1000)';
COMMENT ON COLUMN CreditScores.repaymentConsistency IS '35% weight';
COMMENT ON COLUMN CreditScores.repaymentHistoryDepth IS '20% weight';
COMMENT ON COLUMN CreditScores.creditUtilization IS '15% weight';
COMMENT ON COLUMN CreditScores.incomeStability IS '15% weight';
COMMENT ON COLUMN CreditScores.institutionDiversity IS '10% weight';
COMMENT ON COLUMN CreditScores.fraudDisputeRecord IS '5% weight (lower is better)';
COMMENT ON COLUMN CreditScores.institutionTypesUsed IS 'Array of institution types this borrower has used';
COMMENT ON COLUMN CreditScores.scoreHistory IS 'Array of {date, score, tier, reason}';
COMMENT ON COLUMN CreditScores.creditEvents IS 'Negative/negative events from CRBs';
COMMENT ON COLUMN CreditScores.flags IS 'Risk flags, alerts, or special conditions';

-- ============================================
-- BLOCKCHAIN RECORDS TABLE
-- ============================================
CREATE TABLE BlockchainRecords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recordType blockchain_record_type NOT NULL,
    entity blockchain_entity NOT NULL,
    entityId UUID NOT NULL,
    mandateId UUID REFERENCES Mandates(id),
    repaymentId UUID REFERENCES Repayments(id),
    loanId UUID REFERENCES Loans(id),
    borrowerId UUID REFERENCES Users(id),
    institutionId UUID REFERENCES Institutions(id),
    dataHash VARCHAR(64) NOT NULL,
    transactionHash VARCHAR(255) NOT NULL,
    blockNumber BIGINT,
    blockTimestamp TIMESTAMP,
    channel VARCHAR(100) NOT NULL DEFAULT 'dhaminichannel',
    chaincode VARCHAR(100) NOT NULL DEFAULT 'dhaminicontract',
    network blockchain_network NOT NULL DEFAULT 'fabric_testnet',
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    payload JSONB,
    isVerified BOOLEAN DEFAULT false,
    verifiedAt TIMESTAMP,
    verificationAttempts INTEGER DEFAULT 0,
    createdBy UUID REFERENCES Users(id),
    status blockchain_record_status NOT NULL DEFAULT 'pending',
    errorMessage TEXT,
    gasUsed DECIMAL(20, 0),
    transactionIndex INTEGER,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT blockchain_records_transactionHash_unique UNIQUE (transactionHash)
);

-- Create indexes for BlockchainRecords
CREATE INDEX idx_blockchainrecords_recordType ON BlockchainRecords(recordType);
CREATE INDEX idx_blockchainrecords_entity ON BlockchainRecords(entity);
CREATE INDEX idx_blockchainrecords_entityId ON BlockchainRecords(entityId);
CREATE INDEX idx_blockchainrecords_mandateId ON BlockchainRecords(mandateId);
CREATE INDEX idx_blockchainrecords_repaymentId ON BlockchainRecords(repaymentId);
CREATE INDEX idx_blockchainrecords_loanId ON BlockchainRecords(loanId);
CREATE INDEX idx_blockchainrecords_borrowerId ON BlockchainRecords(borrowerId);
CREATE INDEX idx_blockchainrecords_institutionId ON BlockchainRecords(institutionId);
CREATE INDEX idx_blockchainrecords_dataHash ON BlockchainRecords(dataHash);
CREATE INDEX idx_blockchainrecords_transactionHash ON BlockchainRecords(transactionHash);
CREATE INDEX idx_blockchainrecords_blockNumber ON BlockchainRecords(blockNumber);
CREATE INDEX idx_blockchainrecords_status ON BlockchainRecords(status);
CREATE INDEX idx_blockchainrecords_timestamp ON BlockchainRecords(timestamp);

-- Comments on BlockchainRecords columns
COMMENT ON COLUMN BlockchainRecords.dataHash IS 'SHA-256 hash of the data';
COMMENT ON COLUMN BlockchainRecords.transactionHash IS 'Blockchain transaction hash';
COMMENT ON COLUMN BlockchainRecords.payload IS 'Data payload (off-chain storage reference)';
COMMENT ON COLUMN BlockchainRecords.gasUsed IS 'Transaction fee/gas used';

-- ============================================
-- INSERT DEFAULT/SEED DATA (Optional)
-- ============================================
-- Uncomment below to insert default admin user and sample institution

/*
-- Insert default admin institution
INSERT INTO Institutions (name, type, code, phoneNumber, email, status, dhaminiIntegrationEnabled)
VALUES ('Dhamini Admin', 'digital_lender', 'DHM001', '+254700000000', 'admin@dhamini.co.ke', 'active', true)
ON CONFLICT (code) DO NOTHING;

-- Insert default admin user
INSERT INTO Users (phoneNumber, email, role, status, firstName, lastName, supabaseUserId)
VALUES ('+254700000000', 'admin@dhamini.co.ke', 'admin', 'active', 'Admin', 'User', 'admin-supabase-id')
ON CONFLICT (email) DO NOTHING;
*/

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on all tables for security
-- Uncomment to enable Row Level Security

/*
ALTER TABLE Institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE Users ENABLE ROW LEVEL SECURITY;
ALTER TABLE KYC ENABLE ROW LEVEL SECURITY;
ALTER TABLE Loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE Mandates ENABLE ROW LEVEL SECURITY;
ALTER TABLE Repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE CreditScores ENABLE ROW LEVEL SECURITY;
ALTER TABLE BlockchainRecords ENABLE ROW LEVEL SECURITY;
*/

-- ============================================
-- COMPLETION
-- ============================================
-- Database initialization complete
SELECT 'DATABASE INITIALIZATION COMPLETE' AS Status;
SELECT COUNT(*) AS "Total Tables Created" FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';