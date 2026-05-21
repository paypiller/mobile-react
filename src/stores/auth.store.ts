/**
 * Global auth store using Zustand
 *
 * Manages authentication state, token lifecycle, and vendor selection.
 * Persists tokens via expo-secure-store (not zustand persist — we need
 * async secure storage, which zustand's persist middleware doesn't support
 * natively without adapters).
 */
import { create } from 'zustand';
import { storage } from '../lib/storage';
import { authService } from '../services/auth.service';
import type { User, Vendor, VerifyOtpLoginResponse } from '../types';

interface AuthState {
  // State
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  vendors: Vendor[];
  activeVendorId: number | null;
  vendorPage: number;
  vendorHasMore: boolean;
  isFetchingMoreVendors: boolean;

  // OTP flow
  otpPurpose: string | null;
  tempToken: string | null;

  // Actions
  initialize: () => Promise<void>;
  requestOtp: (phone: string) => Promise<string>;
  verifyOtp: (phone: string, otp: string, purpose: string) => Promise<'login' | 'signup' | 'vendor_setup'>;
  completeProfile: (data: {
    firstName: string;
    lastName: string;
    vendorName: string;
    email?: string;
  }) => Promise<void>;
  completeVendorSetup: (data: {
    vendorName: string;
  }) => Promise<void>;
  fetchVendors: (refresh?: boolean) => Promise<Vendor[]>;
  selectVendor: (vendorId: number) => void;
  switchVendor: (vendorId: number) => Promise<void>;
  forceLogout: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoading: true,
  isAuthenticated: false,
  user: null,
  vendors: [],
  activeVendorId: null,
  vendorPage: 1,
  vendorHasMore: true,
  isFetchingMoreVendors: false,
  otpPurpose: null,
  tempToken: null,

  /**
   * Initialize auth state from secure storage on app boot.
   * Ensures a vendor is always selected; force-logs out if none available.
   */
  initialize: async () => {
    try {
      const [accessToken, userData] = await Promise.all([
        storage.getAccessToken(),
        storage.getUserData(),
      ]);

      if (accessToken && userData) {
        set({
          isAuthenticated: true,
          user: userData as unknown as User,
        });

        // Ensure vendor context exists
        try {
          const response = await authService.getVendors({ page: 1, limit: 15 });
          const vendors = response.data.vendors;
          set({ 
            vendors,
            vendorPage: 1,
            vendorHasMore: vendors.length < (response.data.total || vendors.length)
          });

          if (vendors.length === 0) {
            // No vendors — force logout
            await get().forceLogout();
            return;
          }

          // Auto-switch to first vendor if none active
          if (!get().activeVendorId) {
            const firstVendorId = vendors[0].vendor.id;
            try {
              await get().switchVendor(firstVendorId);
            } catch {
              // Switch failed — force logout
              await get().forceLogout();
              return;
            }
          }
        } catch {
          // Failed to fetch vendors — force logout
          await get().forceLogout();
          return;
        }

        set({ isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      await get().forceLogout();
    }
  },

  /**
   * Step 1: Request OTP
   */
  requestOtp: async (phone: string) => {
    const response = await authService.requestOtp({ phone, type: 'vendor' });
    const purpose = response.data.purpose;
    set({ otpPurpose: purpose });
    return purpose;
  },

  /**
   * Step 2: Verify OTP
   * If login → save tokens and user, return 'login'
   * If signup → save tempToken, return 'signup'
   */
  verifyOtp: async (phone: string, otp: string, purpose: string) => {
    const response = await authService.verifyOtp({ phone, otp, purpose });
    const data = response.data;

    if ('isNewUser' in data && data.isNewUser === true) {
      set({ tempToken: data.tempToken });
      return 'signup';
    }

    if ('needsVendorSetup' in data && data.needsVendorSetup === true) {
      set({ tempToken: data.tempToken });
      return 'vendor_setup';
    }

    // Login success
    const loginData = data as VerifyOtpLoginResponse;
    await Promise.all([
      storage.setAccessToken(loginData.accessToken),
      storage.setRefreshToken(loginData.refreshToken),
      storage.setUserData(loginData.user as unknown as Record<string, unknown>),
    ]);

    set({
      isAuthenticated: true,
      user: loginData.user,
      otpPurpose: null,
    });

    return 'login';
  },

  /**
   * Step 3 (signup only): Complete profile
   */
  completeProfile: async (data) => {
    const { tempToken } = get();
    if (!tempToken) throw new Error('No temp token available');

    const response = await authService.completeProfile({
      ...data,
      tempToken,
    });

    const { accessToken, refreshToken, user } = response.data;

    await Promise.all([
      storage.setAccessToken(accessToken),
      storage.setRefreshToken(refreshToken),
      storage.setUserData(user as unknown as Record<string, unknown>),
    ]);

    set({
      isAuthenticated: true,
      user,
      tempToken: null,
      otpPurpose: null,
    });
  },

  /**
   * Step 3 (vendor setup only): Complete vendor setup
   */
  completeVendorSetup: async (data) => {
    const { tempToken } = get();
    if (!tempToken) throw new Error('No temp token available');

    const response = await authService.completeProfile({
      ...data,
      tempToken,
    });

    const { accessToken, refreshToken, user } = response.data;

    await Promise.all([
      storage.setAccessToken(accessToken),
      storage.setRefreshToken(refreshToken),
      storage.setUserData(user as unknown as Record<string, unknown>),
    ]);

    set({
      isAuthenticated: true,
      user,
      tempToken: null,
      otpPurpose: null,
    });
  },

  /**
   * Fetch the vendors this user has access to
   */
  fetchVendors: async (refresh = false) => {
    const { vendors, vendorPage, vendorHasMore, isFetchingMoreVendors } = get();
    
    // Prevent multiple requests
    if (isFetchingMoreVendors && !refresh) return vendors;
    if (!vendorHasMore && !refresh && vendors.length > 0) return vendors;

    const isFirstFetch = refresh || vendors.length === 0;
    const page = isFirstFetch ? 1 : vendorPage + 1;
    
    if (!isFirstFetch) set({ isFetchingMoreVendors: true });

    try {
      const response = await authService.getVendors({ page, limit: 15 });
      const newVendors = response.data.vendors;
      const total = response.data.total || 0; // Total might not be provided in older API

      const allVendors = isFirstFetch ? newVendors : [...vendors, ...newVendors];

      set({ 
        vendors: allVendors,
        vendorPage: page,
        vendorHasMore: allVendors.length < total,
        isFetchingMoreVendors: false,
      });
      return allVendors;
    } catch (error) {
      set({ isFetchingMoreVendors: false });
      throw error;
    }
  },

  /**
   * Select the active vendor for operations
   */
  selectVendor: (vendorId: number) => {
    set({ activeVendorId: vendorId });
  },

  /**
   * Switch active vendor context by obtaining a new access token
   * uses the backend refresh token logic with requestedVendorId
   */
  switchVendor: async (vendorId: number) => {
    set({ isLoading: true });
    try {
      const oldRefreshToken = await storage.getRefreshToken();
      const response = await authService.refreshToken({
        refreshToken: oldRefreshToken || undefined,
        vendorId,
      });

      const { accessToken, refreshToken } = response.data;

      await Promise.all([
        storage.setAccessToken(accessToken),
        storage.setRefreshToken(refreshToken),
      ]);

      set({
        activeVendorId: vendorId,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * Force logout: clears everything locally without server call.
   * Used when vendor state is invalid or unrecoverable.
   */
  forceLogout: async () => {
    await storage.clearAll();
    set({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      vendors: [],
      activeVendorId: null,
      vendorPage: 1,
      vendorHasMore: true,
      otpPurpose: null,
      tempToken: null,
    });
  },

  /**
   * Logout: revoke refresh token on server, then clear local storage
   */
  logout: async () => {
    try {
      const refreshToken = await storage.getRefreshToken();
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Best-effort server revoke; clear locally regardless
    } finally {
      await storage.clearAll();
      set({
        isAuthenticated: false,
        user: null,
        vendors: [],
        activeVendorId: null,
        vendorPage: 1,
        vendorHasMore: true,
        otpPurpose: null,
        tempToken: null,
      });
    }
  },
}));
