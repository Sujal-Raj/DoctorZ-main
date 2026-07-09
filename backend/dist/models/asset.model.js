import mongoose, { Schema } from "mongoose";
const repairLogSchema = new Schema({
    date: { type: Date, default: Date.now },
    description: { type: String, required: true },
    cost: { type: Number, required: true, default: 0 },
    technician: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Completed"], default: "Completed", required: true },
});
const assetSchema = new Schema({
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    assetName: { type: String, required: true },
    purchaseDate: { type: Date, required: true },
    purchaseCost: { type: Number, required: true },
    depreciationRate: { type: Number, required: true, default: 10 },
    currentValuation: { type: Number, required: true },
    amcExpiryDate: { type: Date },
    amcProvider: { type: String },
    repairLogs: [repairLogSchema],
}, { timestamps: true });
const assetModel = mongoose.model("Asset", assetSchema);
export default assetModel;
