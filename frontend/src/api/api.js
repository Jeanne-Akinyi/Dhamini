/**
 * Dhamini API Client
 *
 * This module configures Axios client for communicating with Dhamini backend API.
 *
 * Environment Variables:
 * - VITE_API_BASE_URL: Production backend URL (e.g., https://dhamini-backend.onrender.com/api)
 * If not set, defaults to localhost:4000 for development.
 *
 * Usage:
 *   import { dhaminiApi, withAuth } from '@/api/api';
 *
 *   // Authenticated request (automatic token)
 *   const response = await dhaminiApi.get('/auth/profile');
 *
 *   // Manual auth header
 *   const response = await axios.get('/api/loans', withAuth(token));
 */

import axios from 'axios';

// Central place to configure Dhamini backend URL.
// If you deploy to another host, change this (or wire it to env vars).
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Base API URL without /api suffix (for some endpoints)
export const API_ROOT = API_BASE_URL.replace(/\/api$/, '');

// Create axios instance with default configuration
export const dhaminiApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach token automatically for authenticated requests
dhaminiApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('dhamini_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors globally
dhaminiApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear token and redirect to login
      localStorage.removeItem('dhamini_token');
      localStorage.removeItem('dhamini_refresh_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Attach Authorization header when a token is available.
 * Does not mutate shared axios instance config, only request.
 *
 * @param {string} token - JWT token
 * @returns {object} Headers object with Authorization
 */
export function withAuth(token) {
  if (!token) return {};
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

/**
 * Store authentication tokens in localStorage
 *
 * @param {string} token - Access token
 * @param {string} refreshToken - Refresh token (optional)
 */
export function storeTokens(token, refreshToken = null) {
  localStorage.setItem('dhamini_token', token);
  if (refreshToken) {
    localStorage.setItem('dhamini_refresh_token', refreshToken);
  }
}

/**
 * Clear authentication tokens from localStorage
 */
export function clearTokens() {
  localStorage.removeItem('dhamini_token');
  localStorage.removeItem('dhamini_refresh_token');
}

/**
 * Get stored access token
 *
 * @returns {string|null} JWT token or null
 */
export function getToken() {
  return localStorage.getItem('dhamini_token');
}

/**
 * Get stored refresh token
 *
 * @returns {string|null} Refresh token or null
 */
export function getRefreshToken() {
  return localStorage.getItem('dhamini_refresh_token');
}

/**
 * Check if user is authenticated
 *
 * @returns {boolean} True if token exists
 */
export function isAuthenticated() {
  return !!localStorage.getItem('dhamini_token');
}

/**
 * Normalizes axios errors into a consistent Error type
 * with a user-friendly message.
 *
 * @param {Error} error - Axios error object
 * @param {string} fallbackMessage - Default error message
 * @returns {Error} Normalized error with user-friendly message
 */
export function toReadableError(error, fallbackMessage = 'Something went wrong') {
  if (error.response) {
    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      `${fallbackMessage} (status ${error.response.status})`;
    return new Error(message);
  }

  if (error.request) {
    return new Error('Network error – unable to reach Dhamini API. Please check your connection and try again.');
  }

  return new Error(error.message || fallbackMessage);
}

/**
 * API endpoints object for easy reference
 */
export const API_ENDPOINTS = {
  // Authentication
  REGISTER: '/auth/register',
  VERIFY_PHONE: '/auth/verify-phone',
  VERIFY_OTP: '/auth/verify-otp',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  PROFILE: '/auth/profile',
  UPDATE_PROFILE: '/auth/profile',

  // KYC
  KYC_TIER1: '/kyc/tier1',
  KYC_TIER2: '/kyc/tier2',
  KYC_TIER3: '/kyc/tier3',
  KYC_STATUS: '/kyc/status',
  KYC_ALL: '/kyc/all',
  KYC_APPROVE: '/kyc/approve',
  KYC_REJECT: '/kyc/reject',

  // Loans
  LOANS: '/loans',
  LOAN_BY_ID: '/loans/:loanId',
  LOAN_APPROVE: '/loans/:loanId/approve',
  LOAN_DISBURSE: '/loans/:loanId/disburse',
  LOAN_REJECT: '/loans/:loanId/reject',
  MY_LOANS: '/loans/my-loans',

  // Mandates
  MANDATES: '/loans/:loanId/mandates',
  MANDATE_BY_ID: '/mandates/:mandateId',
  MANDATE_VERIFY: '/mandates/:mandateId/verify-otp',
  MY_MANDATES: '/mandates/my-mandates',

  // Repayments
  REPAYMENTS_PROCESS: '/repayments/process',
  REPAYMENT_RETRY: '/repayments/:repaymentId/retry',
  REPAYMENT_MANUAL: '/repayments/manual',
  REPAYMENTS_MPESA_CALLBACK: '/repayments/mpesa/callback',
  REPAYMENTS: '/repayments',
  REPAYMENTS_BY_LOAN: '/repayments/loan/:loanId',
  REPAYMENTS_BY_MANDATE: '/repayments/mandate/:mandateId',

  // Credit Score
  CREDIT_SCORE: '/credit-score',
  CREDIT_SCORE_USER: '/credit-score/user/:userId',
  CREDIT_SCORE_UPDATE: '/credit-score/:userId',
  CREDIT_SCORE_HISTORY: '/credit-score/:userId/history',
  CREDIT_SCORE_STATISTICS: '/credit-score/statistics',
  CREDIT_SCORE_CRB_CHECK: '/credit-score/crb-check',

  // Health
  HEALTH: '/health',
};
