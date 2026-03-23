/**
 * RegisterPage TDD Tests
 *
 * Tests for the registration page component
 * Phase 6B - Task 6B.1
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { RegisterPage } from '../RegisterPage';
import { useAuthStore } from '@/store/authStore';

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
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

describe('RegisterPage TDD', () => {
  const mockRegister = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: null,
      clearError: mockClearError,
      isAuthenticated: false,
    });
  });

  it('Should render registration form with all fields', () => {
    render(<RegisterPage />, { wrapper });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('Should validate email format', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('Should validate password strength', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    await user.type(screen.getByLabelText(/^password/i), 'short');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('Should validate password confirmation match', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    await user.type(screen.getByLabelText(/^password/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password456');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('Should show password strength indicator', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    const passwordInput = screen.getByLabelText(/^password/i);
    await user.type(passwordInput, 'weak');

    expect(screen.getByText(/weak/i)).toBeInTheDocument();
  });

  it('Should call register on valid form submission', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce(undefined);

    render(<RegisterPage />, { wrapper });

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/^password/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });
  });

  it('Should show loading state during registration', () => {
    (useAuthStore as any).mockReturnValue({
      register: mockRegister,
      isLoading: true,
      error: null,
      clearError: mockClearError,
      isAuthenticated: false,
    });

    render(<RegisterPage />, { wrapper });

    expect(screen.getByRole('button', { name: /creating account/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('Should display error on registration failure', () => {
    (useAuthStore as any).mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: 'Email already exists',
      clearError: mockClearError,
      isAuthenticated: false,
    });

    render(<RegisterPage />, { wrapper });

    expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
  });

  it('Should have "Sign in" link', () => {
    render(<RegisterPage />, { wrapper });

    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
  });

  it('Should toggle password visibility', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    const passwordInput = screen.getByLabelText(/^password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    await user.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('Should require terms acceptance', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/^password/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/you must accept the terms/i)).toBeInTheDocument();
    });
  });
});
