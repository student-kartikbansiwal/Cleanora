"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2, ShoppingBag, Truck, BadgePercent, Phone,
  Mail, ChevronRight, Check, ArrowRight, Loader2, Users
} from "lucide-react";
import toast from "react-hot-toast";

const PRODUCTS = [
  "Bathroom Cleaner",
  "Toilet Cleaner",
  "Floor Cleaner",
  "Phenyl",
  "Hand Wash",
  "Dish Wash Liquid",
  "Glass Cleaner",
  "Kitchen Cleaner",
  "Multi-Purpose Cleaner",
  "Sanitizer",
];

const BENEFITS = [
  { icon: BadgePercent, title: "Up to 40% Discount", desc: "Volume-based pricing tiers for bulk orders above ₹10,000" },
  { icon: Truck, title: "Free Delivery", desc: "Pan-India delivery at no extra cost on bulk orders" },
  { icon: Users, title: "Dedicated Account Manager", desc: "A single point of contact for all your business needs" },
  { icon: ShoppingBag, title: "Flexible MOQ", desc: "Minimum order quantity tailored to your business size" },
];

interface FormState {
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  businessType: string;
  products: string[];
  estimatedMonthly: string;
  message: string;
}

export default function BulkOrderPage() {
  const [form, setForm] = useState<FormState>({
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    city: "",
    businessType: "",
    products: [],
    estimatedMonthly: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleProduct = (product: string) => {
    setForm((f) => ({
      ...f,
      products: f.products.includes(product)
        ? f.products.filter((p) => p !== product)
        : [...f.products, product],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.products.length === 0) {
      toast.error("Please select at least one product");
      return;
    }
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    setSubmitted(true);
    toast.success("Bulk order enquiry submitted! We'll contact you within 24 hours.");
  };

  if (submitted) {
    return (
      <div className="pt-20 min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md mx-4"
        >
          <div className="w-20 h-20 bg-[#E6FFF5] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={36} className="text-[#00A86B]" />
          </div>
          <h1 className="text-2xl font-black text-[#0F172A] mb-3">Enquiry Received! 🎉</h1>
          <p className="text-[#64748B] mb-2">
            Thank you, <strong>{form.contactPerson}</strong>! Our B2B team will review your request and reach out to{" "}
            <strong>{form.email}</strong> within 24 business hours.
          </p>
          <p className="text-sm text-[#64748B] mb-8">
            For urgent queries, WhatsApp us at{" "}
            <a href="https://wa.me/919876543210" className="text-[#00A86B] font-semibold">+91 98765 43210</a>
          </p>
          <Link href="/" className="btn-primary inline-flex">
            Back to Home <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-[#0F172A] py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#00A86B]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00A86B]/20 text-[#00A86B] text-sm font-semibold mb-5">
                <Building2 size={14} />
                B2B / Bulk Orders
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
                Wholesale Cleaning Products for{" "}
                <span className="text-[#00A86B]">Your Business</span>
              </h1>
              <p className="text-white/60 text-lg mb-8 leading-relaxed">
                Hotels, hospitals, offices, restaurants, facility management companies — get Cleanora products
                at unbeatable bulk prices with dedicated support.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#enquiry-form" className="btn-primary">
                  Get a Quote <ChevronRight size={18} />
                </a>
                <a
                  href="https://wa.me/919876543210?text=Hi!+I+need+bulk+pricing+for+Cleanora+products."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors"
                >
                  <Phone size={16} /> WhatsApp Us
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-14 bg-[#E6FFF5]">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-5 border border-[#00A86B]/20"
                >
                  <div className="w-11 h-11 bg-[#00A86B]/10 rounded-xl flex items-center justify-center mb-3">
                    <Icon size={22} className="text-[#00A86B]" />
                  </div>
                  <h3 className="font-bold text-[#0F172A] mb-1">{b.title}</h3>
                  <p className="text-sm text-[#64748B]">{b.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-14 bg-white">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-[#0F172A] mb-2">Volume Pricing Tiers</h2>
            <p className="text-[#64748B]">The more you order, the more you save</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {[
              { label: "Silver", min: "₹10,000", max: "₹50,000", discount: "10%", color: "border-gray-200 bg-gray-50" },
              { label: "Gold", min: "₹50,000", max: "₹2,00,000", discount: "25%", color: "border-[#00A86B] bg-[#E6FFF5]", highlight: true },
              { label: "Platinum", min: "₹2,00,000+", max: null, discount: "40%", color: "border-[#0F172A] bg-[#0F172A]", dark: true },
            ].map((tier) => (
              <div
                key={tier.label}
                className={`rounded-2xl border-2 p-6 text-center ${tier.color} ${tier.highlight ? "scale-105 shadow-lg" : ""}`}
              >
                {tier.highlight && (
                  <span className="inline-block px-3 py-1 rounded-full bg-[#00A86B] text-white text-xs font-bold mb-3">
                    Most Popular
                  </span>
                )}
                <p className={`font-black text-xl mb-1 ${tier.dark ? "text-white" : "text-[#0F172A]"}`}>
                  {tier.label}
                </p>
                <p className={`text-sm mb-3 ${tier.dark ? "text-white/50" : "text-[#64748B]"}`}>
                  {tier.min}{tier.max ? ` – ${tier.max}` : ""}
                </p>
                <p className={`text-4xl font-black ${tier.dark ? "text-[#00A86B]" : "text-[#00A86B]"}`}>
                  {tier.discount}
                </p>
                <p className={`text-sm mt-1 ${tier.dark ? "text-white/50" : "text-[#64748B]"}`}>discount</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry Form */}
      <section id="enquiry-form" className="py-16 bg-gray-50">
        <div className="container-custom max-w-3xl">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#00A86B]/10 text-[#00A86B] text-sm font-semibold mb-3">
              Get a Custom Quote
            </span>
            <h2 className="text-3xl font-black text-[#0F172A] mb-2">Submit Your Bulk Order Enquiry</h2>
            <p className="text-[#64748B]">Fill in the form and our B2B team will get back to you within 24 hours</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-[var(--color-border)] p-8 shadow-sm"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Business Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                    placeholder="Acme Hotels Pvt. Ltd."
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    value={form.contactPerson}
                    onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))}
                    placeholder="Your full name"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                    Business Email *
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="procurement@company.com"
                      className="input-field pl-9"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="input-field pl-9"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    placeholder="Mumbai, Delhi, Bangalore..."
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                    Business Type *
                  </label>
                  <select
                    value={form.businessType}
                    onChange={(e) => setForm((f) => ({ ...f, businessType: e.target.value }))}
                    className="input-field"
                    required
                  >
                    <option value="">Select type</option>
                    {["Hotel / Hospitality", "Hospital / Healthcare", "Office / Corporate", "Restaurant / F&B",
                      "Facility Management", "Retail / Supermarket", "School / Institution", "Government", "Other"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Selection */}
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-3">
                  Products Required * <span className="text-[#64748B] font-normal">(select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRODUCTS.map((product) => (
                    <button
                      key={product}
                      type="button"
                      onClick={() => toggleProduct(product)}
                      className={`px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-all ${
                        form.products.includes(product)
                          ? "bg-[#00A86B] border-[#00A86B] text-white"
                          : "border-[var(--color-border)] text-[#64748B] hover:border-[#00A86B]/50 hover:text-[#00A86B]"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {form.products.includes(product) && <Check size={13} />}
                        {product}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                  Estimated Monthly Order Value
                </label>
                <select
                  value={form.estimatedMonthly}
                  onChange={(e) => setForm((f) => ({ ...f, estimatedMonthly: e.target.value }))}
                  className="input-field"
                >
                  <option value="">Select range</option>
                  {["Below ₹10,000", "₹10,000 – ₹50,000", "₹50,000 – ₹2,00,000", "₹2,00,000+"].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                  Additional Requirements
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Custom packaging, specific concentrations, delivery frequency..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-base"
              >
                {loading ? (
                  <><Loader2 size={20} className="animate-spin" /> Submitting Enquiry...</>
                ) : (
                  <>Submit Bulk Order Enquiry <ArrowRight size={18} /></>
                )}
              </button>

              <p className="text-xs text-center text-[#64748B]">
                Or reach us directly:{" "}
                <a href="mailto:sales@cleanora.in" className="text-[#00A86B] font-semibold">
                  sales@cleanora.in
                </a>{" "}
                ·{" "}
                <a href="tel:+919876543210" className="text-[#00A86B] font-semibold">
                  +91 98765 43210
                </a>
              </p>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
