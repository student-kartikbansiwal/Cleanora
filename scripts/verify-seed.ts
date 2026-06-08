/**
 * Verifies seeded data is queryable the same way the app uses it.
 * Usage: npx tsx scripts/verify-seed.ts
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import mongoose from "mongoose";
import Category from "../models/Category";
import Product from "../models/Product";
import User from "../models/User";

function loadEnvFile(filename: string) {
  const envPath = resolve(process.cwd(), filename);
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  await mongoose.connect(uri);

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@cleanora.in").toLowerCase();

  const [categoryCount, productCount, featuredCount, bestSellerCount, admin] =
    await Promise.all([
      Category.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, isFeatured: true }),
      Product.countDocuments({ isActive: true, isBestSeller: true }),
      User.findOne({ email: adminEmail }).select("email role isVerified isActive"),
    ]);

  const bathroomCategory = await Category.findOne({ slug: "bathroom-cleaner" });
  const bathroomProducts = bathroomCategory
    ? await Product.find({ category: bathroomCategory._id, isActive: true })
        .select("name slug price")
        .lean()
    : [];

  const featuredProducts = await Product.find({ isActive: true, isFeatured: true })
    .select("name slug")
    .limit(3)
    .lean();

  const checks = [
    { name: "Categories seeded (10)", pass: categoryCount === 10, actual: categoryCount },
    { name: "Products seeded (12)", pass: productCount === 12, actual: productCount },
    { name: "Featured products (9)", pass: featuredCount === 9, actual: featuredCount },
    { name: "Best sellers (6)", pass: bestSellerCount === 6, actual: bestSellerCount },
    {
      name: "Bathroom category filter works",
      pass: bathroomProducts.length === 2,
      actual: bathroomProducts.length,
    },
    {
      name: "Admin user exists with admin role",
      pass: admin?.role === "admin" && admin.isActive === true,
      actual: admin ? `${admin.email} (${admin.role})` : "not found",
    },
    {
      name: "Featured products queryable",
      pass: featuredProducts.length >= 3,
      actual: featuredProducts.map((p) => p.name).join(", "),
    },
  ];

  console.log("\n🔍 Seed verification\n");
  let allPassed = true;

  for (const check of checks) {
    const icon = check.pass ? "✅" : "❌";
    console.log(`${icon} ${check.name} → ${check.actual}`);
    if (!check.pass) allPassed = false;
  }

  console.log(allPassed ? "\n✅ All verification checks passed.\n" : "\n❌ Some checks failed.\n");

  await mongoose.disconnect();
  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error("Verification failed:", err);
  mongoose.disconnect().finally(() => process.exit(1));
});
