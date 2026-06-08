import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  label: string;
  name: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      match: [/^[6-9]\d{9}$/, "Please provide a valid phone number"],
    },
    street: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: {
      type: String,
      required: true,
      match: [/^[1-9][0-9]{5}$/, "Please provide a valid pincode"],
    },
    country: { type: String, default: "India" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AddressSchema.index({ user: 1 });
AddressSchema.index({ user: 1, isDefault: 1 });

const Address: Model<IAddress> =
  mongoose.models.Address ||
  mongoose.model<IAddress>("Address", AddressSchema);

export default Address;
