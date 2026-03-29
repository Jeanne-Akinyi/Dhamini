const { User } = require('../models');
const jwtService = require('../services/jwt.service');
const { success } = require('../utils/response.util');
const { AppError, asyncHandler } = require('../middleware/authHandler');
const supabaseService = require('../config/supabase.config');
const { sendOTP, verifyOTP, getUserById, updateUserMetadata, refreshSession, signOut, createUser } = supabaseService;
const { Op } = require('sequelize');

/**
 * Register a new user
 * Creates user in Supabase Auth first, then stores in local DB
 */
const register = asyncHandler(async (req, res) => {
  const { phoneNumber, email, role, firstName, lastName } = req.body;

  // Normalize phone number to international format
  const normalizedPhone = phoneNumber.startsWith('+') 
    ? phoneNumber 
    : `+254${phoneNumber.substring(1)}`;

  // Build where clause with only defined values
  const whereConditions = [];
  if (normalizedPhone) whereConditions.push({ phoneNumber: normalizedPhone });
  if (email) whereConditions.push({ email });

  // Check if user already exists in local DB
  const existingUser = whereConditions.length > 0 
    ? await User.findOne({ where: { [Op.or]: whereConditions } })
    : null;

  if (existingUser) {
    throw new AppError('User with this phone number or email already exists', 409);
  }

  // Create user in Supabase Auth first
  const supabaseResult = await createUser(normalizedPhone, {
    firstName,
    lastName,
    role: role || 'borrower'
  });

  if (!supabaseResult.success) {
    throw new AppError('Failed to create user: ' + supabaseResult.error, 500);
  }

  // Create user in local database with Supabase user ID
  const user = await User.create({
    phoneNumber: normalizedPhone,
    email,
    role: role || 'borrower',
    firstName,
    lastName,
    status: 'pending',
    isPhoneVerified: true,
    supabaseUserId: supabaseResult.user.id
  });

  return success(res, {
    message: 'User registered successfully.',
    user: {
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
      status: user.status,
      supabaseId: supabaseResult.user.id
    }
  }, 201);
});

/**
 * Verify phone number with OTP
 * Uses Supabase Auth OTP verification
 */
const verifyPhone = asyncHandler(async (req, res) => {
  const { phoneNumber, otp } = req.body;

  // Normalize phone number
  const normalizedPhone = phoneNumber.startsWith('+') 
    ? phoneNumber 
    : `+254${phoneNumber.substring(1)}`;

  // Find user in local database
  const user = await User.findOne({ where: { phoneNumber: normalizedPhone } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify OTP with Supabase
  const verifyResult = await verifyOTP(normalizedPhone, otp);

  if (!verifyResult.success) {
    throw new AppError(verifyResult.error || 'Invalid or expired OTP', 400);
  }

  // Get user's role from Supabase metadata
  const supabaseUser = await getUserById(verifyResult.user.id);

  // Update user in local database
  user.isPhoneVerified = true;
  user.supabaseUserId = verifyResult.user.id;
  user.status = 'active';
  await user.save();

  // Update Supabase user metadata
  await updateUserMetadata(verifyResult.user.id, {
    role: user.role,
    localDbId: user.id
  });

  // Generate JWT token from our backend
  const token = jwtService.generateToken({
    userId: user.id,
    role: user.role,
    institutionId: user.institutionId
  });

  return success(res, {
    message: 'Phone number verified successfully',
    user: {
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
      status: user.status
    },
    token,
    supabaseSession: verifyResult.session
  });
});

/**
 * Login user with OTP
 * Sends OTP to user's phone
 */
const login = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    throw new AppError('Phone number is required', 400);
  }

  // Normalize phone number
  const normalizedPhone = phoneNumber.startsWith('+') 
    ? phoneNumber 
    : `+254${phoneNumber.substring(1)}`;

  // Find user in local database
  const user = await User.findOne({
    where: { phoneNumber: normalizedPhone },
    include: [{ model: require('../models').KYC, as: 'kyc' }]
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if user is active
  if (user.status === 'suspended') {
    throw new AppError('Your account has been suspended', 403);
  }

  // Send OTP via Supabase
  const otpResult = await sendOTP(normalizedPhone);

  if (!otpResult.success) {
    throw new AppError(otpResult.error || 'Failed to send OTP', 500);
  }

  return success(res, {
    message: 'OTP sent successfully',
    phoneNumber: normalizedPhone
  });
});

/**
 * Logout user
 */
const logout = asyncHandler(async (req, res) => {
  // Invalidate Supabase session if available
  const { accessToken } = req.body;
  if (accessToken) {
    await signOut(accessToken);
  }

  return success(res, {
    message: 'Logout successful'
  });
});

/**
 * Refresh token
 * Uses Supabase refresh token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: supabaseRefreshToken } = req.body;

  if (!supabaseRefreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  const sessionResult = await refreshSession(supabaseRefreshToken);

  if (!sessionResult.success) {
    throw new AppError(sessionResult.error || 'Invalid refresh token', 401);
  }

  // Get user from local database using Supabase user ID
  const user = await User.findOne({ 
    where: { supabaseUserId: sessionResult.session.user.id }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Generate new JWT token from our backend
  const token = jwtService.generateToken({
    userId: user.id,
    role: user.role,
    institutionId: user.institutionId
  });

  return success(res, {
    token,
    supabaseSession: sessionResult.session
  });
});

/**
 * Get current user profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const user = await User.findByPk(userId, {
    include: [
      { model: require('../models').KYC, as: 'kyc' },
      { 
        model: require('../models').Institution, 
        as: 'institution',
        attributes: ['id', 'name', 'type', 'status']
      }
    ]
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get latest user data from Supabase
  let supabaseUser = null;
  if (user.supabaseUserId) {
    const supabaseResult = await getUserById(user.supabaseUserId);
    if (supabaseResult.success) {
      supabaseUser = supabaseResult.user;
    }
  }

  return success(res, { 
    user, 
    supabaseUser 
  });
});

/**
 * Update user profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { firstName, lastName, email } = req.body;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) {
    const existingUser = await User.findOne({
      where: { email, id: { [Op.ne]: userId } }
    });
    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }
    user.email = email;
  }

  await user.save();

  // Update Supabase user metadata
  if (user.supabaseUserId) {
    await updateUserMetadata(user.supabaseUserId, {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    });
  }

  return success(res, {
    message: 'Profile updated successfully',
    user
  });
});

module.exports = {
  register,
  verifyPhone,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile
};
