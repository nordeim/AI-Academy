/**
 * Enrollment Types
 * 
 * TypeScript interfaces for Enrollment entity from backend API
 * Based on API_Usage_Guide.md specifications
 */

import { Cohort } from './cohort';

// Enrollment status
export type EnrollmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';

// Enrollment entity
export interface Enrollment {
  id: string;
  course_title: string;
  cohort_info: Cohort;
  amount_paid: string; // Backend returns as string
  currency: string;
  status: EnrollmentStatus;
  created_at: string; // ISO datetime string
  confirmed_at: string | null; // ISO datetime string
}

// Enrollment list response
export interface EnrollmentListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Enrollment[];
}

// Create enrollment request payload
export interface CreateEnrollmentRequest {
  course: string; // Course ID (UUID)
  cohort: string; // Cohort ID (UUID)
  amount_paid: string; // Decimal as string
}

// Cancel enrollment response
export interface CancelEnrollmentResponse {
  status: string;
}

// Enrollment filters
export interface EnrollmentFilters {
  status?: EnrollmentStatus;
  page?: number;
}
