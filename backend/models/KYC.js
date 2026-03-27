const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const KYC = sequelize.define('KYC', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    tier: {
      type: DataTypes.ENUM('TIER1', 'TIER2', 'TIER3', 'TIER4'),
      allowNull: false,
      defaultValue: 'TIER1'
    },
    nationalIdNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    },
    nationalIdVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    kraPin: {
      type: DataTypes.STRING(11),
      allowNull: true
    },
    kraPinVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    idPhotoUrl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    selfieUrl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    selfieVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    livenessVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    bankAccountVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    bankAccountNumber: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    bankName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    mpesaPhoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    mpesaVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    employerName: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    employerVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    monthlyIncome: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    incomeVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    physicalAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    coordinates: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'incomplete'),
      allowNull: false,
      defaultValue: 'pending'
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    verifiedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    iprsVerificationId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    iprsResponse: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    tableName: 'KYC',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['nationalIdNumber'] },
      { fields: ['mpesaPhoneNumber'] },
      { fields: ['tier'] },
      { fields: ['status'] }
    ]
  });

  return KYC;
};
