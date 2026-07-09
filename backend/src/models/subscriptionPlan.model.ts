import mongoose, { Document, Schema } from "mongoose";

export interface ISubscriptionPlan extends Document {
  name: string;
  priceMonthly: number;
  priceYearly: number;
  trialDays: number;
  features: string[]; // e.g. ["OPD", "EMR", "IPD", "Billing", "HR", "Inventory"]
  isActive: boolean;
}

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true, unique: true },
    priceMonthly: { type: Number, required: true, default: 0 },
    priceYearly: { type: Number, required: true, default: 0 },
    trialDays: { type: Number, required: true, default: 14 },
    features: { type: [String], required: true, default: [] },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

const subscriptionPlanModel = mongoose.model<ISubscriptionPlan>(
  "SubscriptionPlan",
  subscriptionPlanSchema
);

export default subscriptionPlanModel;
