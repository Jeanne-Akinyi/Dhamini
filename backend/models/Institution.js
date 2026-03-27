const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Institution = sequelize.define('Institution', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('commercial_bank', 'sacco', 'chama', 'mfi', 'digital_lender', 'other'),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Kenya'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    logoUrl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    registrationNumber: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    regulatoryBody: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    regulatoryLicenseNumber: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending'),
      allowNull: false,
      defaultValue: 'pending'
    },
    mpesaShortcode: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    mpesaApiKey: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    bankApiEndpoint: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    bankApiCredentials: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    webhookUrl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    webhookSecret: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    maxLoanAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    minLoanAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    defaultInterestRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    dhaminiIntegrationEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    blockchainWalletAddress: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'Institutions',
    timestamps: true,
    indexes: [
      { fields: ['type'] },
      { fields: ['status'] },
      { fields: ['code'] },
      { fields: ['dhaminiIntegrationEnabled'] }
    ]
  });

  return Institution;
};
