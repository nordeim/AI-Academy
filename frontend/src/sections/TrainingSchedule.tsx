import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Calendar, Globe, MapPin, ChevronDown, CheckCircle, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { staggerContainer, fadeUpItem } from "@/lib/animations";
import { useUpcomingCohorts } from "@/hooks/useCohorts";
import type { Cohort } from "@/types/cohort";

const statusConfig: Record<string, {
  bg: string;
  border: string;
  text: string;
  indicator: string;
  label: string;
}> = {
  available: {
    bg: "bg-emerald-50",
    border: "border-emerald-500/25",
    text: "text-emerald-700",
    indicator: "bg-emerald-500",
    label: "OPEN",
  },
  "filling-fast": {
    bg: "bg-amber-50",
    border: "border-amber-500/25",
    text: "text-amber-700",
    indicator: "bg-amber-500",
    label: "FILLING FAST",
  },
  "waitlist": {
    bg: "bg-slate-50",
    border: "border-slate-500/25",
    text: "text-slate-700",
    indicator: "bg-slate-400",
    label: "WAITLIST",
  },
  closed: {
    bg: "bg-gray-50",
    border: "border-gray-500/25",
    text: "text-gray-700",
    indicator: "bg-gray-400",
    label: "CLOSED",
  },
};

export function TrainingSchedule() {
  const navigate = useNavigate();
  const [expandedCohort, setExpandedCohort] = useState<string | null>(null);
  const { data, isLoading, isError } = useUpcomingCohorts();

  const toggleCohort = (id: string) => {
    setExpandedCohort(expandedCohort === id ? null : id);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <section id="schedule" className="section-padding bg-[var(--color-surface-alt)]">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="text-center mb-16">
            <Skeleton className="h-4 w-40 mx-auto mb-4" />
            <Skeleton className="h-10 w-80 mx-auto mb-4" />
            <Skeleton className="h-6 w-[600px] mx-auto" />
          </div>
          <div data-testid="cohorts-loading" className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-[var(--color-border)] p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-16 h-16" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (isError) {
    return (
      <section id="schedule" className="section-padding bg-[var(--color-surface-alt)]">
        <div className="max-w-[1140px] mx-auto px-6">
          <Alert variant="destructive" data-testid="cohorts-error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load cohorts. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }

  const cohorts: Cohort[] = data?.data.results || [];

  // Empty state
  if (cohorts.length === 0) {
    return (
      <section id="schedule" className="section-padding bg-[var(--color-surface-alt)]">
        <div className="max-w-[1140px] mx-auto px-6">
          <div data-testid="cohorts-empty" className="text-center py-12">
            <p className="text-lg text-[var(--text-secondary)]">
              No upcoming cohorts
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="schedule" className="section-padding bg-[var(--color-surface-alt)]">
      <div className="max-w-[1140px] mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Section Header */}
          <motion.div variants={fadeUpItem} className="text-center mb-16">
            <span className="label-mono text-[var(--color-primary-600)] mb-4 block">
              Upcoming Cohorts
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Start Your Journey Soon
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Join a cohort that fits your schedule. All programs include live instruction and hands-on labs.
            </p>
          </motion.div>

          {/* Cohort List */}
          <motion.div variants={staggerContainer} className="space-y-4">
            {cohorts.map((cohort) => {
              const status = statusConfig[cohort.availability_status] || statusConfig.closed;
              const isExpanded = expandedCohort === cohort.id;

              return (
                <motion.div
                  key={cohort.id}
                  variants={fadeUpItem}
                  data-cohort-id={cohort.id}
                  className={`bg-white border transition-all cursor-pointer ${
                    isExpanded
                      ? "border-[var(--color-primary-400)]"
                      : "border-[var(--color-border)] hover:border-[var(--color-primary-300)]"
                  }`}
                  onClick={() => toggleCohort(cohort.id)}
                >
                  {/* Main Row */}
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left - Course & Date */}
                      <div className="flex items-start gap-4">
                        {/* Date Box */}
                        <div className="flex-shrink-0 w-16 h-16 bg-[var(--color-surface-alt)] border border-[var(--color-border)] flex flex-col items-center justify-center">
                          <span className="text-xs text-[var(--text-tertiary)] uppercase label-mono">
                            {format(parseISO(cohort.start_date), "MMM")}
                          </span>
                          <span className="text-xl font-bold text-[var(--text-primary)]">
                            {format(parseISO(cohort.start_date), "d")}
                          </span>
                        </div>

                        {/* Course Info */}
                        <div>
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                              {cohort.course_title}
                            </h3>
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1 border ${status.bg} ${status.border}`}
                            >
                              <motion.span
                                className={`w-2 h-2 rounded-full ${status.indicator}`}
                                animate={cohort.availability_status === "filling-fast" ? { opacity: [1, 0.4, 1] } : {}}
                                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                              />
                              <span className={`label-mono text-xs ${status.text}`}>
                                {status.label}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {/* Calculate duration from start/end dates */}
                              {format(parseISO(cohort.start_date), "MMM d, yyyy")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe className="w-4 h-4" />
                              {cohort.timezone.split("/")[1]?.replace("_", " ") || cohort.timezone}
                            </span>
                            <span className="flex items-center gap-1">
                              {cohort.format === "online" ? (
                                <Globe className="w-4 h-4" />
                              ) : (
                                <MapPin className="w-4 h-4" />
                              )}
                              {cohort.format}
                              {cohort.location && ` • ${cohort.location}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right - Price & Action */}
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[var(--color-primary-600)]">
                            {cohort.early_bird_price ? `$${parseFloat(cohort.early_bird_price).toLocaleString()}` : "Price TBD"}
                          </div>
                          {cohort.early_bird_price && cohort.early_bird_deadline && (
                            <div className="text-xs text-[var(--text-tertiary)]">
                              Early bird ends {format(parseISO(cohort.early_bird_deadline), "MMM d")}
                            </div>
                          )}
                        </div>
                        <Button
                          variant={cohort.availability_status === "available" ? "default" : "outline"}
                          className={`min-w-[140px] ${
                            cohort.availability_status === "available"
                              ? "bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white"
                              : "border-[var(--color-border-strong)] text-[var(--text-primary)]"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (cohort.availability_status === "available" || cohort.availability_status === "filling-fast") {
                              navigate(`/courses/${cohort.course_slug}/enroll`);
                            } else {
                              alert("Waitlist enrollment coming soon!");
                            }
                          }}
                        >
                          {cohort.availability_status === "available"
                            ? "Enroll Now"
                            : cohort.availability_status === "filling-fast"
                            ? "Enroll Now"
                            : "Join Waitlist"}
                        </Button>
                        <ChevronDown
                          className={`w-5 h-5 text-[var(--text-tertiary)] transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2 border-t border-[var(--color-border)]">
                          <div className="grid md:grid-cols-2 gap-6 mt-4">
                            {/* Instructor */}
                            <div>
                              <p className="label-mono text-[var(--text-tertiary)] mb-3">INSTRUCTOR</p>
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-[var(--color-primary-100)] flex items-center justify-center">
                                  <span className="text-lg font-semibold text-[var(--color-primary-600)]">
                                    {cohort.instructor_name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-[var(--text-primary)]">
                                    {cohort.instructor_name}
                                  </p>
                                  <p className="text-sm text-[var(--text-secondary)]">
                                    Lead Instructor
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* What's Included */}
                            <div>
                              <p className="label-mono text-[var(--text-tertiary)] mb-3">WHAT&apos;S INCLUDED</p>
                              <ul className="space-y-2">
                                {[
                                  "Live instruction + recordings",
                                  "Hands-on lab environments",
                                  "Certification exam voucher",
                                  "1-year community access",
                                  "Career support & job referrals",
                                ].map((item) => (
                                  <li
                                    key={item}
                                    className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"
                                  >
                                    <CheckCircle className="w-4 h-4 text-[var(--color-emerald-500)]" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Urgency Banner */}
                          {cohort.availability_status === "filling-fast" && (
                            <div className="mt-6 p-4 bg-[var(--color-amber-50)] border border-[var(--color-amber-500)]/25 flex items-center gap-3">
                              <Zap className="w-5 h-5 text-[var(--color-amber-500)]" />
                              <p className="text-sm text-[var(--color-amber-700)]">
                                Only {cohort.spots_remaining} spots remaining! Enroll now to secure your seat.
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
