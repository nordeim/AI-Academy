/**
 * Auth API Service
 * 
 * API methods for authentication-related endpoints
 */
import { apiClient, extractApiError, ApiResponse, setTokens, clearTokens } from './client';
import {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterCredentials,
  RegisterResponse,
  UpdateProfilePayload,
  PasswordResetRequest,
  PasswordResetConfirm,
} from '@/types/auth';

const AUTH_ENDPOINT = '/auth/';
const USERS_ENDPOINT = '/users/';

/**
 * Login user with credentials
 * Stores tokens in localStorage on success
 * 
 * @param credentials - Login credentials (email, password)
 * @returns Promise with auth tokens
 * 
 * TDD Test Cases:
 * - Should return tokens on valid credentials
 * - Should throw error on invalid credentials
 * - Should store tokens in localStorage
 * - Should handle 429 rate limit
 */
export async function login(
  credentials: LoginCredentials
): Promise<AuthTokens> {
  try {
    const response = await apiClient.post<AuthTokens>(
      `${AUTH_ENDPOINT}token/`,
      credentials
    );
    
    // Store tokens
    const { access, refresh } = response.data;
    setTokens(access, refresh);
    
    return response.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

/**
 * Register new user
 * 
 * @param credentials - Registration data
 * @returns Promise with user ID
 * 
 * TDD Test Cases:
 * - Should create user on valid data
 * - Should throw validation error on duplicate email
 * - Should validate password requirements
 */
export async function register(
  credentials: RegisterCredentials
): Promise<RegisterResponse> {
  try {
    const response = await apiClient.post<ApiResponse<RegisterResponse>>(
      `${AUTH_ENDPOINT}register/`,
      credentials
    );
    return response.data.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

/**
 * Refresh access token
 * 
 * @param refreshToken - Refresh token
 * @returns Promise with new access token
 * 
 * TDD Test Cases:
 * - Should return new access token
 * - Should throw error on invalid refresh token
 */
export async function refreshToken(refreshToken: string): Promise<{ access: string }> {
  try {
    const response = await apiClient.post<{ access: string }>(
      `${AUTH_ENDPOINT}token/refresh/`,
      { refresh: refreshToken }
    );
    
    // Update stored access token
    localStorage.setItem('access_token', response.data.access);
    
    return response.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

/**
 * Get current user profile
 * 
 * @returns Promise with user data
 * 
 * TDD Test Cases:
 * - Should return user profile when authenticated
 * - Should throw 401 when not authenticated
 */
export async function getProfile(): Promise<User> {
  try {
    const response = await apiClient.get<ApiResponse<User>>(
      `${USERS_ENDPOINT}me/`
    );
    return response.data.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

/**
 * Update user profile
 * 
 * @param data - Partial user data to update
 * @returns Promise with updated user
 * 
 * TDD Test Cases:
 * - Should update allowed fields
 * - Should reject updates to read-only fields
 * - Should return updated user data
 */
export async function updateProfile(
  data: UpdateProfilePayload
): Promise<User> {
  try {
    const response = await apiClient.patch<ApiResponse<User>>(
      `${USERS_ENDPOINT}me/`,
      data
    );
    return response.data.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

/**
 * Request password reset
 * 
 * @param data - Password reset request with email
 * @returns Promise with success message
 * 
 * TDD Test Cases:
 * - Should return success even if email doesn't exist (security)
 * - Should send reset email for valid user
 */
export async function requestPasswordReset(
  data: PasswordResetRequest
): Promise<{ message: string }> {
  try {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${AUTH_ENDPOINT}password-reset/`,
      data
    );
    return response.data.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

/**
 * Confirm password reset
 * 
 * @param data - Reset confirmation with token, uid, new password
 * @returns Promise with success message
 * 
 * TDD Test Cases:
 * - Should reset password with valid token
 * - Should reject invalid token
 * - Should reject expired token
 */
export async function confirmPasswordReset(
  data: PasswordResetConfirm
): Promise<{ message: string }> {
  try {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${AUTH_ENDPOINT}password-reset/confirm/`,
      data
    );
    return response.data.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

/**
 * Logout user
 * Clears tokens from localStorage
 */
export function logout(): void {
  clearTokens();
}

/**
 * Check if user is authenticated
 * @returns boolean
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('access_token');
}
