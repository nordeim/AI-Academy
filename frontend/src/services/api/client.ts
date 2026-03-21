/**
 * API Client Configuration
 * 
 * Axios instance with interceptors for authentication, error handling,
 * and automatic token refresh.
 * 
 * Features:
 * - Automatic Authorization header injection
 * - JWT token refresh on 401 responses
 * - Standardized error handling
 * - Request/response logging (dev mode)
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Helper functions for token management
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (access: string, refresh: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.params || '');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // If error is not 401 or request has no config, reject immediately
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }
    
    // If already retrying, don't retry again
    if (originalRequest._retry) {
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    originalRequest._retry = true;
    
    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }
    
    isRefreshing = true;
    
    try {
      const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      // Attempt to refresh token
      const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
        refresh: refreshToken,
      });
      
      const { access } = response.data;
      
      // Update stored token
      localStorage.setItem(ACCESS_TOKEN_KEY, access);
      
      // Update authorization header
      apiClient.defaults.headers.common.Authorization = `Bearer ${access}`;
      originalRequest.headers.Authorization = `Bearer ${access}`;
      
      // Process queued requests
      processQueue(null, access);
      
      // Retry original request
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh failed, clear tokens and redirect to login
      processQueue(refreshError as Error, null);
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// API Response wrapper type
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: Record<string, string[]>;
  meta: {
    timestamp: string;
    request_id: string;
    pagination?: {
      count: number;
      page: number;
      pages: number;
      page_size: number;
      has_next: boolean;
      has_previous: boolean;
    };
  };
}

// Paginated response helper type
export interface PaginatedData<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Error handling helper
export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]>;
  requestId: string;

  constructor(
    message: string,
    status: number,
    errors: Record<string, string[]> = {},
    requestId: string = ''
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.requestId = requestId;
  }
}

// Extract API error from response
export const extractApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const response = error.response?.data;
    return new ApiError(
      response?.message || error.message,
      error.response?.status || 500,
      response?.errors || {},
      response?.meta?.request_id || ''
    );
  }
  
  if (error instanceof Error) {
    return new ApiError(error.message, 500);
  }
  
  return new ApiError('An unexpected error occurred', 500);
};

export default apiClient;
