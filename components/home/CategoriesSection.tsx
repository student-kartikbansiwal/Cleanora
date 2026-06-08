"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const CATEGORIES = [
  { name: "Bathroom Cleaner", slug: "bathroom-cleaner", emoji: "🚿", color: "from-blue-50 to-blue-100", border: "border-blue-200", text: "text-blue-700", count: 12 },
  { name: "Toilet Cleaner", slug: "toilet-cleaner", emoji: "🚽", color: "from-violet-50 to-violet-100", border: "border-violet-200", text: "text-violet-700", count: 8 },
  { name: "Floor Cleaner", slug: "floor-cleaner", emoji: "🧹", color: "from-amber-50 to-amber-100", border: "border-amber-200", text: "text-amber-700", count: 15 },
  { name: "Phenyl", slug: "phenyl", emoji: "🫧", color: "from-pink-50 to-pink-100", border: "border-pink-200", text: "text-pink-700", count: 6 },
  { name: "Hand Wash", slug: "hand-wash", emoji: "🙌", color: "from-teal-50 to-teal-100", border: "border-teal-200", text: "text-teal-700", count: 10 },
  { name: "Dish Wash", slug: "dish-wash-liquid", emoji: "🍽️", color: "from-green-50 to-green-100", border: "border-green-200", text: "text-green-700", count: 9 },
  { name: "Glass Cleaner", slug: "glass-cleaner", emoji: "🪟", color: "from-sky-50 to-sky-100", border: "border-sky-200", text: "text-sky-700", count: 5 },
  { name: "Kitchen Cleaner", slug: "kitchen-cleaner", emoji: "🍳", color: "from-orange-50 to-orange-100", border: "border-orange-200", text: "text-orange-700", count: 7 },
  { name: "Multi-Purpose", slug: "multi-purpose-cleaner", emoji: "✨", color: "from-primary-50 to-primary-100", border: "border-primary-200", text: "text-primary-700", count: 11 },
  { name: "Sanitizer", slug: "sanitizer", emoji: "🛡️", color: "from-red-50 to-red-100", border: "border-red-200", text: "text-red-700", count: 8 },
];

export default function CategoriesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="badge-primary mb-3 inline-block">All Categories</span>
          <h2 className="section-title mb-3">Shop by Category</h2>
          <p className="section-subtitle">
            Find the perfect cleaning solution for every corner of your home
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Link
                href={`/shop?category=${cat.slug}`}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${cat.color} border ${cat.border} hover:shadow-card transition-all duration-300 hover:-translate-y-1 group`}
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {cat.emoji}
                </span>
                <div className="text-center">
                  <p className={`text-sm font-semibold ${cat.text} leading-tight`}>
                    {cat.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {cat.count} products
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
