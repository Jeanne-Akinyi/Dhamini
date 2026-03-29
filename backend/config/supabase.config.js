/**
 * Supabase Client Configuration
 * 
 * This module configures the Supabase client for both database operations
 * and authentication services.
 * 
 * For database operations: Uses Supabase via PostgreSQL connection string
 * For authentication: Uses Supabase Auth SDK for OTP-based auth
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Check if Supabase is properly configured (not placeholder values)
const isSupabaseConfigured = supabaseUrl && 
  supabaseServiceKey && 
  !supabaseUrl.includes('placeholder') && 
  !supabaseServiceKey.includes('placeholder');

// Create mock clients for when Supabase is not configured
let supabaseAdmin = null;
let supabaseClient = null;

if (isSupabaseConfigured) {
  try {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.warn('WARNING: Failed to initialize Supabase client:', error.message);
  }
} else {
  console.warn('WARNING: Supabase not configured - OTP features will be disabled');
  console.warn('   Please set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in .env');
  
  // Create mock clients that return appropriate errors
  supabaseAdmin = {
    auth: {
      admin: {
        getUserById: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
        updateUserById: async () => ({ data: { user: null }, error: null })
      }
    }
  };
  supabaseClient = {
    auth: {
      signInWithOtp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      verifyOtp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      refreshSession: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: null })
    }
  };
}

/**
 * Send OTP to user's phone number using Supabase Auth
 * 
 * @param {string} phone - Phone number in international format (e.g., +254712345678)
 * @returns {Promise<Object>} Response with success flag
 */
const sendOTP = async (phone) => {
  try {
    const { data, error } = await supabaseClient.auth.signInWithOtp({
      phone: phone
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'OTP sent successfully',
      data: data
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify OTP and get user session
 * 
 * @param {string} phone - Phone number used for OTP
 * @param {string} token - OTP token received
 * @returns {Promise<Object>} Response with session data
 */
const verifyOTP = async (phone, token) => {
  try {
    const { data, error } = await supabaseClient.auth.verifyOtp({
      phone: phone,
      token: token,
      type: 'sms'
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      session: data.session,
      user: data.user
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get user by ID from Supabase
 * 
 * @param {string} userId - User ID from Supabase Auth
 * @returns {Promise<Object>} User data
 */
const getUserById = async (userId) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (error) {
      throw error;
    }

    return {
      success: true,
      user: data.user
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update user metadata
 * 
 * @param {string} userId - User ID
 * @param {Object} metadata - Metadata to update
 * @returns {Promise<Object>} Updated user data
 */
const updateUserMetadata = async (userId, metadata) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { user_metadata: metadata }
    );

    if (error) {
      throw error;
    }

    return {
      success: true,
      user: data.user
    };
  } catch (error) {
    console.error('Error updating user metadata:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sign out user
 * 
 * @param {string} accessToken - User's access token
 * @returns {Promise<Object>} Response
 */
const signOut = async (accessToken) => {
  try {
    const { error } = await supabaseClient.auth.signOut({
      accessToken: accessToken
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'Signed out successfully'
    };
  } catch (error) {
    console.error('Error signing out:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Refresh session
 * 
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New session data
 */
const refreshSession = async (refreshToken) => {
  try {
    const { data, error } = await supabaseClient.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      session: data.session
    };
  } catch (error) {
    console.error('Error refreshing session:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create user in Supabase Auth (admin API)
 * Creates user directly without OTP
 * 
 * @param {string} phone - Phone number
 * @param {Object} metadata - User metadata (firstName, lastName, role)
 * @returns {Promise<Object>} Created user data
 */
const createUser = async (phone, metadata = {}) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      phone: phone,
      phone_confirm: true,
      user_metadata: metadata
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      user: data.user
    };
  } catch (error) {
    console.error('Error creating user in Supabase:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete user from Supabase Auth
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Response
 */
const deleteUser = async (userId) => {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'User deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting user from Supabase:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  supabaseAdmin,
  supabaseClient,
  sendOTP,
  verifyOTP,
  getUserById,
  updateUserMetadata,
  signOut,
  refreshSession,
  createUser,
  deleteUser
};