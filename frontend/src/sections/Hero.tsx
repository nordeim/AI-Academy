import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Zap, Users, Award } from "lucide-react";
import { staggerContainer, fadeUpItem } from "@/lib/animations";
import { stats } from "@/data/mockData";

export function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[var(--color-background)] pt-[68px]">
      {/* Grid Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--color-primary-600) 1px, transparent 1px),
                           linear-gradient(90deg, var(--color-primary-600) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[var(--color-primary-500)]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[var(--color-cyan-500)]/10 rounded-full blur-3xl" />

      <div className="relative max-w-[1140px] mx-auto px-6 py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col justify-center"
          >
            {/* Status Badge */}
            <motion.div variants={fadeUpItem} className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-100)] border border-[var(--color-primary-500)]/25">
                <motion.span
                  className="w-2 h-2 rounded-full bg-[var(--color-primary-500)]"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                />
                <span className="label-mono text-[var(--color-primary-700)]">
                  Now Enrolling: April Cohorts
                </span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeUpItem}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.1] mb-6"
            >
              Master{" "}
              <span className="text-[var(--color-primary-600)]">AI Engineering</span>
              <br />
              in 12 Weeks
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUpItem}
              className="text-lg md:text-xl text-[var(--text-secondary)] max-w-xl mb-8 leading-relaxed"
            >
              Build production-grade AI systems with live instruction from industry experts.
              Join <span className="font-semibold text-[var(--text-primary)]">50,000+</span> engineers who accelerated their careers.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUpItem} className="flex flex-wrap gap-4 mb-12">
              <Button
                size="lg"
                className="bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white px-8 h-12 text-base font-medium"
                onClick={() => scrollToSection("#courses")}
              >
                Explore Programs
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-[var(--color-border-strong)] text-[var(--text-primary)] hover:bg-[var(--color-surface-alt)] px-8 h-12 text-base font-medium"
                onClick={() => scrollToSection("#schedule")}
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUpItem}
              className="grid grid-cols-3 gap-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-[var(--color-amber-500)]" />
                  <span className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                    {stats.completionRate}%
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">Completion Rate</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-[var(--color-cyan-500)]" />
                  <span className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                    {stats.placementRate}%
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">Placement Rate</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-[var(--color-emerald-500)]" />
                  <span className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                    {stats.averageSalaryIncrease}%
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">Avg. Salary Increase</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop"
                  alt="AI Engineering"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-transparent to-transparent" />
              </div>

              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute -bottom-6 -left-6 bg-white border border-[var(--color-border)] p-4 shadow-card-hover"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--color-primary-100)] flex items-center justify-center">
                    <Zap className="w-5 h-5 text-[var(--color-primary-600)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Live Classes</p>
                    <p className="text-xs text-[var(--text-secondary)]">Interactive sessions</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="absolute -top-6 -right-6 bg-white border border-[var(--color-border)] p-4 shadow-card-hover"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--color-emerald-100)] flex items-center justify-center">
                    <Award className="w-5 h-5 text-[var(--color-emerald-600)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Certified</p>
                    <p className="text-xs text-[var(--text-secondary)]">Industry recognized</p>
                  </div>
                </div>
              </motion.div>

              {/* Code Snippet Decoration */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="absolute bottom-20 right-0 bg-[#1e293b] p-4 font-mono text-xs text-[#94a3b8] shadow-xl"
              >
                <div className="flex gap-1.5 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                </div>
                <pre className="leading-relaxed">
                  <span className="text-[#c084fc]">import</span>{" "}
                  <span className="text-[#60a5fa]">OpenAI</span>{" "}
                  <span className="text-[#c084fc]">from</span>{" "}
                  <span className="text-[#a3e635]">&quot;openai&quot;</span>
                  {"\n"}
                  <span className="text-[#c084fc]">const</span>{" "}
                  <span className="text-[#60a5fa]">response</span>{" "}
                  <span className="text-[#94a3b8]">=</span>{" "}
                  <span className="text-[#c084fc]">await</span>{" "}
                  <span className="text-[#60a5fa]">ai</span>
                  <span className="text-[#94a3b8]">.</span>
                  <span className="text-[#fbbf24]">generate</span>
                  <span className="text-[#94a3b8]">()</span>
                </pre>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
