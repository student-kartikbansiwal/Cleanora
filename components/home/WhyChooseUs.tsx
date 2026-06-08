"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Leaf, Truck, HeadphonesIcon, Award, FlaskConical } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "100% Safe & Certified",
    description:
      "All products meet Indian BIS standards and are tested for safety. No harmful chemicals, safe for families with children.",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Formula",
    description:
      "Biodegradable ingredients that are tough on dirt but gentle on the environment. Minimal environmental footprint.",
    color: "bg-green-50",
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
  },
  {
    icon: FlaskConical,
    title: "Professional Strength",
    description:
      "Commercial-grade formulas available for everyone. Get professional cleaning results at home.",
    color: "bg-violet-50",
    iconColor: "text-violet-600",
    iconBg: "bg-violet-100",
  },
  {
    icon: Truck,
    title: "Fast & Free Delivery",
    description:
      "Free shipping on orders above ₹499. Same-day dispatch for orders placed before 2 PM.",
    color: "bg-amber-50",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
  },
  {
    icon: Award,
    title: "Quality Guaranteed",
    description:
      "10-year brand legacy with over 5 lakh satisfied customers. We stand behind every product we sell.",
    color: "bg-primary-50",
    iconColor: "text-primary-600",
    iconBg: "bg-primary-100",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Customer Support",
    description:
      "Our dedicated support team is always ready to help you. Call, WhatsApp, or email anytime.",
    color: "bg-pink-50",
    iconColor: "text-pink-600",
    iconBg: "bg-pink-100",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-background">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge-primary mb-3 inline-block">Our Promise</span>
          <h2 className="section-title mb-4">Why Choose Cleanora?</h2>
          <p className="section-subtitle">
            We&apos;re not just another cleaning brand. We&apos;re committed to making
            your home safer, cleaner, and healthier.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-2xl ${feature.color} border border-transparent hover:border-border hover:shadow-card transition-all duration-300 group`}
            >
              <div
                className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon size={24} className={feature.iconColor} />
              </div>
              <h3 className="font-bold text-navy-700 mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
