/**
 * Courses API Service
 * 
 * API methods for course-related endpoints
 * TDD: All methods tested with mocked responses
 */
import { apiClient, extractApiError } from './client';
import type { ApiResponse, PaginatedData } from './client';
import type { Course, CourseDetail, CourseFilters } from '@/types/course';
import type { Cohort } from '@/types/cohort';

const COURSES_ENDPOINT = '/courses/';

/**
 * Fetch list of courses with optional filters
 * 
 * @param filters - Optional query parameters for filtering
 * @returns Promise with paginated course list
 * 
 * TDD Test Cases:
 * - Should fetch courses without filters
 * - Should apply level filter correctly
 * - Should apply search filter correctly
 * - Should handle pagination
 * - Should return error on API failure
 */
export async function getCourses(
  filters?: CourseFilters
): Promise<ApiResponse<PaginatedData<Course>>> {
  try {
    const params = new URLSearchParams();
    
    if (filters?.level) params.append('level', filters.level);
    if (filters?.categories__slug) params.append('categories__slug', filters.categories__slug);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.ordering) params.append('ordering', filters.ordering);
    if (filters?.featured) params.append('featured', 'true');
    if (filters?.page) params.append('page', filters.page.toString());
    
    const queryString = params.toString();
    const url = queryString ? `${COURSES_ENDPOINT}?${queryString}` : COURSES_ENDPOINT;
    
    const response = await apiClient.get<ApiResponse<PaginatedData<Course>>>(url);
    return response.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

/**
 * Fetch course detail by slug
 * 
 * @param slug - Course slug (URL-friendly identifier)
 * @returns Promise with course details
 * 
 * TDD Test Cases:
 * - Should fetch course by valid slug
 * - Should return 404 for invalid slug
 * - Should include additional fields for authenticated users
 */
export async function getCourseDetail(
  slug: string
): Promise<ApiResponse<CourseDetail>> {
  try {
    const response = await apiClient.get<ApiResponse<CourseDetail>>(
      `${COURSES_ENDPOINT}${slug}/`
    );
    return response.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

/**
 * Fetch cohorts for a specific course
 * 
 * @param slug - Course slug
 * @returns Promise with array of cohorts
 * 
 * TDD Test Cases:
 * - Should fetch cohorts for valid course
 * - Should return empty array if no cohorts
 * - Should handle course not found error
 */
export async function getCourseCohorts(
  slug: string
): Promise<ApiResponse<Cohort[]>> {
  try {
    const response = await apiClient.get<ApiResponse<Cohort[]>>(
      `${COURSES_ENDPOINT}${slug}/cohorts/`
    );
    return response.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

/**
 * Search courses by keyword
 * Convenience wrapper around getCourses
 * 
 * @param query - Search query string
 * @param filters - Additional filters
 * @returns Promise with filtered results
 */
export async function searchCourses(
  query: string,
  filters?: Omit<CourseFilters, 'search'>
): Promise<ApiResponse<PaginatedData<Course>>> {
  return getCourses({ ...filters, search: query });
}

/**
 * Fetch featured courses
 * Convenience wrapper around getCourses
 * 
 * @returns Promise with featured courses
 */
export async function getFeaturedCourses(): Promise<ApiResponse<PaginatedData<Course>>> {
  return getCourses({ featured: true });
}
