import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { partners } from "@/data/mockData";

export function TrustSignals() {
  return (
    <section className="py-12 bg-[var(--color-background)] border-y border-[var(--color-border)]">
      <div className="max-w-[1140px] mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="text-center"
        >
          <motion.p
            variants={fadeIn}
            className="label-mono text-[var(--text-tertiary)] mb-8"
          >
            Trusted by engineers at leading tech companies
          </motion.p>

          <motion.div
            variants={staggerContainer}
            className="flex flex-wrap justify-center items-center gap-8 md:gap-12"
          >
            {partners.map((partner, index) => (
              <motion.div
                key={partner.id}
                variants={fadeIn}
                custom={index}
                className="group relative"
              >
                <div className="w-24 h-12 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain"
                    style={{ filter: "invert(0.3)" }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
