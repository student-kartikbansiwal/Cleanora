import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAnalytics extends Document {
  date: Date;
  revenue: number;
  ordersCount: number;
  newUsersCount: number;
  pageViews: number;
  conversionRate: number;
  topProducts: {
    product: mongoose.Types.ObjectId;
    soldCount: number;
    revenue: number;
  }[];
  paymentMethodBreakdown: {
    method: string;
    count: number;
    revenue: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    revenue: { type: Number, default: 0 },
    ordersCount: { type: Number, default: 0 },
    newUsersCount: { type: Number, default: 0 },
    pageViews: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    topProducts: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        soldCount: Number,
        revenue: Number,
      },
    ],
    paymentMethodBreakdown: [
      {
        method: String,
        count: Number,
        revenue: Number,
      },
    ],
  },
  { timestamps: true }
);

AnalyticsSchema.index({ date: -1 });

const Analytics: Model<IAnalytics> =
  mongoose.models.Analytics ||
  mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);

export default Analytics;
