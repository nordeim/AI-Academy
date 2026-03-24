import { motion } from "framer-motion";
import { ArrowRight, Building2, Users, GraduationCap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { staggerContainer, slideInLeft, slideInRight } from "@/lib/animations";

export function ConsultingCTA() {
  
  const benefits = [
    "Custom curriculum tailored to your tech stack",
    "Flexible scheduling for global teams",
    "Dedicated account manager",
    "Volume discounts for 10+ enrollments",
    "Progress tracking and reporting",
  ];

  return (
    <section id="enterprise" className="section-padding bg-[var(--color-primary-900)]">
      <div className="max-w-[1140px] mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div variants={slideInLeft}>
              <span className="label-mono text-[var(--color-primary-300)] mb-4 block">
                Enterprise Solutions
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Train Your Team at Scale
              </h2>
              <p className="text-lg text-[var(--color-primary-200)] mb-8 leading-relaxed">
                Upskill your engineering team with customized training programs designed around your technology stack and business goals.
              </p>

              {/* Benefits */}
              <ul className="space-y-3 mb-8">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3 text-[var(--color-primary-100)]">
                    <div className="w-5 h-5 bg-[var(--color-primary-600)] flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-white text-[var(--color-primary-900)] hover:bg-[var(--color-primary-100)]"
                  onClick={() => alert("Contact us at sales@aiacademy.com for enterprise inquiries")}
                >
                  Talk to Sales
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[var(--color-primary-400)] text-white hover:bg-[var(--color-primary-800)]"
                  onClick={() => alert("Brochure download coming soon!")}
                >
                  Download Brochure
                </Button>
              </div>
            </motion.div>

            {/* Right - Stats Cards */}
            <motion.div
              variants={slideInRight}
              className="grid sm:grid-cols-2 gap-4"
            >
              <div className="bg-[var(--color-primary-800)] border border-[var(--color-primary-700)] p-6">
                <Building2 className="w-8 h-8 text-[var(--color-cyan-400)] mb-4" />
                <p className="text-3xl font-bold text-white mb-1">200+</p>
                <p className="text-sm text-[var(--color-primary-300)]">Enterprise Clients</p>
              </div>

              <div className="bg-[var(--color-primary-800)] border border-[var(--color-primary-700)] p-6">
                <Users className="w-8 h-8 text-[var(--color-amber-400)] mb-4" />
                <p className="text-3xl font-bold text-white mb-1">50K+</p>
                <p className="text-sm text-[var(--color-primary-300)]">Engineers Trained</p>
              </div>

              <div className="bg-[var(--color-primary-800)] border border-[var(--color-primary-700)] p-6">
                <GraduationCap className="w-8 h-8 text-[var(--color-emerald-400)] mb-4" />
                <p className="text-3xl font-bold text-white mb-1">94%</p>
                <p className="text-sm text-[var(--color-primary-300)]">Completion Rate</p>
              </div>

              <div className="bg-[var(--color-primary-800)] border border-[var(--color-primary-700)] p-6 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg font-semibold text-white mb-2">
                    Ready to transform your team?
                  </p>
                  <p className="text-sm text-[var(--color-primary-300)]">
                    Get a custom quote in 24 hours
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
