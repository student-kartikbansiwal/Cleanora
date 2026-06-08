"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Leaf } from "lucide-react";

const FLOATING_PRODUCTS = [
  { name: "Floor Cleaner", color: "from-blue-400 to-blue-600", emoji: "🧴", delay: 0 },
  { name: "Hand Wash", color: "from-primary-400 to-primary-600", emoji: "🫧", delay: 0.5 },
  { name: "Sanitizer", color: "from-teal-400 to-teal-600", emoji: "✨", delay: 1 },
  { name: "Bathroom Cleaner", color: "from-violet-400 to-violet-600", emoji: "🚿", delay: 1.5 },
];

const STATS = [
  { value: "New Brand", label: "Launching Soon" },
  { value: "Made in India", label: "Quality Products" },
  { value: "GST Ready", label: "Business Support" },
  { value: "100%", label: "Quality Focused" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen gradient-hero flex items-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[100px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container-custom relative z-10 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/20 text-sm text-primary-400 font-medium mb-8"
            >
              <Sparkles size={16} className="text-primary-400" />
              Premium Cleaning Products · Made in India
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6"
            >
              Clean{" "}
              <span className="text-gradient bg-gradient-to-r from-primary-400 to-emerald-400">
                Smarter
              </span>
              ,<br />
              Live{" "}
              <span className="text-gradient bg-gradient-to-r from-emerald-400 to-teal-400">
                Better
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-white/60 leading-relaxed mb-10 max-w-lg"
            >
              Cleanora brings you professional-grade cleaning solutions for your home and
              business. Effective, safe, and eco-conscious formulas that deliver spotless results.
            </motion.p>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              {[
                { icon: Shield, label: "Non-Toxic Formula" },
                { icon: Leaf, label: "Eco-Friendly" },
                { icon: Sparkles, label: "Professional Grade" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-xs font-medium border border-white/10"
                >
                  <Icon size={13} className="text-primary-400" />
                  {label}
                </span>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-2xl shadow-glow hover:shadow-glow-lg transition-all duration-300 text-base"
              >
                Shop Now
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/bulk-order"
                className="inline-flex items-center gap-2 px-8 py-4 glass border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all duration-300 text-base"
              >
                Bulk Orders (B2B)
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-4 gap-6 mt-14 pt-8 border-t border-white/10"
            >
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Floating Product Cards */}
          <div className="hidden lg:flex items-center justify-center relative h-[520px]">
            {/* Central glow */}
            <div className="absolute w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />

            {/* Main product visual */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-52 h-64 rounded-3xl bg-gradient-to-br from-primary-500/30 to-primary-600/10 border border-primary-500/30 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="text-center">
                <div className="text-6xl mb-3">🫧</div>
                <p className="text-white font-bold text-sm">Cleanora</p>
                <p className="text-primary-300 text-xs">Premium Range</p>
              </div>
            </motion.div>

            {/* Floating cards */}
            {FLOATING_PRODUCTS.map((product, i) => {
              const positions = [
                { top: "10%", left: "-5%" },
                { top: "5%", right: "0%" },
                { bottom: "15%", left: "-10%" },
                { bottom: "8%", right: "-5%" },
              ];
              return (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: [0, -8, 0],
                  }}
                  transition={{
                    opacity: { delay: product.delay + 0.5 },
                    scale: { delay: product.delay + 0.5 },
                    y: {
                      delay: product.delay,
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                  className="absolute glass border border-white/20 rounded-2xl p-4 w-36"
                  style={positions[i]}
                >
                  <div className="text-2xl mb-2">{product.emoji}</div>
                  <p className="text-white text-xs font-semibold leading-tight">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-amber-400 text-xs">★★★★★</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/30 text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-white/20 flex items-center justify-center">
          <div className="w-1 h-2 bg-white/40 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
