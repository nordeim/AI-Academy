/**
 * EnrollmentConfirmationPage
 *
 * Success confirmation page displayed after successful enrollment payment.
 * Shows enrollment details, next steps, and navigation CTAs.
 *
 * Features:
 * - Success confirmation display
 * - Enrollment details summary
 * - Next steps guidance
 * - Navigation CTAs
 * - Print/Save receipt option
 *
 * @module pages/EnrollmentConfirmationPage
 */

import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Users, ArrowRight, Download, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCurrencyFormatter } from '@/hooks/usePayment';
import { useCourseDetail } from '@/hooks/useCourses';
import { Skeleton } from '@/components/ui/skeleton';

interface EnrollmentData {
  enrollmentId: string;
  courseSlug: string;
  courseTitle: string;
  cohortName: string;
  cohortId: string;
  amount: number;
  currency: string;
  paymentIntentId: string;
  enrolledAt: string;
}

/**
 * EnrollmentConfirmationPage - Success confirmation
 *
 * TDD Test Cases:
 * - Should render success message
 * - Should display enrollment details from URL params
 * - Should show navigation CTAs
 * - Should handle missing data gracefully
 */
export function EnrollmentConfirmationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { formatAmount } = useCurrencyFormatter();

  // Parse enrollment data from URL
  const enrollmentData: EnrollmentData | null = (() => {
    try {
      const data = searchParams.get('data');
      if (!data) return null;
      return JSON.parse(decodeURIComponent(data));
    } catch {
      return null;
    }
  })();

  // Fetch course details for additional info
  const { data: courseData, isLoading: isLoadingCourse } = useCourseDetail(
    enrollmentData?.courseSlug || ''
  );

  const course = courseData?.data;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle missing enrollment data
  if (!enrollmentData) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Alert variant="destructive">
          <AlertDescription>
            Enrollment information not found. Please check your enrollment status in your profile.
          </AlertDescription>
        </Alert>
        <div className="mt-8 text-center">
          <Button onClick={() => navigate('/courses')}>
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  const { courseTitle, cohortName, amount, currency, enrolledAt, enrollmentId } = enrollmentData;
  const formattedAmount = formatAmount(amount / 100, currency);
  const enrolledDate = new Date(enrolledAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Enrollment Confirmed!
        </h1>
        <p className="text-gray-600">
          You're all set. We've sent a confirmation email with your enrollment details.
        </p>
      </div>

      {/* Enrollment Details Card */}
      <Card className="border-t-4 border-t-green-500 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Enrollment Details</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Confirmed
            </Badge>
          </CardTitle>
          <CardDescription>
            Enrollment ID: {enrollmentId}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Course */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Course</p>
              <p className="font-semibold">{courseTitle}</p>
            </div>
            {isLoadingCourse ? (
              <Skeleton className="w-16 h-16 rounded" />
            ) : course?.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={courseTitle}
                className="w-16 h-16 object-cover rounded"
              />
            ) : null}
          </div>

          <Separator />

          {/* Cohort */}
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Cohort</p>
              <p className="font-semibold">{cohortName}</p>
            </div>
          </div>

          <Separator />

          {/* Enrolled Date */}
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Enrolled On</p>
              <p className="font-semibold">{enrolledDate}</p>
            </div>
          </div>

          <Separator />

          {/* Amount */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Amount Paid</p>
              <p className="text-2xl font-bold text-primary-600">{formattedAmount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="font-medium">Check your email</p>
              <p className="text-sm text-muted-foreground">
                We've sent a confirmation email with your enrollment details and receipt.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="font-medium">Mark your calendar</p>
              <p className="text-sm text-muted-foreground">
                Add the cohort start date to your calendar. We'll send reminders as the date approaches.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="font-medium">Join the community</p>
              <p className="text-sm text-muted-foreground">
                Access course materials and connect with fellow students in your dashboard.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          className="w-full h-12 text-lg"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.print()}
          >
            <Download className="mr-2 w-4 h-4" />
            Save Receipt
          </Button>

          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/courses')}
          >
            Browse More Courses
          </Button>
        </div>
      </div>

      {/* Support Link */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Need help?{' '}
        <a href="mailto:support@aiacademy.com" className="text-primary-600 hover:underline">
          Contact our support team
        </a>
      </p>
    </div>
  );
}

export default EnrollmentConfirmationPage;
