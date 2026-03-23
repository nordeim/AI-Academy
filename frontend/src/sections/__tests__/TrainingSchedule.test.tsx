/**
 * TrainingSchedule Section TDD Tests
 *
 * Tests for TrainingSchedule section with API integration
 * Phase 4A - Task 4A.2
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { TrainingSchedule } from '../TrainingSchedule';
import { useUpcomingCohorts } from '@/hooks/useCohorts';

// Mock the hook
vi.mock('@/hooks/useCohorts', () => ({
  useUpcomingCohorts: vi.fn(),
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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockCohorts = [
  {
    id: 'cohort-1',
    course_title: 'AI Engineering Bootcamp',
    course_slug: 'ai-engineering-bootcamp',
    start_date: '2026-04-14',
    end_date: '2026-07-14',
    timezone: 'America/New_York',
    format: 'online',
    location: null,
    instructor_name: 'Dr. Sarah Chen',
    spots_total: 50,
    spots_remaining: 8,
    availability_status: 'filling-fast',
    early_bird_price: '1999.00',
    early_bird_deadline: '2026-03-15',
    status: 'enrolling',
  },
  {
    id: 'cohort-2',
    course_title: 'Data Science Fundamentals',
    course_slug: 'data-science-fundamentals',
    start_date: '2026-05-01',
    end_date: '2026-08-01',
    timezone: 'UTC',
    format: 'online',
    location: null,
    instructor_name: 'Prof. James Wilson',
    spots_total: 100,
    spots_remaining: 45,
    availability_status: 'available',
    early_bird_price: null,
    early_bird_deadline: null,
    status: 'enrolling',
  },
];

describe('TrainingSchedule Component TDD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('RED: Should show loading state initially', () => {
    vi.mocked(useUpcomingCohorts).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    render(<TrainingSchedule />, { wrapper });

    // Should show loading skeletons
    expect(screen.getByTestId('cohorts-loading')).toBeInTheDocument();
  });

  it('GREEN: Should display cohorts after loading', async () => {
    const mockResponse = {
      success: true,
      data: {
        count: 2,
        next: null,
        previous: null,
        results: mockCohorts,
      },
      message: 'Success',
      errors: {},
      meta: { timestamp: '2024-01-01', request_id: '123' },
    };

    vi.mocked(useUpcomingCohorts).mockReturnValue({
      data: mockResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<TrainingSchedule />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('AI Engineering Bootcamp')).toBeInTheDocument();
      expect(screen.getByText('Data Science Fundamentals')).toBeInTheDocument();
    });
  });

  it('Should handle error state', () => {
    vi.mocked(useUpcomingCohorts).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch cohorts'),
    } as any);

    render(<TrainingSchedule />, { wrapper });

    expect(screen.getByTestId('cohorts-error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load cohorts')).toBeInTheDocument();
  });

  it('Should handle empty cohorts', () => {
    const mockResponse = {
      success: true,
      data: {
        count: 0,
        next: null,
        previous: null,
        results: [],
      },
      message: 'Success',
      errors: {},
      meta: { timestamp: '2024-01-01', request_id: '123' },
    };

    vi.mocked(useUpcomingCohorts).mockReturnValue({
      data: mockResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<TrainingSchedule />, { wrapper });

    expect(screen.getByTestId('cohorts-empty')).toBeInTheDocument();
    expect(screen.getByText('No upcoming cohorts')).toBeInTheDocument();
  });

  it('Should call useUpcomingCohorts on mount', () => {
    vi.mocked(useUpcomingCohorts).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    render(<TrainingSchedule />, { wrapper });

    expect(useUpcomingCohorts).toHaveBeenCalled();
  });

  it('Should display cohort details including dates and spots', async () => {
    const mockResponse = {
      success: true,
      data: {
        count: 1,
        next: null,
        previous: null,
        results: [mockCohorts[0]],
      },
      message: 'Success',
      errors: {},
      meta: { timestamp: '2024-01-01', request_id: '123' },
    };

    vi.mocked(useUpcomingCohorts).mockReturnValue({
      data: mockResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<TrainingSchedule />, { wrapper });

    await waitFor(() => {
      // Should show date
      expect(screen.getByText('Apr')).toBeInTheDocument(); // Month
      expect(screen.getByText('14')).toBeInTheDocument(); // Day
      // Should show spots remaining
      expect(screen.getByText(/8 spots remaining/i)).toBeInTheDocument();
    });
  });

  it('Should toggle cohort expansion', async () => {
    const mockResponse = {
      success: true,
      data: {
        count: 1,
        next: null,
        previous: null,
        results: [mockCohorts[0]],
      },
      message: 'Success',
      errors: {},
      meta: { timestamp: '2024-01-01', request_id: '123' },
    };

    vi.mocked(useUpcomingCohorts).mockReturnValue({
      data: mockResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<TrainingSchedule />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('AI Engineering Bootcamp')).toBeInTheDocument();
    });

    // Click to expand
    const cohortRow = screen.getByText('AI Engineering Bootcamp').closest('[data-cohort-id]') ||
      screen.getByText('AI Engineering Bootcamp').parentElement;
    if (cohortRow) {
      fireEvent.click(cohortRow);
    }

    // Should show expanded details
    await waitFor(() => {
      expect(screen.getByText('INSTRUCTOR')).toBeInTheDocument();
    });
  });

  it('Should show urgency message for filling-fast cohorts', async () => {
    const mockResponse = {
      success: true,
      data: {
        count: 1,
        next: null,
        previous: null,
        results: [mockCohorts[0]], // This one has filling-fast status
      },
      message: 'Success',
      errors: {},
      meta: { timestamp: '2024-01-01', request_id: '123' },
    };

    vi.mocked(useUpcomingCohorts).mockReturnValue({
      data: mockResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<TrainingSchedule />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/FILLING FAST/i)).toBeInTheDocument();
    });
  });
});
