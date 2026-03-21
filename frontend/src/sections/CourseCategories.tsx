import { motion } from "framer-motion";
import { Brain, BarChart3, Cloud, Shield, Settings, MessageSquare, ArrowRight } from "lucide-react";
import { staggerContainer, fadeUpItem, cardHover } from "@/lib/animations";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Brain,
  BarChart3,
  Cloud,
  Shield,
  Settings,
  MessageSquare,
};

// Color mapping for categories (fallback since API doesn't provide colors)
const categoryColors: Record<string, string> = {
  "ai-ml": "#4f46e5",
  "data-engineering": "#06b6d4",
  "cloud-architecture": "#8b5cf6",
  "security": "#10b981",
  "devops": "#f59e0b",
  "communication": "#ec4899",
};

// Icon mapping based on category name
const getCategoryIcon = (slug: string): string => {
  const iconMap: Record<string, string> = {
    "ai-ml": "Brain",
    "data-engineering": "BarChart3",
    "cloud-architecture": "Cloud",
    "security": "Shield",
    "devops": "Settings",
    "communication": "MessageSquare",
  };
  return iconMap[slug] || "Brain";
};

export function CourseCategories() {
  const { data, isLoading, isError } = useCategories();

  // Loading skeleton
  if (isLoading) {
    return (
      <section id="courses" className="section-padding bg-[var(--color-background)]">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="text-center mb-16">
            <Skeleton className="h-4 w-32 mx-auto mb-4" />
            <Skeleton className="h-10 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-[500px] mx-auto" />
          </div>
          <div data-testid="categories-loading" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-[var(--color-border)] p-6">
                <Skeleton className="h-12 w-12 mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-2/3" />
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
      <section id="courses" className="section-padding bg-[var(--color-background)]">
        <div className="max-w-[1140px] mx-auto px-6">
          <Alert variant="destructive" data-testid="categories-error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load categories. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }

  const categories = data?.data.results || [];

  // Empty state
  if (categories.length === 0) {
    return (
      <section id="courses" className="section-padding bg-[var(--color-background)]">
        <div className="max-w-[1140px] mx-auto px-6">
          <div data-testid="categories-empty" className="text-center py-12">
            <p className="text-lg text-[var(--text-secondary)]">
              No categories available
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="section-padding bg-[var(--color-background)]">
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
              Learning Paths
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Choose Your Specialization
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Industry-aligned curricula designed by practitioners from top tech companies
            </p>
          </motion.div>

          {/* Categories Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {categories.map((category) => {
              const Icon = iconMap[getCategoryIcon(category.slug)] || Brain;
              const color = categoryColors[category.slug] || "#4f46e5";
              return (
                <motion.div
                  key={category.id}
                  variants={fadeUpItem}
                  whileHover="hover"
                  initial="rest"
                  animate="rest"
                >
                  <motion.div
                    variants={cardHover}
                    className="group relative bg-white border border-[var(--color-border)] h-full cursor-pointer overflow-hidden"
                    style={{ borderTop: `3px solid ${color}` }}
                  >
                    <div className="p-6">
                      {/* Icon */}
                      <div
                        className="w-12 h-12 flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        <Icon
                          className="w-6 h-6"
                          style={{ color }}
                        />
                      </div>

                      {/* Content */}
                      <h3 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-2">
                        {category.name}
                      </h3>
                      <p className="text-[var(--text-secondary)] text-sm mb-4 leading-relaxed">
                        {category.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                        <span className="text-sm text-[var(--text-tertiary)]">
                          {category.course_count} courses
                        </span>
                        <span className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary-600)] group-hover:gap-2 transition-all">
                          Explore
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
