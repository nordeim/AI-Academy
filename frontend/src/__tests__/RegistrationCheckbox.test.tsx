/**
 * Registration Checkbox Validation Test
 * 
 * Test case to verify that the checkbox sends boolean value
 * instead of string "on"
 * 
 * @module __tests__/RegistrationCheckbox.test.tsx
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RegisterPage } from '@/pages/RegisterPage';

// Mock useAuthStore
vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    register: vi.fn(),
    isLoading: false,
    error: null,
    clearError: vi.fn(),
    isAuthenticated: false,
  })),
}));

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Registration Checkbox Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Checkbox Value Handling', () => {
    it('should not show validation error when checkbox is checked', async () => {
      const user = userEvent.setup();
      
      render(<RegisterPage />, { wrapper: createWrapper() });

      // Fill form
      const emailInput = screen.getByLabelText(/Email/i);
      const usernameInput = screen.getByLabelText(/Username/i);
      const passwordInput = screen.getByLabelText(/^Password$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
      const checkbox = screen.getByRole('checkbox');

      await user.type(emailInput, 'test@example.com');
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'TestPass123!');
      await user.type(confirmPasswordInput, 'TestPass123!');
      await user.click(checkbox);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Create account/i });
      await user.click(submitButton);

      // Should NOT show "expected boolean, received string" error
      await waitFor(() => {
        expect(screen.queryByText(/expected boolean, received string/i)).not.toBeInTheDocument();
      });
    });

    it('should show validation error when checkbox is not checked', async () => {
      const user = userEvent.setup();
      
      render(<RegisterPage />, { wrapper: createWrapper() });

      // Fill form without checking checkbox
      const emailInput = screen.getByLabelText(/Email/i);
      const usernameInput = screen.getByLabelText(/Username/i);
      const passwordInput = screen.getByLabelText(/^Password$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'TestPass123!');
      await user.type(confirmPasswordInput, 'TestPass123!');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Create account/i });
      await user.click(submitButton);

      // Should show "You must accept the terms" error
      await waitFor(() => {
        expect(screen.getByText(/You must accept the terms/i)).toBeInTheDocument();
      });
    });

    it('should convert checkbox value to boolean before submission', async () => {
      const user = userEvent.setup();
      const mockRegister = vi.fn();
      
      vi.mocked(await import('@/store/authStore')).useAuthStore.mockReturnValue({
        register: mockRegister,
        isLoading: false,
        error: null,
        clearError: vi.fn(),
        isAuthenticated: false,
      } as any);
      
      render(<RegisterPage />, { wrapper: createWrapper() });

      // Fill form and check checkbox
      const emailInput = screen.getByLabelText(/Email/i);
      const usernameInput = screen.getByLabelText(/Username/i);
      const passwordInput = screen.getByLabelText(/^Password$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
      const checkbox = screen.getByRole('checkbox');

      await user.type(emailInput, 'test@example.com');
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'TestPass123!');
      await user.type(confirmPasswordInput, 'TestPass123!');
      await user.click(checkbox);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Create account/i });
      await user.click(submitButton);

      // Verify register was called with correct data
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(expect.objectContaining({
          email: 'test@example.com',
          username: 'testuser',
        }));
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      const user = userEvent.setup();
      
      render(<RegisterPage />, { wrapper: createWrapper() });

      const emailInput = screen.getByLabelText(/Email/i);
      const submitButton = screen.getByRole('button', { name: /Create account/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
      });
    });

    it('should validate password length', async () => {
      const user = userEvent.setup();
      
      render(<RegisterPage />, { wrapper: createWrapper() });

      const passwordInput = screen.getByLabelText(/^Password$/i);
      const submitButton = screen.getByRole('button', { name: /Create account/i });

      await user.type(passwordInput, 'short');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate password confirmation', async () => {
      const user = userEvent.setup();
      
      render(<RegisterPage />, { wrapper: createWrapper() });

      const passwordInput = screen.getByLabelText(/^Password$/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
      const submitButton = screen.getByRole('button', { name: /Create account/i });

      await user.type(passwordInput, 'TestPass123!');
      await user.type(confirmPasswordInput, 'DifferentPass123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
      });
    });
  });
});
