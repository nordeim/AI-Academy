/**
 * Categories React Query Hooks
 * 
 * Data fetching hooks for category-related endpoints
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Category } from '@/types/api';
import type { ApiResponse, PaginatedData } from '@/types/api';
import { getCategories, getCategoryDetail } from '@/services/api/categories';

// Query keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: () => [...categoryKeys.lists()] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (slug: string) => [...categoryKeys.details(), slug] as const,
};

/**
 * Fetch all categories
 * Cache: 30 minutes (matches backend)
 */
export function useCategories(): UseQueryResult<
  ApiResponse<PaginatedData<Category>>,
  Error
> {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Fetch category detail
 * Cache: 1 hour
 */
export function useCategoryDetail(
  slug: string
): UseQueryResult<ApiResponse<Category>, Error> {
  return useQuery({
    queryKey: categoryKeys.detail(slug),
    queryFn: () => getCategoryDetail(slug),
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: !!slug,
  });
}

/**
 * Prefetch category
 */
export function usePrefetchCategory() {
  const queryClient = useQueryClient();

  return (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: categoryKeys.detail(slug),
      queryFn: () => getCategoryDetail(slug),
    });
  };
}
