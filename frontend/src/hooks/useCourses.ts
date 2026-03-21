/**
 * Courses React Query Hooks
 * 
 * Data fetching hooks for course-related endpoints
 * Features:
 * - Automatic caching with TTL matching backend (5 min for list, 1 hour for detail)
 * - Background refetching
 * - Pagination support
 * - Filter invalidation
 */
import {
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { Course, CourseDetail, CourseFilters } from '@/types/course';
import { Cohort } from '@/types/cohort';
import { ApiResponse, PaginatedData } from '@/types/api';
import {
  getCourses,
  getCourseDetail,
  getCourseCohorts,
} from '@/services/api/courses';

// Query keys for cache management
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (filters: CourseFilters | undefined) =>
    [...courseKeys.lists(), filters] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (slug: string) => [...courseKeys.details(), slug] as const,
  cohorts: (slug: string) => [...courseKeys.detail(slug), 'cohorts'] as const,
};

/**
 * Fetch courses list with filters
 * 
 * Cache: 5 minutes (matches backend)
 * Stale time: 5 minutes
 * 
 * TDD Test Coverage:
 * - Fetches courses on mount
 * - Applies filters correctly
 * - Caches for 5 minutes
 * - Refetches when filters change
 */
export function useCourses(
  filters?: CourseFilters
): UseQueryResult<ApiResponse<PaginatedData<Course>>, Error> {
  return useQuery({
    queryKey: courseKeys.list(filters),
    queryFn: () => getCourses(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Fetch course detail by slug
 * 
 * Cache: 1 hour (matches backend)
 * Stale time: 1 hour
 * 
 * TDD Test Coverage:
 * - Fetches course by slug
 * - Caches for 1 hour
 * - Enabled only when slug provided
 */
export function useCourseDetail(
  slug: string
): UseQueryResult<ApiResponse<CourseDetail>, Error> {
  return useQuery({
    queryKey: courseKeys.detail(slug),
    queryFn: () => getCourseDetail(slug),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    enabled: !!slug,
  });
}

/**
 * Fetch cohorts for a specific course
 * 
 * Cache: 10 minutes (matches backend)
 * Stale time: 10 minutes
 * 
 * TDD Test Coverage:
 * - Fetches cohorts for course
 * - Caches for 10 minutes
 * - Returns array directly
 */
export function useCourseCohorts(
  slug: string
): UseQueryResult<ApiResponse<Cohort[]>, Error> {
  return useQuery({
    queryKey: courseKeys.cohorts(slug),
    queryFn: () => getCourseCohorts(slug),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    enabled: !!slug,
  });
}

/**
 * Prefetch course detail for improved UX
 * Use with hover events for instant navigation
 */
export function usePrefetchCourse() {
  const queryClient = useQueryClient();

  return (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: courseKeys.detail(slug),
      queryFn: () => getCourseDetail(slug),
      staleTime: 60 * 60 * 1000,
    });
  };
}

/**
 * Invalidate course cache
 * Useful after mutations
 */
export function useInvalidateCourses() {
  const queryClient = useQueryClient();

  return {
    invalidateList: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
    invalidateDetail: (slug: string) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(slug) });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  };
}
