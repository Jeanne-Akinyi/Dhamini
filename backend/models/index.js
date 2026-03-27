const sequelize = require('../config/database.config').sequelize;

const User = require('./User');
const KYC = require('./KYC');
const Institution = require('./Institution');
const Loan = require('./Loan');
const Mandate = require('./Mandate');
const Repayment = require('./Repayment');
const CreditScore = require('./CreditScore');
const BlockchainRecord = require('./BlockchainRecord');

// Define relationships
User.hasOne(KYC, { foreignKey: 'userId', as: 'kyc' });
KYC.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Loan, { foreignKey: 'borrowerId', as: 'loans' });
Loan.belongsTo(User, { foreignKey: 'borrowerId', as: 'borrower' });

Institution.hasMany(Loan, { foreignKey: 'lenderId', as: 'loans' });
Loan.belongsTo(Institution, { foreignKey: 'lenderId', as: 'lender' });

Loan.hasOne(Mandate, { foreignKey: 'loanId', as: 'mandate' });
Mandate.belongsTo(Loan, { foreignKey: 'loanId', as: 'loan' });

Loan.hasMany(Repayment, { foreignKey: 'loanId', as: 'repayments' });
Repayment.belongsTo(Loan, { foreignKey: 'loanId', as: 'loan' });

User.hasOne(CreditScore, { foreignKey: 'userId', as: 'creditScore' });
CreditScore.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Loan.hasMany(BlockchainRecord, { foreignKey: 'loanId', as: 'blockchainRecords' });
BlockchainRecord.belongsTo(Loan, { foreignKey: 'loanId', as: 'loan' });

Mandate.hasMany(BlockchainRecord, { foreignKey: 'mandateId', as: 'blockchainRecords' });
BlockchainRecord.belongsTo(Mandate, { foreignKey: 'mandateId', as: 'mandate' });

Repayment.hasMany(BlockchainRecord, { foreignKey: 'repaymentId', as: 'blockchainRecords' });
BlockchainRecord.belongsTo(Repayment, { foreignKey: 'repaymentId', as: 'repayment' });

Institution.hasMany(User, { foreignKey: 'institutionId', as: 'employees' });
User.belongsTo(Institution, { foreignKey: 'institutionId', as: 'institution' });

module.exports = {
  sequelize,
  User,
  KYC,
  Institution,
  Loan,
  Mandate,
  Repayment,
  CreditScore,
  BlockchainRecord
};
