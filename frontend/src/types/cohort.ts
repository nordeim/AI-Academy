/**
 * Cohort Types
 * 
 * TypeScript interfaces for Cohort entity from backend API
 * Based on API_Usage_Guide.md specifications
 */

// Cohort delivery format
export type CohortFormat = 'online' | 'in_person' | 'hybrid';

// Cohort status
export type CohortStatus = 'upcoming' | 'enrolling' | 'in_progress' | 'completed' | 'cancelled';

// Availability status (computed property)
export type AvailabilityStatus = 'available' | 'filling-fast' | 'waitlist';

// Cohort entity
export interface Cohort {
  id: string;
  course_title: string;
  course_slug: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  timezone: string;
  format: CohortFormat;
  location: string;
  instructor_name: string;
  spots_total: number;
  spots_remaining: number;
  availability_status: AvailabilityStatus;
  early_bird_price: string | null;
  early_bird_deadline: string | null; // ISO date string
  status: CohortStatus;
}

// Cohort list response
export interface CohortListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Cohort[];
}

// Cohort filters for API requests
export interface CohortFilters {
  course?: string; // Course ID
  format?: CohortFormat;
  status?: CohortStatus;
  ordering?: string; // e.g., 'start_date', '-start_date'
  page?: number;
}

// Course cohorts response (custom action)
export type CourseCohortsResponse = Cohort[];
