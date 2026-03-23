/**
 * Cohorts React Query Hooks
 *
 * Data fetching hooks for cohort-related endpoints
 * Features:
 * - Automatic caching with TTL matching backend (10 minutes for cohorts)
 * - Background refetching
 * - Pagination support
 * - Filter support
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Cohort, CohortFilters } from '@/types/cohort';
import type { ApiResponse, PaginatedData } from '@/types/api';
import {
  getCohorts,
  getCohortDetail,
  getUpcomingCohorts,
} from '@/services/api/cohorts';

// Query keys for cache management
export const cohortKeys = {
  all: ['cohorts'] as const,
  lists: () => [...cohortKeys.all, 'list'] as const,
  list: (filters: CohortFilters | undefined) =>
    [...cohortKeys.lists(), filters] as const,
  details: () => [...cohortKeys.all, 'detail'] as const,
  detail: (id: string) => [...cohortKeys.details(), id] as const,
  upcoming: () => [...cohortKeys.all, 'upcoming'] as const,
};

/**
 * Fetch cohorts list with filters
 *
 * Cache: 10 minutes (matches backend cohorts TTL)
 * Stale time: 10 minutes
 *
 * TDD Test Coverage:
 * - Fetches cohorts on mount
 * - Applies filters correctly
 * - Caches for 10 minutes
 * - Refetches when filters change
 */
export function useCohorts(
  filters?: CohortFilters
): UseQueryResult<ApiResponse<PaginatedData<Cohort>>, Error> {
  return useQuery({
    queryKey: cohortKeys.list(filters),
    queryFn: () => getCohorts(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Fetch cohort detail by ID
 *
 * Cache: 10 minutes (cohorts change when enrolled)
 * Stale time: 10 minutes
 *
 * TDD Test Coverage:
 * - Fetches cohort by ID
 * - Caches for 10 minutes
 * - Enabled only when ID provided
 */
export function useCohortDetail(
  id: string
): UseQueryResult<ApiResponse<Cohort>, Error> {
  return useQuery({
    queryKey: cohortKeys.detail(id),
    queryFn: () => getCohortDetail(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    enabled: !!id,
  });
}

/**
 * Fetch upcoming cohorts
 * Convenience hook for getting enrollable cohorts
 *
 * Cache: 10 minutes
 * Stale time: 10 minutes
 *
 * TDD Test Coverage:
 * - Fetches cohorts with status='enrolling'
 * - Caches for 10 minutes
 */
export function useUpcomingCohorts(): UseQueryResult<
  ApiResponse<PaginatedData<Cohort>>,
  Error
> {
  return useQuery({
    queryKey: cohortKeys.upcoming(),
    queryFn: () => getUpcomingCohorts(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}

/**
 * Prefetch cohort detail for improved UX
 * Use with hover events for instant navigation
 */
export function usePrefetchCohort() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: cohortKeys.detail(id),
      queryFn: () => getCohortDetail(id),
      staleTime: 10 * 60 * 1000,
    });
  };
}

/**
 * Invalidate cohort cache
 * Useful after mutations
 */
export function useInvalidateCohorts() {
  const queryClient = useQueryClient();

  return {
    invalidateList: () => {
      queryClient.invalidateQueries({ queryKey: cohortKeys.lists() });
    },
    invalidateDetail: (id: string) => {
      queryClient.invalidateQueries({ queryKey: cohortKeys.detail(id) });
    },
    invalidateUpcoming: () => {
      queryClient.invalidateQueries({ queryKey: cohortKeys.upcoming() });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: cohortKeys.all });
    },
  };
}
