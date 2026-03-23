/**
 * Auth Store
 * 
 * Zustand store for authentication state management
 * Features:
 * - JWT token storage with persistence
 * - Login/logout/registration flows
 * - User profile management
 * - Error handling
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  AuthTokens,
  RegisterCredentials,
  UpdateProfilePayload,
} from '@/types/auth';
import {
  login as loginApi,
  register as registerApi,
  getProfile,
  updateProfile as updateProfileApi,
  logout as logoutApi,
} from '@/services/api/auth';

interface AuthState {
  // State
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfilePayload) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const tokens = await loginApi({ email, password });
          set({ tokens, isAuthenticated: true });
          
          // Fetch user profile after successful login
          await get().fetchProfile();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ error: errorMessage, isAuthenticated: false });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Register action
      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          await registerApi(credentials);
          // Auto-login after registration
          await get().login(credentials.email, credentials.password);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Logout action
      logout: () => {
        logoutApi();
        set({ user: null, tokens: null, isAuthenticated: false, error: null });
      },

      // Fetch user profile
      fetchProfile: async () => {
        try {
          const user = await getProfile();
          set({ user });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
          set({ error: errorMessage });
        }
      },

      // Update user profile
      updateProfile: async (data: UpdateProfilePayload) => {
        set({ isLoading: true, error: null });
        
        try {
          const user = await updateProfileApi(data);
          set({ user });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        tokens: state.tokens, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// Selector hooks for better performance
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
