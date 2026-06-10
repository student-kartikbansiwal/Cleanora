"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ContentPageProps {
  badge?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function ContentPage({ badge, title, subtitle, children }: ContentPageProps) {
  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="bg-[#0F172A] py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#00A86B]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {badge && (
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#00A86B]/20 text-[#00A86B] text-sm font-semibold mb-4">
                {badge}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{title}</h1>
            {subtitle && (
              <p className="text-white/60 text-lg max-w-2xl mx-auto">{subtitle}</p>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
