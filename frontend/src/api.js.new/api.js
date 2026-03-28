import axios from 'axios';

// Central place to configure the Mentora backend URL.
// If you deploy to another host, change this (or wire it to env vars).
export const API_BASE_URL =
  import.meta.env.VITE_MENTORA_API_BASE_URL || 'http://localhost:4000/api';

export const mentoraApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach token automatically for "normal app" UX.
mentoraApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('mentora_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Attach Authorization header when a token is available.
 * Does not mutate the shared axios instance config, only the request.
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
 * Normalizes axios errors into a consistent Error type
 * with a user-friendly message.
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
    return new Error('Network error – unable to reach Mentora API. Please try again.');
  }

  return new Error(error.message || fallbackMessage);
}

