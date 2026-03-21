/**
 * Categories API Service
 * 
 * API methods for category-related endpoints
 */
import { apiClient, extractApiError, ApiResponse, PaginatedData } from './client';
import { Category, CategoryListResponse } from '@/types/category';

const CATEGORIES_ENDPOINT = '/categories/';

/**
 * Fetch list of all categories
 * 
 * @returns Promise with paginated category list
 * 
 * TDD Test Cases:
 * - Should fetch all categories
 * - Should return categories with course_count
 * - Should handle empty list
 * - Should return error on API failure
 */
export async function getCategories(): Promise<ApiResponse<PaginatedData<Category>>> {
  try {
    const response = await apiClient.get<ApiResponse<PaginatedData<Category>>>(
      CATEGORIES_ENDPOINT
    );
    return response.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

/**
 * Fetch category detail by slug
 * 
 * @param slug - Category slug
 * @returns Promise with category details
 * 
 * TDD Test Cases:
 * - Should fetch category by valid slug
 * - Should return 404 for invalid slug
 * - Should include course_count
 */
export async function getCategoryDetail(
  slug: string
): Promise<ApiResponse<Category>> {
  try {
    const response = await apiClient.get<ApiResponse<Category>>(
      `${CATEGORIES_ENDPOINT}${slug}/`
    );
    return response.data;
  } catch (error) {
    throw extractApiError(error);
  }
}
