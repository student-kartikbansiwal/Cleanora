"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail, Phone, MapPin, Clock, Send, Loader2,
  MessageSquare, Building2, ShoppingBag
} from "lucide-react";
import toast from "react-hot-toast";

const CONTACT_OPTIONS = [
  {
    icon: ShoppingBag,
    title: "Order Support",
    description: "Questions about your order, delivery, or returns",
    color: "bg-primary-50 text-primary-600",
  },
  {
    icon: Building2,
    title: "B2B Enquiry",
    description: "Bulk orders, wholesale pricing, business accounts",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: MessageSquare,
    title: "General Enquiry",
    description: "Product information, feedback, or anything else",
    color: "bg-violet-50 text-violet-600",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", subject: "", message: "", type: "General Enquiry"
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1500));
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm({ name: "", email: "", phone: "", subject: "", message: "", type: "General Enquiry" });
    setLoading(false);
  };

  return (
    <div className="pt-20 min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-[#0F172A] py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#00A86B]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#00A86B]/20 text-[#00A86B] text-sm font-semibold mb-4">
              Get In Touch
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              We&apos;re Here to Help
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Have a question or need assistance? Our team typically responds within 2-4 hours on business days.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-16">
        {/* Contact Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {CONTACT_OPTIONS.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <motion.button
                key={opt.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setForm((f) => ({ ...f, type: opt.title }))}
                className={`p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
                  form.type === opt.title
                    ? "border-[#00A86B] bg-[#E6FFF5]"
                    : "border-[var(--color-border)] bg-white hover:border-[#00A86B]/40"
                }`}
              >
                <div className={`w-11 h-11 rounded-xl ${opt.color} flex items-center justify-center mb-3`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-[#0F172A] mb-1">{opt.title}</h3>
                <p className="text-sm text-[#64748B]">{opt.description}</p>
              </motion.button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-3xl border border-[var(--color-border)] p-8 shadow-sm"
          >
            <h2 className="text-2xl font-black text-[#0F172A] mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Your full name"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Phone (optional)</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Subject *</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    placeholder="How can we help?"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Message *</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Tell us more about your query..."
                  rows={5}
                  className="input-field resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-base"
              >
                {loading ? (
                  <><Loader2 size={20} className="animate-spin" /> Sending...</>
                ) : (
                  <><Send size={18} /> Send Message</>
                )}
              </button>
            </form>
          </motion.div>

          {/* Info Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {[
              {
                icon: Phone,
                title: "Call Us",
                lines: ["+91 98765 43210", "+91 80000 12345"],
                color: "bg-primary-50 text-primary-600",
              },
              {
                icon: Mail,
                title: "Email Us",
                lines: ["support@cleanora.in", "sales@cleanora.in"],
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: MapPin,
                title: "Office Address",
                lines: ["123, Cleanora Tower, Industrial Area", "Phase 2, Gurugram, Haryana 122001"],
                color: "bg-violet-50 text-violet-600",
              },
              {
                icon: Clock,
                title: "Working Hours",
                lines: ["Mon–Sat: 9:00 AM – 6:00 PM", "Sunday: 10:00 AM – 2:00 PM"],
                color: "bg-amber-50 text-amber-600",
              },
            ].map((info) => {
              const Icon = info.icon;
              return (
                <div key={info.title} className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl ${info.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-[#0F172A] mb-1">{info.title}</p>
                      {info.lines.map((line) => (
                        <p key={line} className="text-sm text-[#64748B]">{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-5 rounded-2xl bg-[#25D366] text-white font-semibold hover:bg-[#22c55e] transition-colors"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.562 4.14 1.538 5.874L0 24l6.298-1.518A11.956 11.956 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.792-.51-5.382-1.4l-.382-.228-3.966.955.998-3.867-.25-.4A9.954 9.954 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
