"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Are Cleanora products safe for children and pets?",
    a: "Yes! All Cleanora products are formulated with safety in mind. They are free from harsh chemicals like ammonia and chlorine bleach. However, we recommend keeping cleaning products out of reach of children and following the usage instructions on each product.",
  },
  {
    q: "Do you offer free delivery?",
    a: "We offer free delivery on all orders above ₹499. For orders below ₹499, a nominal shipping charge of ₹49 is applied. Deliveries are typically completed within 2-5 business days.",
  },
  {
    q: "What is your return policy?",
    a: "We offer a hassle-free 7-day return policy for any product that is defective or damaged. Simply contact our customer support team with your order ID and we'll arrange a pickup at no cost.",
  },
  {
    q: "Can I get bulk pricing for my business?",
    a: "Absolutely! We have a dedicated B2B program for businesses, institutions, and resellers. Contact us at b2b@cleanora.in or fill the bulk order form for custom pricing based on your volume requirements.",
  },
  {
    q: "Are your products eco-friendly?",
    a: "Yes, Cleanora is committed to sustainability. Our products use biodegradable ingredients, and our packaging is recyclable. We are working towards a carbon-neutral supply chain by 2026.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order is shipped, you'll receive a tracking number via email and SMS. You can also track your order anytime from your Cleanora account under 'My Orders' or use our Order Tracking page.",
  },
  {
    q: "Do you accept UPI and Cash on Delivery?",
    a: "Yes! We accept all major payment methods including UPI, Credit/Debit Cards via Razorpay, and Cash on Delivery (COD) for eligible pin codes.",
  },
  {
    q: "How can I contact customer support?",
    a: "You can reach us via WhatsApp (+91 7500545500), email (kartik.bansiwal2005@gmail.com), or our contact form. Our support team is available Monday to Saturday, 9 AM to 7 PM IST.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-background">
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="badge-primary mb-3 inline-block">FAQ</span>
          <h2 className="section-title mb-3">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Everything you need to know about Cleanora products and services
          </p>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-navy-700 pr-4">{faq.q}</span>
                <ChevronDown
                  size={20}
                  className={`text-primary-500 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-muted-foreground leading-relaxed text-sm">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
