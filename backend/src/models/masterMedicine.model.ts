import mongoose from "mongoose";

export interface IMasterMedicine {
  name: string;
  type: string;
  composition?: string;
  dosage?: string;
}

const masterMedicineSchema = new mongoose.Schema<IMasterMedicine>({
  name: { type: String, required: true, unique: true, index: true },
  type: { type: String, default: "Tablet" },
  composition: { type: String, default: "" },
  dosage: { type: String, default: "" }
}, { timestamps: true });

// Create text index for search capabilities
masterMedicineSchema.index({ name: "text" });

const MasterMedicineModel = mongoose.model<IMasterMedicine>("MasterMedicine", masterMedicineSchema);
export default MasterMedicineModel;
