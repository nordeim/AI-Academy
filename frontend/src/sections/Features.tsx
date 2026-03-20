import { motion } from "framer-motion";
import { Video, Laptop, Briefcase, Award, Users, BookOpen } from "lucide-react";
import { staggerContainer, fadeUpItem } from "@/lib/animations";
import { features } from "@/data/mockData";

const iconMap: Record<string, React.ElementType> = {
  Video,
  Laptop,
  Briefcase,
  Award,
  Users,
  BookOpen,
};

export function Features() {
  return (
    <section className="section-padding bg-[var(--color-surface-alt)]">
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
              Why Choose Us
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              A complete learning experience designed for working professionals
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature) => {
              const Icon = iconMap[feature.icon] || Laptop;
              return (
                <motion.div
                  key={feature.id}
                  variants={fadeUpItem}
                  className="flex flex-col"
                >
                  <div className="w-12 h-12 bg-[var(--color-primary-100)] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[var(--color-primary-600)]" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
