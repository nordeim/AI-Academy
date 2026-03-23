/**
 * CohortSelector Component
 *
 * Interactive cohort selection component for enrollment flow.
 * Displays available cohorts with spots remaining, dates, and format.
 *
 * Features:
 * - List cohorts for a specific course
 * - Show spots remaining with visual indicators
 * - Display cohort details (dates, format, instructor)
 * - Handle cohort selection
 * - Loading and error states
 * - Disabled state for full cohorts
 *
 * @module components/CohortSelector
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, AlertCircle, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useCohorts } from '@/hooks/useCohorts';
import type { Cohort } from '@/types/cohort';
import { cn } from '@/lib/utils';

interface CohortSelectorProps {
  /** Course slug to fetch cohorts for */
  courseSlug: string;
  /** Currently selected cohort ID */
  value: string | null;
  /** Callback when cohort is selected */
  onChange: (cohortId: string, cohortData: Cohort) => void;
  /** Disable the selector */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
}

/**
 * CohortSelector - Cohort selection component
 *
 * TDD Test Cases:
 * - Should render cohorts with spots remaining
 * - Should handle cohort selection
 * - Should disable full cohorts
 * - Should show loading state
 * - Should handle errors
 */
export function CohortSelector({
  courseSlug,
  value,
  onChange,
  disabled = false,
  error,
}: CohortSelectorProps) {
  const { data, isLoading, error: queryError, refetch } = useCohorts({ course: courseSlug });
  const [selectedId, setSelectedId] = useState<string | null>(value);

  const cohorts = data?.data?.results || [];
  const displayError = error || queryError?.message;

  /**
   * Handle cohort selection
   */
  const handleSelect = (cohort: Cohort) => {
    if (disabled || cohort.spots_remaining === 0) return;

    setSelectedId(cohort.id);
    onChange(cohort.id, cohort);
  };

  /**
   * Get availability status for cohort
   */
  const getAvailabilityStatus = (cohort: Cohort) => {
    if (cohort.spots_remaining === 0) {
      return { label: 'Full', variant: 'destructive' as const };
    }
    if (cohort.spots_remaining <= 3) {
      return { label: `${cohort.spots_remaining} spots left`, variant: 'secondary' as const };
    }
    return { label: `${cohort.spots_remaining} spots available`, variant: 'default' as const };
  };

  /**
   * Format cohort dates
   */
  const formatDates = (cohort: Cohort) => {
    const start = format(new Date(cohort.start_date), 'MMM d, yyyy');
    const end = format(new Date(cohort.end_date), 'MMM d, yyyy');
    return `${start} - ${end}`;
  };

  /**
   * Format cohort format
   */
  const formatCohortFormat = (format: Cohort['format']) => {
    const formatMap: Record<Cohort['format'], string> = {
      online: 'Online',
      in_person: 'In-Person',
      hybrid: 'Hybrid',
    };
    return formatMap[format] || format;
  };

  /**
   * Loading skeleton
   */
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-2 border-dashed">
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  /**
   * Error state
   */
  if (displayError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex flex-col gap-2">
          <span>Error loading cohorts: {displayError}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="w-fit"
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  /**
   * Empty state
   */
  if (cohorts.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No cohorts available for this course at the moment.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {cohorts.map((cohort) => {
        const availability = getAvailabilityStatus(cohort);
        const isSelected = selectedId === cohort.id;
        const isFull = cohort.spots_remaining === 0;

        return (
          <Card
            key={cohort.id}
            className={cn(
              'cursor-pointer transition-all duration-200 border-2',
              isSelected
                ? 'border-primary-600 bg-primary-50'
                : 'border-transparent hover:border-gray-300',
              isFull && 'opacity-60 cursor-not-allowed',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            onClick={() => handleSelect(cohort)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">
                      {formatCohortFormat(cohort.format)} Cohort
                    </h3>
                    <Badge
                      variant={availability.variant}
                      className={cn(
                        'text-xs font-medium',
                        availability.variant === 'default' &&
                          'bg-green-100 text-green-800 hover:bg-green-100'
                      )}
                    >
                      {availability.label}
                    </Badge>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDates(cohort)}</span>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>Instructor: {cohort.instructor_name}</span>
                  </div>

                  {/* Location */}
                  {cohort.format !== 'online' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{cohort.location}</span>
                    </div>
                  )}

                  {/* Spots indicator */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={cn(
                          'h-2 rounded-full transition-all',
                          cohort.spots_remaining === 0
                            ? 'bg-red-500'
                            : cohort.spots_remaining <= 3
                              ? 'bg-amber-500'
                              : 'bg-green-500'
                        )}
                        style={{
                          width: `${(cohort.spots_remaining / cohort.spots_total) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground min-w-[60px] text-right">
                      {cohort.spots_remaining}/{cohort.spots_total}
                    </span>
                  </div>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default CohortSelector;
