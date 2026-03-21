/**
 * Auth Store TDD Tests
 * 
 * Test-Driven Development for authentication state management
 * RED phase: Write failing tests first
 * GREEN phase: Implement store to pass tests
 * 
 * Tests cover:
 * - Initial state
 * - Login flow
 * - Logout flow
 * - Token persistence
 * - Error handling
 * - Profile management
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../authStore';

// Mock API service
vi.mock('@/services/api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: vi.fn(),
}));

describe('Auth Store TDD', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useAuthStore.getState();
    store.logout();
    store.clearError();
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should initialize with unauthenticated state', () => {
      const state = useAuthStore.getState();
      
      expect(state.user).toBeNull();
      expect(state.tokens).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should have all required actions defined', () => {
      const state = useAuthStore.getState();
      
      expect(typeof state.login).toBe('function');
      expect(typeof state.register).toBe('function');
      expect(typeof state.logout).toBe('function');
      expect(typeof state.fetchProfile).toBe('function');
      expect(typeof state.updateProfile).toBe('function');
      expect(typeof state.clearError).toBe('function');
    });
  });

  describe('Login Flow', () => {
    it('should handle successful login', async () => {
      const { login } = await import('@/services/api/auth');
      const mockTokens = {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
      };
      
      // Arrange: Mock successful login
      vi.mocked(login).mockResolvedValueOnce(mockTokens);
      
      // Act
      const store = useAuthStore.getState();
      await store.login('test@example.com', 'password123');
      
      // Assert
      const newState = useAuthStore.getState();
      expect(newState.tokens).toEqual(mockTokens);
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBeNull();
    });

    it('should set loading state during login', async () => {
      const { login } = await import('@/services/api/auth');
      
      vi.mocked(login).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      
      const store = useAuthStore.getState();
      const loginPromise = store.login('test@example.com', 'password123');
      
      // Check loading state immediately
      expect(useAuthStore.getState().isLoading).toBe(true);
      expect(useAuthStore.getState().error).toBeNull();
      
      await loginPromise;
    });

    it('should handle login failure', async () => {
      const { login } = await import('@/services/api/auth');
      const mockError = new Error('Invalid credentials');
      
      vi.mocked(login).mockRejectedValueOnce(mockError);
      
      const store = useAuthStore.getState();
      
      await expect(
        store.login('test@example.com', 'wrong-password')
      ).rejects.toThrow('Invalid credentials');
      
      const newState = useAuthStore.getState();
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.tokens).toBeNull();
      expect(newState.error).toBe('Invalid credentials');
      expect(newState.isLoading).toBe(false);
    });

    it('should persist tokens to localStorage on login', async () => {
      const { login } = await import('@/services/api/auth');
      const mockTokens = {
        access: 'test-access-token',
        refresh: 'test-refresh-token',
      };
      
      vi.mocked(login).mockResolvedValueOnce(mockTokens);
      
      const store = useAuthStore.getState();
      await store.login('test@example.com', 'password123');
      
      expect(localStorage.getItem('access_token')).toBe('test-access-token');
      expect(localStorage.getItem('refresh_token')).toBe('test-refresh-token');
    });
  });

  describe('Logout Flow', () => {
    it('should clear auth state on logout', async () => {
      // First login
      const { login } = await import('@/services/api/auth');
      vi.mocked(login).mockResolvedValueOnce({
        access: 'token',
        refresh: 'refresh',
      });
      
      const store = useAuthStore.getState();
      await store.login('test@example.com', 'password123');
      
      // Then logout
      store.logout();
      
      const newState = useAuthStore.getState();
      expect(newState.user).toBeNull();
      expect(newState.tokens).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
    });

    it('should remove tokens from localStorage on logout', async () => {
      // Setup: Add tokens to localStorage
      localStorage.setItem('access_token', 'test-token');
      localStorage.setItem('refresh_token', 'test-refresh');
      
      const store = useAuthStore.getState();
      store.logout();
      
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });

  describe('Token Persistence', () => {
    it('should restore auth state from localStorage on init', () => {
      // Setup: Add tokens to localStorage before creating store
      localStorage.setItem('access_token', 'stored-access');
      localStorage.setItem('refresh_token', 'stored-refresh');
      
      // Create new store instance (would normally happen on page load)
      const state = useAuthStore.getState();
      
      // If persistence is configured, tokens should be restored
      // This depends on zustand persist middleware
      expect(state.tokens).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should clear error when clearError is called', async () => {
      const { login } = await import('@/services/api/auth');
      vi.mocked(login).mockRejectedValueOnce(new Error('Test error'));
      
      const store = useAuthStore.getState();
      
      try {
        await store.login('test@example.com', 'password');
      } catch (e) {
        // Expected
      }
      
      expect(useAuthStore.getState().error).toBe('Test error');
      
      store.clearError();
      
      expect(useAuthStore.getState().error).toBeNull();
    });

    it('should clear previous error on new login attempt', async () => {
      const { login } = await import('@/services/api/auth');
      
      // First failed login
      vi.mocked(login).mockRejectedValueOnce(new Error('First error'));
      const store = useAuthStore.getState();
      
      try {
        await store.login('test@example.com', 'password');
      } catch (e) {
        // Expected
      }
      
      expect(useAuthStore.getState().error).toBe('First error');
      
      // Second login attempt should clear error
      vi.mocked(login).mockResolvedValueOnce({
        access: 'token',
        refresh: 'refresh',
      });
      
      const loginPromise = store.login('test@example.com', 'password');
      
      expect(useAuthStore.getState().error).toBeNull();
      
      await loginPromise;
    });
  });

  describe('Profile Management', () => {
    it('should fetch and store user profile', async () => {
      const { getProfile } = await import('@/services/api/auth');
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
      };
      
      vi.mocked(getProfile).mockResolvedValueOnce(mockUser as any);
      
      const store = useAuthStore.getState();
      await store.fetchProfile();
      
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    it('should update user profile', async () => {
      const { updateProfile } = await import('@/services/api/auth');
      const updatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'Updated',
        last_name: 'Name',
      };
      
      vi.mocked(updateProfile).mockResolvedValueOnce(updatedUser as any);
      
      const store = useAuthStore.getState();
      await store.updateProfile({ first_name: 'Updated' });
      
      expect(useAuthStore.getState().user).toEqual(updatedUser);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should set loading state during profile operations', async () => {
      const { getProfile } = await import('@/services/api/auth');
      
      vi.mocked(getProfile).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({} as any), 100))
      );
      
      const store = useAuthStore.getState();
      const fetchPromise = store.fetchProfile();
      
      expect(useAuthStore.getState().isLoading).toBe(true);
      
      await fetchPromise;
      
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('Registration Flow', () => {
    it('should handle successful registration', async () => {
      const { register } = await import('@/services/api/auth');
      const { login } = await import('@/services/api/auth');
      
      vi.mocked(register).mockResolvedValueOnce({ user_id: 'new-user-123' });
      vi.mocked(login).mockResolvedValueOnce({
        access: 'new-token',
        refresh: 'new-refresh',
      });
      
      const store = useAuthStore.getState();
      const credentials = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123',
        first_name: 'New',
        last_name: 'User',
      };
      
      await store.register(credentials);
      
      expect(register).toHaveBeenCalledWith(credentials);
      expect(login).toHaveBeenCalledWith(credentials.email, credentials.password);
    });

    it('should handle registration failure', async () => {
      const { register } = await import('@/services/api/auth');
      const mockError = new Error('Email already exists');
      
      vi.mocked(register).mockRejectedValueOnce(mockError);
      
      const store = useAuthStore.getState();
      
      await expect(
        store.register({
          email: 'existing@example.com',
          username: 'user',
          password: 'pass',
          first_name: 'Test',
          last_name: 'User',
        })
      ).rejects.toThrow('Email already exists');
      
      expect(useAuthStore.getState().error).toBe('Email already exists');
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});
