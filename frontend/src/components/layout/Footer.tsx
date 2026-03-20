import { motion } from "framer-motion";
import { staggerContainer, fadeUpItem } from "@/lib/animations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Twitter, Linkedin, Github, Youtube } from "lucide-react";

const footerLinks = {
  courses: [
    { label: "AI Engineering", href: "#" },
    { label: "Data Science", href: "#" },
    { label: "Cloud Computing", href: "#" },
    { label: "Cybersecurity", href: "#" },
    { label: "DevOps & SRE", href: "#" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Press", href: "#" },
    { label: "Partners", href: "#" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "Community", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Webinars", href: "#" },
    { label: "Podcast", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Accessibility", href: "#" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-[var(--color-surface-alt)] border-t border-[var(--color-border)]">
      <div className="max-w-[1140px] mx-auto px-6 py-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Top Section */}
          <div className="grid lg:grid-cols-5 gap-12 mb-12">
            {/* Brand & Newsletter */}
            <motion.div variants={fadeUpItem} className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[var(--color-primary-600)] flex items-center justify-center">
                  <span className="text-white font-bold text-lg font-display">A</span>
                </div>
                <span className="font-display font-bold text-xl tracking-tight text-[var(--text-primary)]">
                  Academy
                </span>
              </div>
              <p className="text-[var(--text-secondary)] mb-6 max-w-sm">
                Empowering engineers with production-grade skills through live instruction and hands-on learning.
              </p>

              {/* Newsletter */}
              <div>
                <p className="label-mono text-[var(--text-tertiary)] mb-3">
                  SUBSCRIBE TO OUR NEWSLETTER
                </p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-white border-[var(--color-border)]"
                  />
                  <Button className="bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white px-4">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Links */}
            <motion.div variants={fadeUpItem}>
              <p className="label-mono text-[var(--text-tertiary)] mb-4">COURSES</p>
              <ul className="space-y-2">
                {footerLinks.courses.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary-600)] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={fadeUpItem}>
              <p className="label-mono text-[var(--text-tertiary)] mb-4">COMPANY</p>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary-600)] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={fadeUpItem}>
              <p className="label-mono text-[var(--text-tertiary)] mb-4">RESOURCES</p>
              <ul className="space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary-600)] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <motion.div
            variants={fadeUpItem}
            className="pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center gap-4"
          >
            {/* Copyright */}
            <p className="text-sm text-[var(--text-tertiary)]">
              &copy; {new Date().getFullYear()} AI Academy. All rights reserved.
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-4">
              {footerLinks.legal.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 bg-white border border-[var(--color-border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--color-primary-600)] hover:border-[var(--color-primary-600)] transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
