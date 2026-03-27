/**
 * Seed Data Script
 * Generates test/seed data for development and testing
 */

const { User, KYC, Institution, Loan, Mandate, CreditScore } = require('../models');
const logger = require('../utils/logger.util');

const seedData = async () => {
  try {
    logger.info('Starting data seeding...');
    
    // Create institutions
    const institutions = await seedInstitutions();
    
    // Create users
    const users = await seedUsers(institutions);
    
    // Create KYC records
    await seedKYCs(users);
    
    // Create loans
    const loans = await seedLoans(users, institutions);
    
    // Create mandates
    await seedMandates(loans);
    
    // Create credit scores
    await seedCreditScores(users);
    
    logger.info(`Data seeding completed! Created:`, {
      institutions: institutions.length,
      users: users.length,
      loans: loans.length
    });
    
    process.exit(0);
  } catch (error) {
    logger.error('Failed to seed data:', error);
    process.exit(1);
  }
};

/**
 * Seed institutions
 */
const seedInstitutions = async () => {
  logger.info('Seeding institutions...');
  
  const institutions = [
    {
      name: 'Equity Bank Kenya',
      type: 'commercial_bank',
      code: 'EQUITY',
      country: 'Kenya',
      address: 'Equity Centre, Westlands, Nairobi',
      phoneNumber: '+254720000000',
      email: 'info@equity.co.ke',
      status: 'active',
      maxLoanAmount: 5000000,
      minLoanAmount: 50000,
      defaultInterestRate: 14.5
    },
    {
      name: 'Stima Sacco Society',
      type: 'sacco',
      code: 'STIMA',
      country: 'Kenya',
      address: 'Thika Road, Nairobi',
      phoneNumber: '+254720000001',
      email: 'info@stima.co.ke',
      status: 'active',
      maxLoanAmount: 2000000,
      minLoanAmount: 10000,
      defaultInterestRate: 12.0
    },
    {
      name: 'Tala Digital Lender',
      type: 'digital_lender',
      code: 'TALA',
      country: 'Kenya',
      address: 'Nairobi, Kenya',
      phoneNumber: '+254720000002',
      email: 'support@tala.co.ke',
      status: 'active',
      maxLoanAmount: 50000,
      minLoanAmount: 500,
      defaultInterestRate: 15.0
    }
  ];

  const created = await Institution.bulkCreate(institutions);
  logger.log(`Created ${created.length} institutions`);
  
  return created;
};

/**
 * Seed users
 */
const seedUsers = async (institutions) => {
  logger.info('Seeding users...');
  
  const users = [
    {
      firstName: 'John',
      lastName: 'Kamau',
      phoneNumber: '+254712345678',
      email: 'john.kamau@example.com',
      password: 'password123',
      role: 'borrower',
      status: 'active',
      isPhoneVerified: true,
      isEmailVerified: true
    },
    {
      firstName: 'Mary',
      lastName: 'Wanjiku',
      phoneNumber: '+254723456789',
      email: 'mary.wanjiku@example.com',
      password: 'password123',
      role: 'borrower',
      status: 'active',
      isPhoneVerified: true,
      isEmailVerified: true
    },
    {
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '+254700000000',
      email: 'admin@dhamini.co.ke',
      password: 'admin123',
      role: 'admin',
      status: 'active',
      isPhoneVerified: true,
      isEmailVerified: true
    },
    {
      firstName: 'Lender',
      lastName: 'Admin',
      phoneNumber: '+254700000001',
      email: 'lender@equity.co.ke',
      password: 'lender123',
      role: 'lender',
      status: 'active',
      institutionId: institutions[0].id,
      isPhoneVerified: true,
      isEmailVerified: true
    }
  ];

  const created = await User.bulkCreate(users);
  logger.log(`Created ${created.length} users`);
  
  return created;
};

/**
 * Seed KYC records
 */
const seedKYCs = async (users) => {
  logger.info('Seeding KYC records...');
  
  const kycs = users.map(user => ({
    userId: user.id,
    tier: user.role === 'borrower' ? 'TIER2' : 'TIER3',
    nationalIdNumber: '12345678',
    nationalIdVerified: true,
    mpesaPhoneNumber: user.phoneNumber,
    mpesaVerified: true,
    bankAccountVerified: Math.random() > 0.5,
    status: 'approved',
    verifiedAt: new Date(),
    verifiedBy: users[2].id // Admin user
  }));

  const created = await KYC.bulkCreate(kycs);
  logger.log(`Created ${created.length} KYC records`);
  
  return created;
};

/**
 * Seed loans
 */
const seedLoans = async (users, institutions) => {
  logger.info('Seeding loans...');
  
  const borrowerUsers = users.filter(u => u.role === 'borrower');
  
  const loans = [
    {
      loanReference: 'LN-' + Date.now() + '1',
      borrowerId: borrowerUsers[0].id,
      lenderId: institutions[0].id,
      loanAmount: 50000,
      interestRate: 14.5,
      interestAmount: 5312.50,
      totalAmount: 55312.50,
      term: 12,
      repaymentFrequency: 'monthly',
      firstRepaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      finalRepaymentDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      purpose: 'Personal loan',
      autopayEnabled: true,
      mpesaPhoneNumber: borrowerUsers[0].phoneNumber,
      status: 'disbursed',
      disbursementDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      disbursementMethod: 'mpesa_b2c',
      principalRepaid: 0,
      interestRepaid: 0,
      totalRepaid: 0,
      outstandingBalance: 55312.50,
      amountInArrears: 0,
      daysInArrears: 0
    },
    {
      loanReference: 'LN-' + Date.now() + '2',
      borrowerId: borrowerUsers[1].id,
      lenderId: institutions[2].id,
      loanAmount: 25000,
      interestRate: 15.0,
      interestAmount: 3125.00,
      totalAmount: 28125.00,
      term: 6,
      repaymentFrequency: 'monthly',
      firstRepaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      finalRepaymentDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      purpose: 'Emergency loan',
      autopayEnabled: true,
      mpesaPhoneNumber: borrowerUsers[1].phoneNumber,
      status: 'approved',
      principalRepaid: 0,
      interestRepaid: 0,
      totalRepaid: 0,
      outstandingBalance: 28125.00,
      amountInArrears: 0,
      daysInArrears: 0
    }
  ];

  const created = await Loan.bulkCreate(loans);
  logger.log(`Created ${created.length} loans`);
  
  return created;
};

/**
 * Seed mandates
 */
const seedMandates = async (loans) => {
  logger.info('Seeding mandates...');
  
  const mandates = loans.map(loan => ({
    mandateReference: 'MD-' + Date.now() + Math.random().toString(36).substring(2, 8),
    loanId: loan.id,
    borrowerId: loan.borrowerId,
    mandateType: 'mpesa_stk_push',
    accountType: 'mpesa_wallet',
    mpesaPhoneNumber: loan.mpesaPhoneNumber,
    deductionAmount: loan.totalAmount / loan.term,
    deductionDate: 5,
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    frequency: 'monthly',
    totalDeductions: loan.term,
    completedDeductions: loan.status === 'disbursed' ? 1 : 0,
    failedDeductions: 0,
    amountDeducted: loan.status === 'disbursed' ? (loan.totalAmount / loan.term) : 0,
    status: 'active',
    otpVerified: true,
    otpVerifiedAt: new Date(),
    iprsConsent: true,
    creditScoringConsent: true
  }));

  const created = await Mandate.bulkCreate(mandates);
  logger.log(`Created ${created.length} mandates`);
  
  return created;
};

/**
 * Seed credit scores
 */
const seedCreditScores = async (users) => {
  logger.info('Seeding credit scores...');
  
  const creditScores = users.map(user => {
    const score = Math.floor(Math.random() * 400) + 400; // 400-800
    let tier = 'D';
    if (score >= 800) tier = 'AAA';
    else if (score >= 700) tier = 'AA';
    else if (score >= 600) tier = 'A';
    else if (score >= 500) tier = 'B';
    else if (score >= 400) tier = 'C';
    
    return {
      userId: user.id,
      dcsScore: score,
      riskTier: tier,
      repaymentConsistency: Math.floor(Math.random() * 100),
      repaymentHistoryDepth: Math.floor(Math.random() * 100),
      creditUtilization: Math.floor(Math.random() * 100),
      incomeStability: Math.floor(Math.random() * 100),
      institutionDiversity: Math.floor(Math.random() * 100),
      fraudDisputeRecord: 100,
      totalRepaymentCount: Math.floor(Math.random() * 20),
      onTimeRepaymentCount: Math.floor(Math.random() * 15),
      lateRepaymentCount: Math.floor(Math.random() * 5),
      missedRepaymentCount: Math.floor(Math.random() * 2),
      totalLoans: Math.floor(Math.random() * 5),
      activeLoans: Math.floor(Math.random() * 3),
      completedLoans: Math.floor(Math.random() * 2),
      defaultedLoans: 0,
      totalLoanAmount: Math.random() * 500000,
      outstandingBalance: Math.random() * 100000,
      lastScoreUpdate: new Date()
    };
  });

  const created = await CreditScore.bulkCreate(creditScores);
  logger.log(`Created ${created.length} credit scores`);
  
  return created;
};

// Run seed if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  
  if (force) {
    logger.warn('⚠️  Running with --force flag. Existing data may be affected.');
  }
  
  seedData();
}

module.exports = { seedData };
