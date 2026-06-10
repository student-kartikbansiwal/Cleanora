"use client";

import { useState } from "react";
import ContentPage from "@/components/layout/ContentPage";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "What is the minimum order for free shipping?",
    a: "Orders above ₹499 qualify for free standard shipping across India.",
  },
  {
    q: "How long does delivery take?",
    a: "Metro cities: 2–4 days. Other areas: 4–10 business days depending on location.",
  },
  {
    q: "Can I return a product?",
    a: "Yes, unopened products in original packaging can be returned within 7 days of delivery.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Credit/Debit cards, UPI, Net Banking via Razorpay, and Cash on Delivery.",
  },
  {
    q: "Are Cleanora products safe for children and pets?",
    a: "Our products are formulated to be safe when used as directed. Keep out of reach of children and pets.",
  },
  {
    q: "How do I track my order?",
    a: "Use the Track Order page with your order ID, or check the link in your confirmation email.",
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ContentPage
      badge="Support"
      title="Frequently Asked Questions"
      subtitle="Quick answers to common questions."
    >
      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div key={faq.q} className="bg-white rounded-2xl border border-border overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <span className="font-semibold text-[#0F172A] pr-4">{faq.q}</span>
              <ChevronDown
                size={18}
                className={`text-[#64748B] flex-shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-[#64748B] text-sm leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </ContentPage>
  );
}
