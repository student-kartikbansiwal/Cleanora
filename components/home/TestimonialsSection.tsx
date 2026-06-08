"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Homemaker, Delhi",
    avatar: "PS",
    rating: 5,
    review:
      "Cleanora's bathroom cleaner is absolutely amazing! It removes tough stains effortlessly and leaves a fresh fragrance. I've been using it for 6 months now.",
    product: "Bathroom Cleaner",
  },
  {
    name: "Rajesh Kumar",
    role: "Restaurant Owner, Mumbai",
    avatar: "RK",
    rating: 5,
    review:
      "As a restaurant owner, hygiene is my top priority. Cleanora's kitchen cleaner and dish wash are exceptional. Great quality and bulk pricing for B2B customers.",
    product: "Kitchen Cleaner + Dish Wash",
  },
  {
    name: "Anita Mehta",
    role: "Working Professional, Bangalore",
    avatar: "AM",
    rating: 5,
    review:
      "The hand wash is gentle yet effective. Love that it's eco-friendly and doesn't dry out my skin. Fast delivery too — ordered today, got tomorrow!",
    product: "Hand Wash",
  },
  {
    name: "Suresh Patel",
    role: "Hotel Manager, Pune",
    avatar: "SP",
    rating: 5,
    review:
      "Bulk orders are seamlessly handled by Cleanora's B2B team. The floor cleaner works great across all types of flooring in our hotel. Highly recommended!",
    product: "Floor Cleaner (Bulk)",
  },
  {
    name: "Deepa Nair",
    role: "Mother of 2, Kochi",
    avatar: "DN",
    rating: 5,
    review:
      "Finally found a sanitizer that's effective and safe for my kids. Cleanora products are certified and tested. Peace of mind guaranteed!",
    product: "Sanitizer",
  },
  {
    name: "Mohammed Ali",
    role: "Office Manager, Hyderabad",
    avatar: "MA",
    rating: 5,
    review:
      "We switched our entire office cleaning to Cleanora products. The multi-purpose cleaner is incredibly versatile. Great value for money and quality service.",
    product: "Multi-Purpose Cleaner",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-navy-700 overflow-hidden">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/20 text-primary-400 text-sm font-medium mb-3">
            ⭐ Trusted by 50,000+ customers
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            What Our Customers Say
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Real reviews from real customers. See why India trusts Cleanora for their cleaning needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass border border-white/10 rounded-2xl p-6 relative"
            >
              <Quote
                size={30}
                className="text-primary-500/30 absolute top-4 right-4"
              />
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star key={j} size={14} className="star-filled" />
                ))}
              </div>
              {/* Review */}
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                &ldquo;{testimonial.review}&rdquo;
              </p>
              {/* Product Badge */}
              <span className="inline-block px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-lg mb-4">
                Purchased: {testimonial.product}
              </span>
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <span className="text-primary-400 font-bold text-sm">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-white/40 text-xs">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
