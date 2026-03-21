/**
 * LoginPage TDD Tests
 *
 * Tests for the login page component
 * Phase 6A - Task 6A.1
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { LoginPage } from '../LoginPage';
import { useAuthStore } from '@/store/authStore';

// Mock the auth store
vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

const wrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
};

describe('LoginPage TDD', () => {
  const mockLogin = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      clearError: mockClearError,
      isAuthenticated: false,
    });
  });

  it('RED: Should render login form with email and password fields', () => {
    render(<LoginPage />, { wrapper });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('Should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper });

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('Should show validation error for invalid email format', async () => {
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper });

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('GREEN: Should call authStore.login() on valid form submission', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);

    render(<LoginPage />, { wrapper });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('Should show loading state during login', () => {
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
      clearError: mockClearError,
      isAuthenticated: false,
    });

    render(<LoginPage />, { wrapper });

    expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('Should display error message on login failure', () => {
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: 'Invalid credentials',
      clearError: mockClearError,
      isAuthenticated: false,
    });

    render(<LoginPage />, { wrapper });

    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('Should have "Forgot password" link', () => {
    render(<LoginPage />, { wrapper });

    expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /forgot password/i })).toHaveAttribute('href', '/forgot-password');
  });

  it('Should have "Sign up" link', () => {
    render(<LoginPage />, { wrapper });

    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/register');
  });

  it('Should toggle password visibility', async () => {
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper });

    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    await user.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('Should clear error when user starts typing', async () => {
    const user = userEvent.setup();
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: 'Invalid credentials',
      clearError: mockClearError,
      isAuthenticated: false,
    });

    render(<LoginPage />, { wrapper });

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'a');

    expect(mockClearError).toHaveBeenCalled();
  });

  it('Should display academy branding', () => {
    render(<LoginPage />, { wrapper });

    expect(screen.getByText(/academy/i)).toBeInTheDocument();
  });

  it('Should have accessible form labels', () => {
    render(<LoginPage />, { wrapper });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toHaveAttribute('id');
    expect(passwordInput).toHaveAttribute('id');
  });

  it('Should disable submit button while loading', () => {
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
      clearError: mockClearError,
      isAuthenticated: false,
    });

    render(<LoginPage />, { wrapper });

    const submitButton = screen.getByRole('button', { name: /signing in/i });
    expect(submitButton).toBeDisabled();
  });

  it('Should handle Enter key to submit form', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);

    render(<LoginPage />, { wrapper });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123{enter}');

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });
});
