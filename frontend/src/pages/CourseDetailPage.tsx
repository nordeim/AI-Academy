/**
 * CourseDetailPage Component
 *
 * Full course detail page with enrollment CTAs
 * Phase 5B - Task 5B.2
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { useCourseDetail } from "@/hooks/useCourses";
import { CourseDetail } from "@/types/course";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, Star, Clock, Users, AlertCircle, CheckCircle } from "lucide-react";
import { staggerContainer, fadeUpItem } from "@/lib/animations";

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum" | "instructor">("overview");

  const { data, isLoading, isError, error } = useCourseDetail(slug || "");

  const course = data?.data as CourseDetail | undefined;

  // Format price for display
  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return num.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="section-padding bg-[var(--color-background)] min-h-screen">
        <div className="max-w-[1140px] mx-auto px-6">
          <Skeleton className="h-4 w-32 mb-8" />
          <div data-testid="course-detail-loading" className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    const is404 = (error as any)?.response?.status === 404;
    return (
      <div className="section-padding bg-[var(--color-background)] min-h-screen">
        <div className="max-w-[1140px] mx-auto px-6">
          {is404 ? (
            <div data-testid="course-detail-error" className="text-center py-20">
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                Course not found
              </h1>
              <p className="text-[var(--text-secondary)] mb-6">
                The course you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/courses">
                <Button>Browse All Courses</Button>
              </Link>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load course details. Please try again later.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="bg-[var(--color-background)] min-h-screen"
    >
      {/* Hero Section */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-[1140px] mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <motion.div variants={fadeUpItem} className="mb-6">
            <Link to="/courses" className="text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary-600)] flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              Back to Courses
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left - Course Info */}
            <motion.div variants={fadeUpItem} className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                {course.is_featured && (
                  <span className="px-2 py-1 bg-[var(--color-amber-500)] text-white text-xs font-semibold label-mono">
                    Featured
                  </span>
                )}
                <span className="px-2 py-1 bg-[var(--color-primary-600)]/90 text-white text-xs font-medium">
                  {course.level}
                </span>
                <span className="px-2 py-1 bg-[var(--color-surface-alt)] text-[var(--text-secondary)] text-xs">
                  {course.category.name}
                </span>
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
                {course.title}
              </h1>
              <p className="text-xl text-[var(--text-secondary)] mb-6">
                {course.subtitle}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--text-secondary)]">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-[var(--color-amber-400)] text-[var(--color-amber-400)]" />
                  <span className="font-semibold text-[var(--text-primary)]">{course.rating}</span>
                  <span>({course.review_count.toLocaleString()} reviews)</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {course.enrolled_count.toLocaleString()} students
                </span>
              </div>
            </motion.div>

            {/* Right - Enrollment Card */}
            <motion.div variants={fadeUpItem}>
              <div className="bg-white border border-[var(--color-border)] p-6 sticky top-6">
                <div className="mb-4">
                  <span className="text-3xl font-bold text-[var(--color-primary-600)]">
                    {formatPrice(course.price)}
                  </span>
                  {course.compare_at_price && parseFloat(course.compare_at_price) > parseFloat(course.price) && (
                    <span className="ml-2 text-lg text-[var(--text-tertiary)] line-through">
                      {formatPrice(course.compare_at_price)}
                    </span>
                  )}
                </div>

                <Button size="lg" className="w-full bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white mb-4">
                  Enroll Now
                </Button>

                <p className="text-xs text-[var(--text-tertiary)] text-center mb-4">
                  30-day money-back guarantee
                </p>

                <div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-2">This course includes:</p>
                  {[
                    `${course.modules.length} modules`,
                    "Live instruction + recordings",
                    "Hands-on labs",
                    "Certificate of completion",
                    "Lifetime access",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <CheckCircle className="w-4 h-4 text-[var(--color-emerald-500)]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-[1140px] mx-auto px-6 py-8">
        <div className="border-b border-[var(--color-border)] mb-8">
          <div className="flex gap-8">
            {["overview", "curriculum", "instructor"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`pb-4 text-sm font-medium capitalize transition-colors relative ${
                  activeTab === tab
                    ? "text-[var(--color-primary-600)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary-600)]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <motion.div variants={fadeUpItem}>
                <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-4">
                  About this course
                </h2>
                <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {course.description}
                </p>
              </motion.div>
            )}

            {/* Curriculum Tab */}
            {activeTab === "curriculum" && (
              <motion.div variants={fadeUpItem}>
                <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-4">
                  Course Curriculum
                </h2>
                <div className="space-y-4">
                  {course.modules.map((module, index) => (
                    <div
                      key={module.id}
                      className="flex items-start gap-4 p-4 bg-white border border-[var(--color-border)]"
                    >
                      <span className="flex-shrink-0 w-8 h-8 bg-[var(--color-primary-600)] text-white flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-medium text-[var(--text-primary)]">{module.title}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">{module.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Instructor Tab */}
            {activeTab === "instructor" && (
              <motion.div variants={fadeUpItem}>
                <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-4">
                  About the Instructor
                </h2>
                <div className="flex items-start gap-4 p-6 bg-white border border-[var(--color-border)]">
                  <div className="w-16 h-16 bg-[var(--color-primary-100)] flex items-center justify-center text-2xl font-bold text-[var(--color-primary-600)]">
                    {course.instructor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-2">
                      {course.instructor.name}
                    </h3>
                    <p className="text-[var(--text-secondary)]">{course.instructor.bio}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
