/**
 * Cohorts API Service
 * 
 * API methods for cohort-related endpoints
 */
import { apiClient, extractApiError, ApiResponse, PaginatedData } from './client';
import { Cohort, CohortFilters, CohortListResponse } from '@/types/cohort';

const COHORTS_ENDPOINT = '/cohorts/';

/**
 * Fetch list of cohorts with optional filters
 * 
 * @param filters - Optional query parameters
 * @returns Promise with paginated cohort list
 * 
 * TDD Test Cases:
 * - Should fetch cohorts without filters
 * - Should filter by course ID
 * - Should filter by format
 * - Should filter by status
 * - Should order by start_date
 */
export async function getCohorts(
  filters?: CohortFilters
): Promise<ApiResponse<PaginatedData<Cohort>>> {
  try {
    const params = new URLSearchParams();
    
    if (filters?.course) params.append('course', filters.course);
    if (filters?.format) params.append('format', filters.format);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.ordering) params.append('ordering', filters.ordering);
    if (filters?.page) params.append('page', filters.page.toString());
    
    const queryString = params.toString();
    const url = queryString ? `${COHORTS_ENDPOINT}?${queryString}` : COHORTS_ENDPOINT;
    
    const response = await apiClient.get<ApiResponse<PaginatedData<Cohort>>>(url);
    return response.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

/**
 * Fetch cohort detail by ID
 * 
 * @param id - Cohort UUID
 * @returns Promise with cohort details
 * 
 * TDD Test Cases:
 * - Should fetch cohort by valid ID
 * - Should return 404 for invalid ID
 * - Should include course and instructor info
 */
export async function getCohortDetail(
  id: string
): Promise<ApiResponse<Cohort>> {
  try {
    const response = await apiClient.get<ApiResponse<Cohort>>(
      `${COHORTS_ENDPOINT}${id}/`
    );
    return response.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

/**
 * Fetch upcoming cohorts
 * Convenience method for getting enrollable cohorts
 * 
 * @returns Promise with upcoming/enrolling cohorts
 */
export async function getUpcomingCohorts(): Promise<ApiResponse<PaginatedData<Cohort>>> {
  return getCohorts({ 
    status: 'enrolling',
    ordering: 'start_date'
  });
}
