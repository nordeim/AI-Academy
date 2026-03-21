/**
 * EnrollmentPage
 *
 * Multi-step enrollment wizard for course registration.
 * Handles cohort selection, enrollment review, and payment processing.
 *
 * Features:
 * - 3-step wizard (Select Cohort → Review → Payment)
 * - Protected route (requires authentication)
 * - Stripe payment integration
 * - Error handling and validation
 *
 * @module pages/EnrollmentPage
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  CheckCircle, 
  CreditCard, 
  Users, 
  Calendar, 
  AlertCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useCourseDetail } from '@/hooks/useCourses';
import { useCohorts } from '@/hooks/useCohorts';
import { useCreatePaymentIntent } from '@/hooks/usePayment';
import { CohortSelector } from '@/components/CohortSelector';
import { PaymentForm } from '@/components/PaymentForm';
import { Cohort } from '@/types/cohort';
import { createEnrollment } from '@/services/api/enrollments';
import { staggerContainer, fadeUpItem } from '@/lib/animations';

type EnrollmentStep = 1 | 2 | 3;

interface EnrollmentState {
  step: EnrollmentStep;
  selectedCohort: Cohort | null;
  enrollmentId: string | null;
  clientSecret: string | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * EnrollmentPage - Multi-step enrollment wizard
 *
 * TDD Test Cases:
 * - Should render 3-step wizard with progress indicators
 * - Should display available cohorts
 * - Should select cohort and proceed to review
 * - Should display course and cohort details in review
 * - Should create enrollment and proceed to payment
 * - Should display Stripe payment form
 * - Should handle errors gracefully
 * - Should show loading states
 */
export function EnrollmentPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [state, setState] = useState<EnrollmentState>({
    step: 1,
    selectedCohort: null,
    enrollmentId: null,
    clientSecret: null,
    error: null,
    isLoading: false,
  });

  const { data: courseData, isLoading: isLoadingCourse, error: courseError } = useCourseDetail(slug || '');
  const { data: cohortsData, isLoading: isLoadingCohorts, error: cohortsError, refetch: refetchCohorts } = useCohorts(slug || '');
  const createPaymentIntentMutation = useCreatePaymentIntent();

  const course = courseData?.data;
  const cohorts = cohortsData?.results || [];

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.step]);

  // Format price for display
  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return num.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });
  };

  // Handle cohort selection
  const handleCohortSelect = (cohortId: string, cohortData: Cohort) => {
    setState(prev => ({ ...prev, selectedCohort: cohortData, error: null }));
  };

  // Proceed to next step
  const handleContinue = () => {
    if (state.step === 1 && !state.selectedCohort) {
      setState(prev => ({ ...prev, error: 'Please select a cohort to continue' }));
      return;
    }

    if (state.step < 3) {
      setState(prev => ({ ...prev, step: (prev.step + 1) as EnrollmentStep, error: null }));
    }
  };

  // Go back to previous step
  const handleBack = () => {
    if (state.step > 1) {
      setState(prev => ({ ...prev, step: (prev.step - 1) as EnrollmentStep, error: null }));
    } else {
      navigate(`/courses/${slug}`);
    }
  };

  // Create enrollment and payment intent
  const handleProceedToPayment = async () => {
    if (!course || !state.selectedCohort) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Create enrollment
      const enrollmentResponse = await createEnrollment({
        course: course.id,
        cohort: state.selectedCohort.id,
        amount_paid: course.price,
      });

      const enrollmentId = enrollmentResponse.data.id;

      // Create payment intent
      const paymentResponse = await createPaymentIntentMutation.mutateAsync({
        enrollment_id: enrollmentId,
      });

      setState(prev => ({
        ...prev,
        enrollmentId,
        clientSecret: paymentResponse.client_secret,
        step: 3,
        isLoading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to create enrollment. Please try again.',
      }));
    }
  };

  // Handle payment success
  const handlePaymentSuccess = (paymentIntentId: string) => {
    // Navigate to confirmation page with enrollment data
    const enrollmentData = {
      enrollmentId: state.enrollmentId,
      courseSlug: slug,
      courseTitle: course?.title || '',
      cohortName: state.selectedCohort ? `${state.selectedCohort.format} Cohort` : '',
      cohortId: state.selectedCohort?.id || '',
      amount: parseFloat(course?.price || '0') * 100, // Convert to cents
      currency: 'USD',
      paymentIntentId,
      enrolledAt: new Date().toISOString(),
    };

    navigate(`/enrollment/confirmation?data=${encodeURIComponent(JSON.stringify(enrollmentData))}`);
  };

  // Handle payment error
  const handlePaymentError = (errorMessage: string) => {
    setState(prev => ({ ...prev, error: errorMessage }));
  };

  // Loading state
  if (isLoadingCourse) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] py-8">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="flex items-center gap-2 mb-8">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-12 w-3/4 mb-8" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (courseError || !course) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] py-8">
        <div className="max-w-[1140px] mx-auto px-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {courseError?.message || 'Error loading course. Please try again.'}
            </AlertDescription>
          </Alert>
          <div className="mt-8 text-center">
            <Button onClick={() => navigate('/courses')}>
              Back to Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, label: 'Select Cohort', icon: Calendar },
    { number: 2, label: 'Review', icon: Users },
    { number: 3, label: 'Payment', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-[1140px] mx-auto px-6 py-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary-600)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {state.step === 1 ? 'Back to Course' : 'Previous Step'}
          </button>
        </div>
      </div>

      <div className="max-w-[1140px] mx-auto px-6 py-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto"
        >
          {/* Step Indicator */}
          <motion.div variants={fadeUpItem} className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = state.step === step.number;
                const isCompleted = state.step > step.number;

                return (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-[var(--color-primary-600)] text-white'
                            : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </div>
                      <span
                        className={`mt-2 text-sm font-medium ${
                          isActive ? 'text-[var(--color-primary-600)]' : 'text-gray-500'
                        }`}
                      >
                        Step {step.number}
                      </span>
                      <span
                        className={`text-xs ${
                          isActive ? 'text-[var(--text-primary)]' : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-4 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Error Alert */}
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {state.step === 1 && (
              <motion.div
                key="step1"
                variants={fadeUpItem}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="border-t-4 border-t-[var(--color-primary-600)]">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl">
                      Select Your Cohort
                    </CardTitle>
                    <CardDescription>
                      Choose a cohort for <strong>{course.title}</strong>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <CohortSelector
                      courseSlug={slug || ''}
                      value={state.selectedCohort?.id || null}
                      onChange={handleCohortSelect}
                      disabled={isLoadingCohorts}
                      error={cohortsError?.message}
                    />

                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={handleContinue}
                        disabled={!state.selectedCohort}
                        className="bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)]"
                      >
                        Continue
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {state.step === 2 && (
              <motion.div
                key="step2"
                variants={fadeUpItem}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="border-t-4 border-t-[var(--color-cyan-500)]">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl">
                      Review Your Enrollment
                    </CardTitle>
                    <CardDescription>
                      Please review your enrollment details before proceeding to payment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Course Details */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-muted-foreground">Course</p>
                          <p className="font-semibold text-lg">{course.title}</p>
                          <p className="text-sm text-muted-foreground">{course.duration}</p>
                        </div>
                        {course.thumbnail && (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                      </div>

                      <Separator />

                      {/* Cohort Details */}
                      {state.selectedCohort && (
                        <div>
                          <p className="text-sm text-muted-foreground">Cohort</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {state.selectedCohort.format}
                            </Badge>
                            <span className="font-medium">
                              {new Date(state.selectedCohort.start_date).toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                              })}{' '}
                              Cohort
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Instructor: {state.selectedCohort.instructor_name}
                          </p>
                        </div>
                      )}

                      <Separator />

                      {/* Price */}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Amount</p>
                          <p className="text-2xl font-bold text-[var(--color-primary-600)]">
                            {formatPrice(course.price)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={handleBack}>
                        Back
                      </Button>
                      <Button
                        onClick={handleProceedToPayment}
                        disabled={state.isLoading}
                        className="bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)]"
                      >
                        {state.isLoading ? (
                          <>
                            <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Proceed to Payment
                            <CreditCard className="ml-2 w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {state.step === 3 && (
              <motion.div
                key="step3"
                variants={fadeUpItem}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -20 }}
              >
                {state.clientSecret && state.selectedCohort && (
                  <PaymentForm
                    clientSecret={state.clientSecret}
                    amount={parseFloat(course.price) * 100}
                    currency="USD"
                    courseTitle={course.title}
                    cohortName={`${state.selectedCohort.format} Cohort`}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default EnrollmentPage;
