/**
 * Axios HTTP client with interceptors for auth token management
 *
 * - Attaches x-client-type: app header on every request
 * - Attaches Bearer token from secure storage
 * - Handles 401 by attempting silent token refresh
 */
import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL, API_ENDPOINTS, CLIENT_HEADERS } from '../constants/api';
import { storage } from './storage';
import type { ApiResponse, RefreshTokenResponse } from '../types';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: CLIENT_HEADERS,
});

/** Flag to prevent multiple concurrent refresh attempts */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request interceptor: attach access token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle 401 with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh on 401 and if we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until the token is refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Get active vendor ID from store to maintain context on refresh
        const { activeVendorId } = (await import('../stores/auth.store'))
          .useAuthStore.getState();

        const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
          `${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`,
          {
            refreshToken,
            vendorId: activeVendorId || undefined,
          },
          { headers: CLIENT_HEADERS },
        );

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        await storage.setAccessToken(accessToken);
        await storage.setRefreshToken(newRefreshToken);

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear tokens — user needs to re-authenticate
        await storage.clearAll();
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
