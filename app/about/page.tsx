"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield, Leaf, Award, Users, TrendingUp,
  CheckCircle, ArrowRight, Star
} from "lucide-react";

const STATS = [
  { value: "10M+", label: "Products Sold", icon: TrendingUp },
  { value: "50K+", label: "Happy Customers", icon: Users },
  { value: "4.8★", label: "Average Rating", icon: Star },
  { value: "100%", label: "Genuine Products", icon: Shield },
];

const VALUES = [
  {
    icon: Shield,
    title: "Quality Assurance",
    description: "Every product undergoes rigorous testing to meet safety standards and deliver consistent results.",
    color: "bg-primary-50 text-primary-600",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly",
    description: "We use biodegradable ingredients and sustainable packaging to minimize environmental impact.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Award,
    title: "Industry Certified",
    description: "ISO 9001:2015 certified manufacturing with REACH and BIS compliance for all products.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Users,
    title: "Customer First",
    description: "24/7 support, hassle-free returns, and a community of 50,000+ satisfied customers.",
    color: "bg-blue-50 text-blue-600",
  },
];

const TEAM = [
  { name: "Rajiv Sharma", role: "Founder & CEO", initials: "RS" },
  { name: "Priya Menon", role: "Head of R&D", initials: "PM" },
  { name: "Ankit Gupta", role: "Operations Director", initials: "AG" },
  { name: "Neha Kapoor", role: "Marketing Lead", initials: "NK" },
];

export default function AboutPage() {
  return (
    <div className="pt-20 min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-[#0F172A] py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/3 w-72 h-72 bg-[#00A86B]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#00A86B]/20 text-[#00A86B] text-sm font-semibold mb-4">
                Our Story
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
                Making India Cleaner,{" "}
                <span className="text-[#00A86B]">One Home at a Time</span>
              </h1>
              <p className="text-white/60 text-lg mb-6 leading-relaxed">
                Founded in 2018, Cleanora was born from a simple belief — every Indian home deserves
                world-class cleaning products at honest prices. We formulate, test, and deliver
                premium cleaning solutions that actually work.
              </p>
              <Link href="/shop" className="btn-primary inline-flex">
                Shop Now <ArrowRight size={18} />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {STATS.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className={`bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 ${i === 0 ? "col-span-2 sm:col-span-1" : ""}`}>
                    <Icon size={22} className="text-[#00A86B] mb-3" />
                    <p className="text-3xl font-black text-white">{stat.value}</p>
                    <p className="text-white/50 text-sm mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-[#E6FFF5]">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#00A86B]/20 text-[#00A86B] text-sm font-semibold mb-4">
              Our Mission
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-5">
              Clean Living, Better Living
            </h2>
            <p className="text-[#64748B] text-lg leading-relaxed">
              We believe a cleaner environment leads to healthier lives. Our mission is to develop
              safe, effective, and affordable cleaning products that protect your family, your home,
              and our planet — without compromise.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#00A86B]/10 text-[#00A86B] text-sm font-semibold mb-3">
              What We Stand For
            </span>
            <h2 className="text-3xl font-black text-[#0F172A]">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value, i) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl border border-[var(--color-border)] bg-white hover:shadow-card transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-xl ${value.color} flex items-center justify-center mb-4`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-[#0F172A] mb-2">{value.title}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-14 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-[#0F172A] mb-2">Certifications & Compliance</h2>
            <p className="text-[#64748B]">We meet the highest industry standards</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {["ISO 9001:2015", "BIS Certified", "REACH Compliant", "GreenMark Certified", "MSDS Available"].map((cert) => (
              <div key={cert} className="flex items-center gap-2 bg-white px-5 py-3 rounded-xl border border-[var(--color-border)] shadow-sm">
                <CheckCircle size={16} className="text-[#00A86B]" />
                <span className="text-sm font-semibold text-[#0F172A]">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#00A86B]/10 text-[#00A86B] text-sm font-semibold mb-3">
              Leadership Team
            </span>
            <h2 className="text-3xl font-black text-[#0F172A]">The People Behind Cleanora</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl border border-[var(--color-border)] bg-white hover:shadow-card transition-shadow"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00A86B] to-[#059669] flex items-center justify-center text-white font-black text-lg mx-auto mb-4">
                  {member.initials}
                </div>
                <h3 className="font-bold text-[#0F172A]">{member.name}</h3>
                <p className="text-sm text-[#64748B] mt-1">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#0F172A]">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black text-white mb-4">
              Ready to Experience the Cleanora Difference?
            </h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              Join 50,000+ households who trust Cleanora for a cleaner, healthier home.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/shop" className="btn-primary">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link href="/contact" className="btn-outline border-white/20 text-white hover:bg-white/10">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
