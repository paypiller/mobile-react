/**
 * API configuration constants
 * Adjust BASE_URL to your backend endpoint
 */

export const API_BASE_URL = 'https://api.paypiller.com';

export const API_ENDPOINTS = {
  auth: {
    requestOtp: '/api/v1/auth/otp/request',
    verifyOtp: '/api/v1/auth/otp/verify',
    completeProfile: '/api/v1/auth/profile/complete',
    refresh: '/api/v1/auth/refresh',
    logout: '/api/v1/auth/logout',
  },
  vendor: {
    list: '/api/v1/vendor/',
  },
  property: {
    list: '/api/v1/property/',
    managed: '/api/v1/property/managed',
    create: '/api/v1/property/create',
    getById: (id: number) => `/api/v1/property/${id}`,
  },
} as const;

export const CLIENT_HEADERS = {
  'x-client-type': 'app',
  'Content-Type': 'application/json',
} as const;
