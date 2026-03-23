/**
 * useCohorts Hook TDD Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCohorts, useCohortDetail, useUpcomingCohorts } from '../useCohorts';

vi.mock('@/services/api/cohorts', () => ({
  getCohorts: vi.fn(),
  getCohortDetail: vi.fn(),
  getUpcomingCohorts: vi.fn(),
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

describe('useCohorts Hook TDD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch cohorts with filters', async () => {
    const { getCohorts } = await import('@/services/api/cohorts');
    const mockResponse = {
      success: true,
      data: {
        count: 1,
        next: null,
        previous: null,
        results: [{ id: 'c1', course_title: 'AI', status: 'enrolling' }],
      },
      message: 'Success',
      errors: {},
      meta: { timestamp: '2024-01-01', request_id: '123' },
    };

    vi.mocked(getCohorts).mockResolvedValueOnce(mockResponse as any);

    const { result } = renderHook(
      () => useCohorts({ status: 'enrolling' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getCohorts).toHaveBeenCalledWith({ status: 'enrolling' });
  });

  it('should fetch cohort detail', async () => {
    const { getCohortDetail } = await import('@/services/api/cohorts');
    const mockResponse = {
      success: true,
      data: { id: 'c1', course_title: 'AI', spots_remaining: 5 },
      message: 'Success',
      errors: {},
      meta: { timestamp: '2024-01-01', request_id: '123' },
    };

    vi.mocked(getCohortDetail).mockResolvedValueOnce(mockResponse as any);

    const { result } = renderHook(() => useCohortDetail('c1'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data.spots_remaining).toBe(5);
  });

  it('should fetch upcoming cohorts', async () => {
    const { getUpcomingCohorts } = await import('@/services/api/cohorts');
    const mockResponse = {
      success: true,
      data: {
        count: 2,
        next: null,
        previous: null,
        results: [{ id: 'c1', status: 'enrolling' }],
      },
      message: 'Success',
      errors: {},
      meta: { timestamp: '2024-01-01', request_id: '123' },
    };

    vi.mocked(getUpcomingCohorts).mockResolvedValueOnce(mockResponse as any);

    const { result } = renderHook(() => useUpcomingCohorts(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getUpcomingCohorts).toHaveBeenCalled();
  });
});
