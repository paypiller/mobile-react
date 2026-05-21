/**
 * Auth service — API calls matching the backend auth module
 */
import api from '../lib/api';
import { API_ENDPOINTS } from '../constants/api';
import type {
  ApiResponse,
  RequestOtpPayload,
  RequestOtpResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
  CompleteProfilePayload,
  CompleteProfileResponse,
  RefreshTokenResponse,
  VendorsResponse,
} from '../types';

export const authService = {
  /**
   * Request an OTP for the given phone number
   * POST /api/v1/auth/otp/request
   */
  async requestOtp(payload: RequestOtpPayload) {
    const response = await api.post<ApiResponse<RequestOtpResponse>>(
      API_ENDPOINTS.auth.requestOtp,
      payload,
    );
    return response.data;
  },

  /**
   * Verify the OTP
   * POST /api/v1/auth/otp/verify
   * Returns either tokens (login) or tempToken (signup)
   */
  async verifyOtp(payload: VerifyOtpPayload) {
    const response = await api.post<ApiResponse<VerifyOtpResponse>>(
      API_ENDPOINTS.auth.verifyOtp,
      payload,
    );
    return response.data;
  },

  /**
   * Complete user profile after OTP signup
   * POST /api/v1/auth/profile/complete
   */
  async completeProfile(payload: CompleteProfilePayload) {
    const response = await api.post<ApiResponse<CompleteProfileResponse>>(
      API_ENDPOINTS.auth.completeProfile,
      payload,
    );
    return response.data;
  },

  /**
   * Get the list of vendors for the authenticated user
   * GET /api/v1/auth/vendors
   */
  async getVendors(params?: { page?: number; limit?: number; search?: string }) {
    const response = await api.get<ApiResponse<VendorsResponse>>(
      API_ENDPOINTS.vendor.list,
      { params }
    );
    return response.data;
  },

  /**
   * Logout — revoke refresh token
   * POST /api/v1/auth/logout
   */
  async logout(refreshToken: string) {
    const response = await api.post(API_ENDPOINTS.auth.logout, {
      refreshToken,
    });
    return response.data;
  },

  /**
   * Refresh access token, optionally with a new vendorId context
   * POST /api/v1/auth/refresh
   */
  async refreshToken(payload: { refreshToken?: string; vendorId?: number }) {
    const response = await api.post<ApiResponse<RefreshTokenResponse>>(
      API_ENDPOINTS.auth.refresh,
      payload,
    );
    return response.data;
  },
};
