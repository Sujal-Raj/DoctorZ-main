import mongoose, { Document, Schema } from "mongoose";

export interface IBed {
  _id?: mongoose.Types.ObjectId;
  bedNumber: string; // e.g. "ICU-01", "G-10"
  status: "Available" | "Occupied" | "Cleaning" | "Maintenance";
  currentAdmissionId?: mongoose.Types.ObjectId; // References IPDAdmission
}

export interface IWard extends Document {
  clinicId: mongoose.Types.ObjectId;
  name: string; // e.g. "Male Medical Ward", "ICU"
  type: "General" | "Semi-Private" | "Private" | "ICU" | "Deluxe";
  chargePerDay: number;
  beds: IBed[];
}

const bedSchema = new Schema<IBed>({
  bedNumber: { type: String, required: true },
  status: {
    type: String,
    enum: ["Available", "Occupied", "Cleaning", "Maintenance"],
    default: "Available",
    required: true,
  },
  currentAdmissionId: { type: Schema.Types.ObjectId, ref: "IPDAdmission" },
});

const wardSchema = new Schema<IWard>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["General", "Semi-Private", "Private", "ICU", "Deluxe"],
      required: true,
    },
    chargePerDay: { type: Number, required: true, default: 0 },
    beds: [bedSchema],
  },
  { timestamps: true }
);

// Prevent duplicate ward name in the same clinic/hospital tenant
wardSchema.index({ clinicId: 1, name: 1 }, { unique: true });

const wardModel = mongoose.model<IWard>("Ward", wardSchema);
export default wardModel;
