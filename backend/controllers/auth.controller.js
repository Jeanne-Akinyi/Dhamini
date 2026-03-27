const { User } = require('../models');
const jwtService = require('../services/jwt.service');
const { success } = require('../utils/response.util');
const { AppError, asyncHandler } = require('../middleware/authHandler');
const { generateOTP, sendOTP } = require('../services/otp.service');
const { cache } = require('../config/redis.config');

/**
 * Register a new user
 */
const register = asyncHandler(async (req, res) => {
  const { phoneNumber, email, password, role, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    where: { 
      $or: [
        { phoneNumber },
        { email }
      ]
    }
  });

  if (existingUser) {
    throw new AppError('User with this phone number or email already exists', 409);
  }

  // Create user
  const user = await User.create({
    phoneNumber,
    email,
    password,
    role: role || 'borrower',
    firstName,
    lastName,
    status: 'pending'
  });

  // Generate and send OTP
  const otp = generateOTP();
  await cache.set(`otp:${user.id}`, otp, 300); // 5 minutes expiry

  try {
    await sendOTP(phoneNumber, otp);
  } catch (error) {
    console.error('Failed to send OTP:', error);
    // Continue with registration even if OTP fails
  }

  return success(res, {
    message: 'User registered successfully. Please verify your phone number.',
    user: {
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
      status: user.status
    }
  }, 201);
});

/**
 * Verify phone number with OTP
 */
const verifyPhone = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  const cachedOtp = await cache.get(`otp:${userId}`);

  if (!cachedOtp || cachedOtp !== otp) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.isPhoneVerified = true;
  user.status = 'active';
  await user.save();

  await cache.del(`otp:${userId}`);

  // Generate JWT token
  const token = jwtService.generateToken({
    userId: user.id,
    role: user.role,
    institutionId: user.institutionId
  });

  return success(res, {
    message: 'Phone number verified successfully',
    user: user,
    token
  });
});

/**
 * Login user
 */
const login = asyncHandler(async (req, res) => {
  const { phoneNumber, email, password } = req.body;

  if (!password) {
    throw new AppError('Password is required', 400);
  }

  if (!phoneNumber && !email) {
    throw new AppError('Phone number or email is required', 400);
  }

  // Find user
  const user = await User.findOne({
    where: phoneNumber 
      ? { phoneNumber }
      : { email },
    include: [{ model: require('../models').KYC, as: 'kyc' }]
  });

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Validate password
  if (!user.validatePassword(password)) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if user is active
  if (user.status === 'suspended') {
    throw new AppError('Your account has been suspended', 403);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT token
  const token = jwtService.generateToken({
    userId: user.id,
    role: user.role,
    institutionId: user.institutionId
  });

  return success(res, {
    message: 'Login successful',
    user,
    token
  });
});

/**
 * Logout user
 */
const logout = asyncHandler(async (req, res) => {
  // Invalidate token in Redis (if using refresh tokens)
  // For now, client-side token removal is sufficient
  return success(res, {
    message: 'Logout successful'
  });
});

/**
 * Refresh token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const decoded = jwtService.verifyToken(token);
  if (!decoded) {
    throw new AppError('Invalid token', 401);
  }

  const user = await User.findByPk(decoded.userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const newToken = jwtService.generateToken({
    userId: user.id,
    role: user.role,
    institutionId: user.institutionId
  });

  return success(res, {
    token: newToken
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

  return success(res, { user });
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
      where: { email, id: { $ne: userId } }
    });
    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }
    user.email = email;
  }

  await user.save();

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
