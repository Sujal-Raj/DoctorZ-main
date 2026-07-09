import mongoose, { Schema } from "mongoose";
const subscriptionPlanSchema = new Schema({
    name: { type: String, required: true, unique: true },
    priceMonthly: { type: Number, required: true, default: 0 },
    priceYearly: { type: Number, required: true, default: 0 },
    trialDays: { type: Number, required: true, default: 14 },
    features: { type: [String], required: true, default: [] },
    isActive: { type: Boolean, required: true, default: true },
}, { timestamps: true });
const subscriptionPlanModel = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
export default subscriptionPlanModel;
