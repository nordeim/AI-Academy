import { motion } from "framer-motion";
import { Check, Clock, Users, Star, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { staggerContainer, fadeUpItem, slideInLeft, slideInRight } from "@/lib/animations";
import { courses } from "@/data/mockData";

export function FeaturedCourse() {
  const featuredCourse = courses[0]; // AI Engineering Bootcamp

  const inclusions = [
    "Live instruction + recordings",
    "Hands-on lab environments",
    "Certification exam voucher",
    "1-year community access",
    "Career support & job referrals",
    "Lifetime content updates",
  ];

  return (
    <section className="section-padding bg-[var(--color-background)]">
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
              Featured Program
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Our Most Popular Course
            </h2>
          </motion.div>

          {/* Course Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image & Stats */}
            <motion.div
              variants={slideInLeft}
              className="relative"
            >
              <div className="relative aspect-video overflow-hidden border border-[var(--color-border)]">
                <img
                  src={featuredCourse.thumbnail}
                  alt={featuredCourse.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-[var(--color-amber-500)] text-white text-xs font-semibold label-mono">
                    {featuredCourse.badge?.text}
                  </span>
                </div>

                {/* Level Badge */}
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-[var(--color-primary-600)]/90 text-white text-xs font-medium">
                    {featuredCourse.level}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-white border border-[var(--color-border)] p-4 text-center">
                  <Clock className="w-5 h-5 text-[var(--color-primary-600)] mx-auto mb-2" />
                  <p className="text-lg font-semibold text-[var(--text-primary)]">{featuredCourse.duration}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Duration</p>
                </div>
                <div className="bg-white border border-[var(--color-border)] p-4 text-center">
                  <Zap className="w-5 h-5 text-[var(--color-cyan-500)] mx-auto mb-2" />
                  <p className="text-lg font-semibold text-[var(--text-primary)]">{featuredCourse.modules}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Modules</p>
                </div>
                <div className="bg-white border border-[var(--color-border)] p-4 text-center">
                  <Users className="w-5 h-5 text-[var(--color-emerald-500)] mx-auto mb-2" />
                  <p className="text-lg font-semibold text-[var(--text-primary)]">{featuredCourse.enrolledCount.toLocaleString()}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Students</p>
                </div>
              </div>
            </motion.div>

            {/* Right - Details */}
            <motion.div variants={slideInRight}>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">
                {featuredCourse.title}
              </h3>
              
              <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                {featuredCourse.description}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(featuredCourse.rating)
                          ? "fill-[var(--color-amber-400)] text-[var(--color-amber-400)]"
                          : "text-[var(--color-border)]"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {featuredCourse.rating}
                </span>
                <span className="text-sm text-[var(--text-tertiary)]">
                  ({featuredCourse.reviewCount.toLocaleString()} reviews)
                </span>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <p className="label-mono text-[var(--text-tertiary)] mb-3">SKILLS YOU&apos;LL LEARN</p>
                <div className="flex flex-wrap gap-2">
                  {featuredCourse.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-[var(--color-surface-alt)] text-[var(--text-secondary)] text-sm border border-[var(--color-border)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* What's Included */}
              <div className="mb-8">
                <p className="label-mono text-[var(--text-tertiary)] mb-3">WHAT&apos;S INCLUDED</p>
                <ul className="space-y-2">
                  {inclusions.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Check className="w-4 h-4 text-[var(--color-emerald-500)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price & CTA */}
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-[var(--color-primary-600)]">
                      ${featuredCourse.price.amount.toLocaleString()}
                    </span>
                    {featuredCourse.price.original && (
                      <span className="text-lg text-[var(--text-tertiary)] line-through">
                        ${featuredCourse.price.original.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {featuredCourse.spotsRemaining && featuredCourse.spotsRemaining <= 10 && (
                    <p className="text-sm text-[var(--color-amber-600)] mt-1 flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      Only {featuredCourse.spotsRemaining} spots remaining
                    </p>
                  )}
                </div>
                <Button
                  size="lg"
                  className="bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white"
                >
                  Enroll Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
