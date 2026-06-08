/**
 * Cleanora database seed script
 *
 * Seeds categories, sample products, and an admin user.
 * Safe to run multiple times — uses upserts keyed by slug / SKU / email.
 *
 * Usage:
 *   npm run seed
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import mongoose from "mongoose";
import Category from "../models/Category";
import Product from "../models/Product";
import User from "../models/User";
import { slugify } from "../lib/utils";

// ---------------------------------------------------------------------------
// Load .env.local without adding dotenv as a dependency
// ---------------------------------------------------------------------------
function loadEnvFile(filename: string) {
  const envPath = resolve(process.cwd(), filename);
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
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

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------
const CATEGORIES = [
  {
    name: "Bathroom Cleaner",
    slug: "bathroom-cleaner",
    description: "Powerful bathroom cleaning solutions for tiles, fixtures, and surfaces.",
    sortOrder: 1,
  },
  {
    name: "Toilet Cleaner",
    slug: "toilet-cleaner",
    description: "Effective toilet bowl cleaners that remove stains and kill germs.",
    sortOrder: 2,
  },
  {
    name: "Floor Cleaner",
    slug: "floor-cleaner",
    description: "Floor cleaners for marble, tile, wood, and laminate surfaces.",
    sortOrder: 3,
  },
  {
    name: "Phenyl",
    slug: "phenyl",
    description: "Classic phenyl disinfectants for mopping and surface sanitization.",
    sortOrder: 4,
  },
  {
    name: "Hand Wash",
    slug: "hand-wash",
    description: "Gentle, effective hand wash liquids for daily hygiene.",
    sortOrder: 5,
  },
  {
    name: "Dish Wash Liquid",
    slug: "dish-wash-liquid",
    description: "Dishwashing liquids that cut grease and leave utensils sparkling.",
    sortOrder: 6,
  },
  {
    name: "Glass Cleaner",
    slug: "glass-cleaner",
    description: "Streak-free glass and mirror cleaners for a crystal-clear shine.",
    sortOrder: 7,
  },
  {
    name: "Kitchen Cleaner",
    slug: "kitchen-cleaner",
    description: "Degreasers and kitchen surface cleaners for a spotless cook space.",
    sortOrder: 8,
  },
  {
    name: "Multi-Purpose Cleaner",
    slug: "multi-purpose-cleaner",
    description: "All-in-one cleaners safe for multiple surfaces around the home.",
    sortOrder: 9,
  },
  {
    name: "Sanitizer",
    slug: "sanitizer",
    description: "Hand and surface sanitizers for on-the-go germ protection.",
    sortOrder: 10,
  },
] as const;

interface SeedProduct {
  name: string;
  categorySlug: string;
  sku: string;
  price: number;
  comparePrice?: number;
  stock: number;
  volume: string;
  shortDescription: string;
  description: string;
  benefits: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  imageUrl: string;
}

const PRODUCTS: SeedProduct[] = [
  {
    name: "Cleanora Bathroom Shine 1L",
    categorySlug: "bathroom-cleaner",
    sku: "CLN-BC-001",
    price: 149,
    comparePrice: 199,
    stock: 120,
    volume: "1 Litre",
    shortDescription: "Removes soap scum and hard-water stains from bathroom tiles and fixtures.",
    description:
      "Cleanora Bathroom Shine is formulated to dissolve soap scum, limescale, and water marks from ceramic tiles, bathtubs, and faucets. Leaves a fresh citrus fragrance and a streak-free finish.",
    benefits: ["Removes hard-water stains", "Safe on ceramic & chrome", "Fresh citrus scent"],
    isFeatured: true,
    isBestSeller: true,
    imageUrl: "https://images.unsplash.com/photo-1585421514284-efb74c2b69bb?w=800&q=80",
  },
  {
    name: "Cleanora Tile & Grout Deep Clean 500ml",
    categorySlug: "bathroom-cleaner",
    sku: "CLN-BC-002",
    price: 99,
    stock: 85,
    volume: "500 ml",
    shortDescription: "Targets grout lines and tile surfaces for a deep bathroom clean.",
    description:
      "A concentrated formula designed to lift dirt from grout lines and textured tiles. Ideal for weekly bathroom maintenance.",
    benefits: ["Grout-line cleaning", "Concentrated formula", "Easy spray application"],
    imageUrl: "https://images.unsplash.com/photo-1628176354949-1a0b0b0b0b0b?w=800&q=80",
  },
  {
    name: "Cleanora Toilet Power Gel 500ml",
    categorySlug: "toilet-cleaner",
    sku: "CLN-TC-001",
    price: 89,
    comparePrice: 110,
    stock: 200,
    volume: "500 ml",
    shortDescription: "Thick gel formula clings under the rim and removes tough toilet stains.",
    description:
      "Cleanora Toilet Power Gel delivers 10x better limescale removal with a thick formula that clings to the bowl. Kills 99.9% of germs with every flush.",
    benefits: ["10x limescale removal", "Kills 99.9% germs", "Thick cling formula"],
    isFeatured: true,
    isBestSeller: true,
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
  },
  {
    name: "Cleanora Floor Sparkle 1L",
    categorySlug: "floor-cleaner",
    sku: "CLN-FC-001",
    price: 129,
    comparePrice: 159,
    stock: 150,
    volume: "1 Litre",
    shortDescription: "Multi-surface floor cleaner safe for marble, tile, and laminate floors.",
    description:
      "Cleanora Floor Sparkle removes everyday dirt and grime while leaving a pleasant lavender fragrance. No residue, no sticky finish — just clean, shiny floors.",
    benefits: ["Safe on marble & tile", "No sticky residue", "Lavender fragrance"],
    isFeatured: true,
    isBestSeller: true,
    imageUrl: "https://images.unsplash.com/photo-1581578731544-c64695cc6952?w=800&q=80",
  },
  {
    name: "Cleanora Herbal Phenyl 1L",
    categorySlug: "phenyl",
    sku: "CLN-PH-001",
    price: 79,
    stock: 180,
    volume: "1 Litre",
    shortDescription: "Classic black phenyl with herbal fragrance for mopping and disinfecting.",
    description:
      "A trusted phenyl disinfectant with long-lasting herbal fragrance. Dilute for mopping or use undiluted for drains and outdoor areas.",
    benefits: ["Powerful disinfectant", "Herbal fragrance", "Economical dilution ratio"],
    isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1563453392213-326e5ee1fdbe?w=800&q=80",
  },
  {
    name: "Cleanora Gentle Hand Wash 250ml",
    categorySlug: "hand-wash",
    sku: "CLN-HW-001",
    price: 69,
    comparePrice: 89,
    stock: 250,
    volume: "250 ml",
    shortDescription: "pH-balanced hand wash that cleans without drying your skin.",
    description:
      "Enriched with aloe vera and vitamin E, Cleanora Gentle Hand Wash removes germs while keeping hands soft and moisturized after every wash.",
    benefits: ["pH-balanced", "Aloe vera enriched", "Dermatologically tested"],
    isFeatured: true,
    isBestSeller: true,
    imageUrl: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=800&q=80",
  },
  {
    name: "Cleanora Lemon Dish Wash 500ml",
    categorySlug: "dish-wash-liquid",
    sku: "CLN-DW-001",
    price: 99,
    stock: 175,
    volume: "500 ml",
    shortDescription: "Cuts through grease and leaves dishes sparkling with a lemon fresh scent.",
    description:
      "Cleanora Lemon Dish Wash powers through oily residue on utensils and cookware. Gentle on hands, tough on grease.",
    benefits: ["Cuts grease fast", "Lemon fresh scent", "Gentle on hands"],
    isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80",
  },
  {
    name: "Cleanora Streak-Free Glass Cleaner 500ml",
    categorySlug: "glass-cleaner",
    sku: "CLN-GC-001",
    price: 119,
    stock: 90,
    volume: "500 ml",
    shortDescription: "Crystal-clear finish for windows, mirrors, and glass surfaces.",
    description:
      "Spray and wipe for a streak-free shine on glass doors, windows, mirrors, and car windshields. Ammonia-free formula.",
    benefits: ["Streak-free shine", "Ammonia-free", "Quick dry formula"],
    imageUrl: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&q=80",
  },
  {
    name: "Cleanora Kitchen Degreaser 500ml",
    categorySlug: "kitchen-cleaner",
    sku: "CLN-KC-001",
    price: 139,
    comparePrice: 169,
    stock: 110,
    volume: "500 ml",
    shortDescription: "Heavy-duty degreaser for stovetops, chimneys, and kitchen counters.",
    description:
      "Breaks down stubborn cooking oil and grease buildup on kitchen surfaces, chimneys, and appliances. Food-safe when rinsed thoroughly.",
    benefits: ["Heavy-duty degreasing", "Works on chimneys", "Food-safe when rinsed"],
    isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800&q=80",
  },
  {
    name: "Cleanora All-Purpose Spray 750ml",
    categorySlug: "multi-purpose-cleaner",
    sku: "CLN-MP-001",
    price: 159,
    comparePrice: 199,
    stock: 130,
    volume: "750 ml",
    shortDescription: "One spray for counters, appliances, furniture, and more.",
    description:
      "Cleanora All-Purpose Spray cleans and disinfects multiple surfaces in one step. Ideal for quick daily wipe-downs across the home.",
    benefits: ["Multi-surface safe", "Disinfects & cleans", "Ready-to-use spray"],
    isFeatured: true,
    isBestSeller: true,
    imageUrl: "https://images.unsplash.com/photo-1610557892470-55d9e80e0a4d?w=800&q=80",
  },
  {
    name: "Cleanora Instant Hand Sanitizer 100ml",
    categorySlug: "sanitizer",
    sku: "CLN-SN-001",
    price: 49,
    comparePrice: 65,
    stock: 300,
    volume: "100 ml",
    shortDescription: "70% alcohol sanitizer that kills 99.9% germs without water.",
    description:
      "Pocket-sized hand sanitizer with 70% ethyl alcohol. Kills 99.9% of germs instantly. Non-sticky, fast-drying formula with aloe vera.",
    benefits: ["70% alcohol", "Kills 99.9% germs", "Pocket-sized"],
    isFeatured: true,
    isBestSeller: true,
    imageUrl: "https://images.unsplash.com/photo-1584308664894-14d9f47cfc3e?w=800&q=80",
  },
  {
    name: "Cleanora Surface Sanitizer 500ml",
    categorySlug: "sanitizer",
    sku: "CLN-SN-002",
    price: 179,
    stock: 95,
    volume: "500 ml",
    shortDescription: "Spray sanitizer for door handles, tables, and high-touch surfaces.",
    description:
      "Hospital-grade surface sanitizer for disinfecting tables, door handles, keyboards, and other frequently touched areas.",
    benefits: ["Hospital-grade formula", "Quick surface disinfection", "Pleasant mild scent"],
    imageUrl: "https://images.unsplash.com/photo-1584483766114-2cea1facf57d?w=800&q=80",
  },
];

// ---------------------------------------------------------------------------
// Seed helpers
// ---------------------------------------------------------------------------
async function seedCategories() {
  const categoryMap = new Map<string, mongoose.Types.ObjectId>();

  for (const cat of CATEGORIES) {
    const result = await Category.findOneAndUpdate(
      { slug: cat.slug },
      {
        $set: {
          name: cat.name,
          description: cat.description,
          sortOrder: cat.sortOrder,
          isActive: true,
        },
        $setOnInsert: {
          slug: cat.slug,
          image: { url: "", publicId: "" },
          productCount: 0,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    categoryMap.set(cat.slug, result._id);
    console.log(`  ✓ Category: ${cat.name}`);
  }

  return categoryMap;
}

async function seedProducts(categoryMap: Map<string, mongoose.Types.ObjectId>) {
  let created = 0;
  let updated = 0;

  for (const item of PRODUCTS) {
    const categoryId = categoryMap.get(item.categorySlug);
    if (!categoryId) {
      console.warn(`  ⚠ Skipping product "${item.name}" — category "${item.categorySlug}" not found`);
      continue;
    }

    const slug = slugify(item.name);
    const publicId = `seed/${slug}`;

    const productData = {
      name: item.name,
      slug,
      description: item.description,
      shortDescription: item.shortDescription,
      price: item.price,
      comparePrice: item.comparePrice,
      category: categoryId,
      tags: [item.categorySlug.replace(/-/g, " "), "cleanora"],
      stock: item.stock,
      sku: item.sku,
      images: [
        {
          url: item.imageUrl,
          publicId,
          alt: item.name,
        },
      ],
      specifications: [
        { key: "Volume", value: item.volume },
        { key: "Brand", value: "Cleanora" },
        { key: "Country of Origin", value: "India" },
      ],
      usageGuide: `Apply as directed on the label. Store in a cool, dry place away from direct sunlight.`,
      benefits: item.benefits,
      volume: item.volume,
      isActive: true,
      isFeatured: item.isFeatured ?? false,
      isBestSeller: item.isBestSeller ?? false,
      averageRating: item.isBestSeller ? 4.5 : 4.0,
      reviewCount: item.isBestSeller ? 48 : 12,
      soldCount: item.isBestSeller ? 320 : 45,
      metaTitle: `${item.name} | Cleanora`,
      metaDescription: item.shortDescription,
    };

    const existing = await Product.findOne({ sku: item.sku });
    if (existing) {
      await Product.findOneAndUpdate({ sku: item.sku }, { $set: productData }, { runValidators: true });
      updated++;
      console.log(`  ↻ Product updated: ${item.name}`);
    } else {
      await Product.create(productData);
      created++;
      console.log(`  ✓ Product created: ${item.name}`);
    }
  }

  // Sync category product counts
  for (const [, categoryId] of categoryMap) {
    const count = await Product.countDocuments({ category: categoryId, isActive: true });
    await Category.findByIdAndUpdate(categoryId, { productCount: count });
  }

  return { created, updated };
}

async function seedAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@cleanora.in").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@1234";

  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    let changed = false;
    if (existing.role !== "admin") {
      existing.role = "admin";
      changed = true;
    }
    if (!existing.isVerified) {
      existing.isVerified = true;
      changed = true;
    }
    if (changed) {
      await existing.save();
      console.log(`  ↻ Admin user updated: ${adminEmail} (role → admin)`);
    } else {
      console.log(`  ↻ Admin user exists: ${adminEmail}`);
    }
    return { email: adminEmail, created: false };
  }

  await User.create({
    name: "Cleanora Admin",
    email: adminEmail,
    password: adminPassword,
    role: "admin",
    isVerified: true,
    isActive: true,
  });

  console.log(`  ✓ Admin user created: ${adminEmail}`);
  return { email: adminEmail, created: true };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set. Copy .env.local.example to .env.local and configure it.");
    process.exit(1);
  }

  console.log("🌱 Starting Cleanora database seed...\n");

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  console.log("📁 Seeding categories...");
  const categoryMap = await seedCategories();

  console.log("\n📦 Seeding products...");
  const { created, updated } = await seedProducts(categoryMap);

  console.log("\n👤 Seeding admin user...");
  const admin = await seedAdminUser();

  const totalProducts = await Product.countDocuments({ isActive: true });
  const totalCategories = await Category.countDocuments({ isActive: true });

  console.log("\n" + "=".repeat(50));
  console.log("🎉 Seed completed successfully!");
  console.log("=".repeat(50));
  console.log(`  Categories : ${totalCategories}`);
  console.log(`  Products   : ${totalProducts} (${created} created, ${updated} updated)`);
  console.log(`  Admin      : ${admin.email}${admin.created ? " (new)" : " (existing)"}`);
  if (admin.created) {
    console.log(`  Password   : ${process.env.SEED_ADMIN_PASSWORD ? "(from SEED_ADMIN_PASSWORD)" : "Admin@1234 (default — change after first login)"}`);
  }
  console.log("=".repeat(50) + "\n");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  mongoose.disconnect().finally(() => process.exit(1));
});
