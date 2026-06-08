"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Building2, ArrowRight, CheckCircle } from "lucide-react";

const B2B_FEATURES = [
  "Minimum order from 50 units",
  "Custom labeling available",
  "Dedicated account manager",
  "Credit terms for businesses",
  "Priority delivery",
  "Volume-based pricing",
  "GST invoice provided",
  "Free sampling on request",
];

const BUSINESS_TYPES = [
  { emoji: "🏨", label: "Hotels & Hospitality" },
  { emoji: "🏢", label: "Offices & Corporates" },
  { emoji: "🍽️", label: "Restaurants & Cafes" },
  { emoji: "🏥", label: "Hospitals & Clinics" },
  { emoji: "🏫", label: "Schools & Colleges" },
  { emoji: "🏗️", label: "Industries & Factories" },
];

export default function B2BSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="rounded-3xl bg-gradient-to-br from-navy-700 to-navy-800 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left */}
            <div className="p-10 lg:p-14">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/20 text-primary-400 text-sm font-medium mb-6">
                  <Building2 size={15} />
                  Business Solutions
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  Bulk Orders for <br />
                  <span className="text-primary-400">Businesses & Institutions</span>
                </h2>
                <p className="text-white/60 leading-relaxed mb-8">
                  Whether you&apos;re a small office or a large hotel chain, Cleanora has the
                  perfect cleaning solution for your business. Get competitive pricing,
                  reliable supply, and dedicated support.
                </p>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                  {B2B_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-primary-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/70 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/bulk-order"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors"
                  >
                    Get Bulk Quote
                    <ArrowRight size={18} />
                  </Link>
                  <a
                    href="mailto:b2b@cleanora.in"
                    className="inline-flex items-center gap-2 px-6 py-3 glass border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Email Us
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Right */}
            <div className="bg-primary-500/10 p-10 lg:p-14 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-white/50 text-sm font-medium uppercase tracking-wider mb-6">
                  Trusted by businesses in
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {BUSINESS_TYPES.map((type) => (
                    <div
                      key={type.label}
                      className="glass border border-white/10 rounded-xl p-4 text-center hover:border-primary-500/40 transition-colors"
                    >
                      <span className="text-3xl block mb-2">{type.emoji}</span>
                      <span className="text-white/70 text-xs font-medium leading-tight">
                        {type.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/10">
                  {[
                    { value: "Launching Soon", label: "New Brand" },
                    { value: "Growing Network", label: "Building Partnerships" },
                    { value: "Bulk Order Support", label: "B2B Services" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-2xl font-black text-primary-400">{stat.value}</p>
                      <p className="text-white/40 text-xs mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
