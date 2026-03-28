import React, { createContext, useState, useContext, useEffect } from 'react';
import { dhaminiApi, storeTokens, clearTokens, getToken, toReadableError } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Check for existing token on mount
  useEffect(() => {
    const token = getToken();
    const storedUser = localStorage.getItem('dhamini_user');
    const storedRole = localStorage.getItem('dhamini_role');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setUserRole(storedRole);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        clearTokens();
      }
    }
  }, []);

  /**
   * Login user with phone and password
   * @param {string} phone - User's phone number
   * @param {string} password - User's password
   * @returns {Object} Response with success flag
   */
  const login = async (phone, password) => {
    setLoading(true);
    try {
      const response = await dhaminiApi.post('/auth/login', { phone, password });

      const { user, token, refreshToken } = response.data;

      // Store tokens and user data
      storeTokens(token, refreshToken);
      localStorage.setItem('dhamini_user', JSON.stringify(user));
      localStorage.setItem('dhamini_role', user.role);

      setUser(user);
      setUserRole(user.role);

      return { success: true, user };
    } catch (error) {
      const readableError = toReadableError(error, 'Login failed');
      return { success: false, error: readableError.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Object} Response with success flag
   */
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await dhaminiApi.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      const readableError = toReadableError(error, 'Registration failed');
      return { success: false, error: readableError.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify phone number with OTP
   * @param {string} phone - Phone number to verify
   * @param {string} otp - OTP code received
   * @returns {Object} Response with success flag
   */
  const verifyOTP = async (phone, otp) => {
    setLoading(true);
    try {
      const response = await dhaminiApi.post('/auth/verify-otp', { phone, otp });
      return { success: true, data: response.data };
    } catch (error) {
      const readableError = toReadableError(error, 'OTP verification failed');
      return { success: false, error: readableError.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user and clear session
   */
  const logout = () => {
    try {
      // Call logout endpoint
      dhaminiApi.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state
      setUser(null);
      setUserRole(null);
      clearTokens();
      localStorage.removeItem('dhamini_user');
      localStorage.removeItem('dhamini_role');
    }
  };

  /**
   * Fetch and update user profile
   * @returns {Object} Response with success flag
   */
  const fetchProfile = async () => {
    try {
      const response = await dhaminiApi.get('/auth/profile');
      const userData = response.data.user;

      setUser(userData);
      setUserRole(userData.role);
      localStorage.setItem('dhamini_user', JSON.stringify(userData));
      localStorage.setItem('dhamini_role', userData.role);

      return { success: true, user: userData };
    } catch (error) {
      const readableError = toReadableError(error, 'Failed to fetch profile');
      return { success: false, error: readableError.message };
    }
  };

  const value = {
    user,
    userRole,
    loading,
    login,
    register,
    verifyOTP,
    logout,
    fetchProfile,
    isAuthenticated: !!user,
    isBorrower: userRole === 'borrower',
    isLender: userRole === 'lender',
    isAdmin: userRole === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;