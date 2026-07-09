import mongoose, { Document, Schema } from "mongoose";

export interface IRepairLog {
  _id?: mongoose.Types.ObjectId;
  date: Date;
  description: string;
  cost: number;
  technician: string;
  status: "Pending" | "Completed";
}

export interface IAsset extends Document {
  clinicId: mongoose.Types.ObjectId;
  assetName: string;
  purchaseDate: Date;
  purchaseCost: number;
  depreciationRate: number; // e.g. 10 representing 10% per year
  currentValuation: number;
  amcExpiryDate?: Date;
  amcProvider?: string;
  repairLogs: IRepairLog[];
}

const repairLogSchema = new Schema<IRepairLog>({
  date: { type: Date, default: Date.now },
  description: { type: String, required: true },
  cost: { type: Number, required: true, default: 0 },
  technician: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Completed"], default: "Completed", required: true },
});

const assetSchema = new Schema<IAsset>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    assetName: { type: String, required: true },
    purchaseDate: { type: Date, required: true },
    purchaseCost: { type: Number, required: true },
    depreciationRate: { type: Number, required: true, default: 10 },
    currentValuation: { type: Number, required: true },
    amcExpiryDate: { type: Date },
    amcProvider: { type: String },
    repairLogs: [repairLogSchema],
  },
  { timestamps: true }
);

const assetModel = mongoose.model<IAsset>("Asset", assetSchema);
export default assetModel;
