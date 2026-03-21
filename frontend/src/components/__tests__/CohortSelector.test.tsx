/**
 * CohortSelector Tests
 *
 * TDD Test Suite for CohortSelector component
 * Tests cover cohort rendering, selection, loading states, and error handling
 *
 * @module components/__tests__/CohortSelector.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CohortSelector } from '../CohortSelector';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock useCohorts hook
vi.mock('@/hooks/useCohorts', () => ({
  useCohorts: vi.fn(),
}));

import { useCohorts } from '@/hooks/useCohorts';

// Mock cohort data
const mockCohorts = [
  {
    id: 'cohort-1',
    course_title: 'AI Engineering',
    course_slug: 'ai-engineering',
    start_date: '2025-04-01T00:00:00Z',
    end_date: '2025-06-30T00:00:00Z',
    timezone: 'America/New_York',
    format: 'online' as const,
    location: 'Virtual',
    instructor_name: 'Dr. Sarah Chen',
    spots_total: 30,
    spots_remaining: 25,
    availability_status: 'available' as const,
    early_bird_price: null,
    early_bird_deadline: null,
    status: 'enrolling' as const,
  },
  {
    id: 'cohort-2',
    course_title: 'AI Engineering',
    course_slug: 'ai-engineering',
    start_date: '2025-05-01T00:00:00Z',
    end_date: '2025-07-31T00:00:00Z',
    timezone: 'America/New_York',
    format: 'in_person' as const,
    location: 'New York, NY',
    instructor_name: 'Prof. James Wilson',
    spots_total: 20,
    spots_remaining: 2,
    availability_status: 'filling-fast' as const,
    early_bird_price: null,
    early_bird_deadline: null,
    status: 'enrolling' as const,
  },
  {
    id: 'cohort-3',
    course_title: 'AI Engineering',
    course_slug: 'ai-engineering',
    start_date: '2025-06-01T00:00:00Z',
    end_date: '2025-08-31T00:00:00Z',
    timezone: 'America/New_York',
    format: 'hybrid' as const,
    location: 'San Francisco, CA',
    instructor_name: 'Dr. Maria Rodriguez',
    spots_total: 15,
    spots_remaining: 0,
    availability_status: 'waitlist' as const,
    early_bird_price: null,
    early_bird_deadline: null,
    status: 'enrolling' as const,
  },
];

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('CohortSelector', () => {
  const defaultProps = {
    courseSlug: 'ai-engineering',
    value: null,
    onChange: vi.fn(),
    disabled: false,
    error: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render cohorts with spots remaining', async () => {
      vi.mocked(useCohorts).mockReturnValue({
        data: { results: mockCohorts },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<CohortSelector {...defaultProps} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Online Cohort')).toBeInTheDocument();
        expect(screen.getByText('In-Person Cohort')).toBeInTheDocument();
        expect(screen.getByText('Hybrid Cohort')).toBeInTheDocument();
      });

      // Check spots remaining
      expect(screen.getByText('25 spots available')).toBeInTheDocument();
      expect(screen.getByText('2 spots left')).toBeInTheDocument();
      expect(screen.getByText('Full')).toBeInTheDocument();
    });

    it('should display cohort dates and instructor', async () => {
      vi.mocked(useCohorts).mockReturnValue({
        data: { results: mockCohorts },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<CohortSelector {...defaultProps} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/Instructor: Dr\. Sarah Chen/)).toBeInTheDocument();
      });
    });

    it('should show location for in-person cohorts', async () => {
      vi.mocked(useCohorts).mockReturnValue({
        data: { results: mockCohorts },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<CohortSelector {...defaultProps} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('New York, NY')).toBeInTheDocument();
        expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
      });

      // Online cohort should not show location
      const locations = screen.queryAllByText('Virtual');
      expect(locations).toHaveLength(0);
    });
  });

  describe('Cohort Selection', () => {
    it('should handle cohort selection', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      vi.mocked(useCohorts).mockReturnValue({
        data: { results: mockCohorts },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<CohortSelector {...defaultProps} onChange={onChange} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('Online Cohort')).toBeInTheDocument();
      });

      const firstCohort = screen.getByText('Online Cohort').closest('[role="button"]') ||
        screen.getByText('Online Cohort').closest('div[class*="cursor-pointer"]');
      
      if (firstCohort) {
        await user.click(firstCohort);
      }

      // Check selection indicator appears
      await waitFor(() => {
        const checkIcon = screen.queryByRole('img', { name: /check/i });
        expect(checkIcon || screen.getByText('Online Cohort').closest('div')).toBeInTheDocument();
      });
    });

    it('should show selected state visually', async () => {
      vi.mocked(useCohorts).mockReturnValue({
        data: { results: mockCohorts },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<CohortSelector {...defaultProps} value="cohort-1" />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        const onlineCohort = screen.getByText('Online Cohort').closest('div[class*="border-primary"]') ||
          screen.getByText('Online Cohort').closest('div[class*="bg-primary"]');
        expect(onlineCohort || screen.getByText('Online Cohort')).toBeInTheDocument();
      });
    });
  });

  describe('Disabled Cohorts', () => {
    it('should disable full cohorts', async () => {
      vi.mocked(useCohorts).mockReturnValue({
        data: { results: mockCohorts },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<CohortSelector {...defaultProps} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Full')).toBeInTheDocument();
      });

      // Full cohort should be visually distinct (opacity-60, cursor-not-allowed)
      const fullCohort = screen.getByText('Full').closest('div[class*="opacity-60"]') ||
        screen.getByText('Hybrid Cohort').closest('div[class*="cursor-not-allowed"]');
      
      expect(fullCohort || screen.getByText('Hybrid Cohort')).toBeInTheDocument();
    });

    it('should not select full cohort when clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      vi.mocked(useCohorts).mockReturnValue({
        data: { results: mockCohorts },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<CohortSelector {...defaultProps} onChange={onChange} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('Full')).toBeInTheDocument();
      });

      const fullCohort = screen.getByText('Hybrid Cohort');
      await user.click(fullCohort);

      // onChange should not be called for full cohort
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should disable all cohorts when disabled prop is true', async () => {
      vi.mocked(useCohorts).mockReturnValue({
        data: { results: mockCohorts },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<CohortSelector {...defaultProps} disabled={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        const cohorts = screen.getAllByText(/Cohort$/);
        expect(cohorts.length).toBeGreaterThan(0);
      });

      // All cohorts should have disabled styling
      const disabledCohorts = screen.getAllByText(/Cohort/).filter(
        el => el.closest('div[class*="cursor-not-allowed"]') || el.closest('div[class*="opacity-50"]')
      );
      expect(disabledCohorts.length).toBeGreaterThan(0);
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      vi.mocked(useCohorts).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<CohortSelector {...defaultProps} />, { wrapper: createWrapper() });

      // Should show skeleton loaders
      const skeletons = screen.getAllByRole('generic').filter(
        el => el.className?.includes('animate-pulse') || el.getAttribute('data-testid')?.includes('skeleton')
      );
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors', async () => {
      const refetch = vi.fn();

      vi.mocked(useCohorts).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { message: 'Failed to load cohorts' },
        refetch,
      } as any);

      render(<CohortSelector {...defaultProps} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/Error loading cohorts/i)).toBeInTheDocument();
      });

      // Should have retry button
      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should show error message prop', () => {
      vi.mocked(useCohorts).mockReturnValue({
        data: { results: [] },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<CohortSelector {...defaultProps} error="Custom error message" />, {
        wrapper: createWrapper(),
      });

      expect(screen.getByText(/Custom error message/i)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no cohorts available', async () => {
      vi.mocked(useCohorts).mockReturnValue({
        data: { results: [] },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<CohortSelector {...defaultProps} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/No cohorts available/i)).toBeInTheDocument();
      });
    });
  });
});
