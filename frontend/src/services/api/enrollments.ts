/**
 * Enrollments API Service
 * 
 * API methods for enrollment-related endpoints
 * Requires authentication - JWT token must be set
 */
import { apiClient, extractApiError } from './client';
import type { ApiResponse, PaginatedData } from './client';
import type {
  Enrollment,
  CreateEnrollmentRequest,
  CancelEnrollmentResponse,
  EnrollmentFilters,
} from '@/types/enrollment';

const ENROLLMENTS_ENDPOINT = '/enrollments/';

/**
 * Fetch list of user enrollments
 * Requires authentication
 * 
 * @param filters - Optional filters
 * @returns Promise with paginated enrollment list
 * 
 * TDD Test Cases:
 * - Should fetch enrollments when authenticated
 * - Should throw 401 when not authenticated
 * - Should filter by status
 * - Should return empty list if no enrollments
 */
export async function getEnrollments(
  filters?: EnrollmentFilters
): Promise<ApiResponse<PaginatedData<Enrollment>>> {
  try {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    
    const queryString = params.toString();
    const url = queryString 
      ? `${ENROLLMENTS_ENDPOINT}?${queryString}` 
      : ENROLLMENTS_ENDPOINT;
    
    const response = await apiClient.get<ApiResponse<PaginatedData<Enrollment>>>(url);
    return response.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

/**
 * Create new enrollment
 * Requires authentication
 * 
 * @param data - Enrollment creation data
 * @returns Promise with created enrollment
 * 
 * TDD Test Cases:
 * - Should create enrollment with valid data
 * - Should validate cohort capacity
 * - Should prevent duplicate enrollment
 * - Should throw 400 if cohort is full
 * - Should throw 401 if not authenticated
 */
export async function createEnrollment(
  data: CreateEnrollmentRequest
): Promise<ApiResponse<Enrollment>> {
  try {
    const response = await apiClient.post<ApiResponse<Enrollment>>(
      ENROLLMENTS_ENDPOINT,
      data
    );
    return response.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

/**
 * Cancel an enrollment
 * Requires authentication
 * 
 * @param enrollmentId - Enrollment UUID
 * @returns Promise with cancellation status
 * 
 * TDD Test Cases:
 * - Should cancel pending enrollment
 * - Should cancel confirmed enrollment
 * - Should release cohort spot
 * - Should throw 400 if already cancelled
 * - Should throw 403 if not owner
 */
export async function cancelEnrollment(
  enrollmentId: string
): Promise<ApiResponse<CancelEnrollmentResponse>> {
  try {
    const response = await apiClient.post<ApiResponse<CancelEnrollmentResponse>>(
      `${ENROLLMENTS_ENDPOINT}${enrollmentId}/cancel/`
    );
    return response.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

/**
 * Get enrollment detail
 * Requires authentication
 * 
 * @param enrollmentId - Enrollment UUID
 * @returns Promise with enrollment details
 */
export async function getEnrollmentDetail(
  enrollmentId: string
): Promise<ApiResponse<Enrollment>> {
  try {
    const response = await apiClient.get<ApiResponse<Enrollment>>(
      `${ENROLLMENTS_ENDPOINT}${enrollmentId}/`
    );
    return response.data;
  } catch (error) {
    throw extractApiError(error);
  }
}
