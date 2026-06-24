import mongoose, { Document, Model, Schema } from "mongoose";
// IMPORTANT: Import Category so its schema is registered before any
// .populate('category') call. Without this import, Mongoose throws:
// MissingSchemaError: Schema hasn't been registered for model "Category".
import "@/models/Category";

export interface IProductImage {
  url: string;
  publicId: string;
  alt?: string;
}

export interface ISpecification {
  key: string;
  value: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice?: number;
  images: IProductImage[];
  category: mongoose.Types.ObjectId;
  tags: string[];
  stock: number;
  sku: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  averageRating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  specifications: ISpecification[];
  usageGuide: string;
  benefits: string[];
  ingredients?: string;
  volume?: string;
  metaTitle?: string;
  metaDescription?: string;
  soldCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema<IProductImage>({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  alt: { type: String, default: "" },
});

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      maxlength: [300, "Short description cannot exceed 300 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    comparePrice: {
      type: Number,
      min: [0, "Compare price cannot be negative"],
    },
    images: [ProductImageSchema],
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    tags: [{ type: String, lowercase: true, trim: true }],
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      uppercase: true,
    },
    weight: { type: Number },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    specifications: [
      {
        key: String,
        value: String,
      },
    ],
    usageGuide: {
      type: String,
      default: "",
    },
    benefits: [{ type: String }],
    ingredients: { type: String },
    volume: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
    soldCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ averageRating: -1 });
ProductSchema.index({ soldCount: -1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ isBestSeller: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ name: "text", description: "text", tags: "text" }); // Full-text search

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
