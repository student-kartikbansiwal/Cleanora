import Link from "next/link";
import { ArrowRight } from "lucide-react";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import mongoose from "mongoose";

export const metadata = {
  title: "Shop by Category | Cleanora",
  description: "Browse all Cleanora cleaning product categories.",
};

export const dynamic = "force-dynamic";

const GRADIENTS = [
  "from-blue-50 to-blue-100 border-blue-200 text-blue-700",
  "from-violet-50 to-violet-100 border-violet-200 text-violet-700",
  "from-amber-50 to-amber-100 border-amber-200 text-amber-700",
  "from-pink-50 to-pink-100 border-pink-200 text-pink-700",
  "from-teal-50 to-teal-100 border-teal-200 text-teal-700",
  "from-green-50 to-green-100 border-green-200 text-green-700",
  "from-sky-50 to-sky-100 border-sky-200 text-sky-700",
  "from-orange-50 to-orange-100 border-orange-200 text-orange-700",
  "from-primary-50 to-primary-100 border-primary-200 text-primary-700",
  "from-red-50 to-red-100 border-red-200 text-red-700",
];

export default async function CategoriesPage() {
  await dbConnect();

  const categories = await Category.find({ isActive: true })
    .select("name slug description")
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  const counts = await Product.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
    { $match: { isActive: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="bg-navy-700 py-14">
        <div className="container-custom">
          <h1 className="text-4xl font-bold text-white mb-2">Shop by Category</h1>
          <p className="text-white/60">
            Find the perfect cleaning solution for every corner of your home.
          </p>
        </div>
      </div>

      <div className="container-custom py-10">
        {categories.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            No categories available yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {categories.map((cat, i) => {
              const count = countMap.get(String(cat._id)) || 0;
              const gradient = GRADIENTS[i % GRADIENTS.length];
              return (
                <Link
                  key={String(cat._id)}
                  href={`/shop?category=${cat.slug}`}
                  className={`group flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-br border ${gradient} hover:shadow-card transition-all duration-300 hover:-translate-y-1 min-h-[150px]`}
                >
                  <div>
                    <p className="font-bold text-lg leading-tight">{cat.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {count} {count === 1 ? "product" : "products"}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold mt-4">
                    Shop now
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
