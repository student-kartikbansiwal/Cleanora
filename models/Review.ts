import mongoose, { Document, Model, Schema } from "mongoose";

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  body: string;
  images: string[];
  isVerifiedPurchase: boolean;
  status: "pending" | "approved" | "rejected";
  helpfulCount: number;
  helpfulVotes: mongoose.Types.ObjectId[];
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    title: {
      type: String,
      required: [true, "Review title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    body: {
      type: String,
      required: [true, "Review body is required"],
      trim: true,
      minlength: [10, "Review must be at least 10 characters"],
      maxlength: [1000, "Review cannot exceed 1000 characters"],
    },
    images: [{ type: String }],
    isVerifiedPurchase: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    helpfulCount: { type: Number, default: 0 },
    helpfulVotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    adminResponse: { type: String },
  },
  { timestamps: true }
);

// One review per user per product
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });
ReviewSchema.index({ product: 1, status: 1 });
ReviewSchema.index({ rating: -1 });
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ status: 1, createdAt: -1 });

// Update product rating after review status changes
ReviewSchema.post("save", async function () {
  const Review = this.constructor as Model<IReview>;
  const Product = mongoose.model("Product");

  const stats = await Review.aggregate([
    { $match: { product: this.product, status: "approved" } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  await Product.findByIdAndUpdate(this.product, {
    averageRating: stats[0] ? Math.round(stats[0].averageRating * 10) / 10 : 0,
    reviewCount: stats[0]?.reviewCount || 0,
  });
});

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
