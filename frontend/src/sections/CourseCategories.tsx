import { motion } from "framer-motion";
import { Brain, BarChart3, Cloud, Shield, Settings, MessageSquare, ArrowRight } from "lucide-react";
import { staggerContainer, fadeUpItem, cardHover } from "@/lib/animations";
import { categories } from "@/data/mockData";

const iconMap: Record<string, React.ElementType> = {
  Brain,
  BarChart3,
  Cloud,
  Shield,
  Settings,
  MessageSquare,
};

export function CourseCategories() {
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
              const Icon = iconMap[category.icon] || Brain;
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
                    style={{ borderTop: `3px solid ${category.color}` }}
                  >
                    <div className="p-6">
                      {/* Icon */}
                      <div
                        className="w-12 h-12 flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${category.color}15` }}
                      >
                        <Icon
                          className="w-6 h-6"
                          style={{ color: category.color }}
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
                          {category.courseCount} courses
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
