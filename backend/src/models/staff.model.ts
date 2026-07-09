import mongoose, { Document, Schema } from "mongoose";

export interface IStaff extends Document {
  clinicId: mongoose.Types.ObjectId; // Tenant ID
  staffId: string; // Login ID (e.g. APEX-HR-101)
  passwordHash: string;
  fullName: string;
  email?: string;
  mobileNo?: string;
  role: "Admin" | "Receptionist" | "Cashier" | "Accountant" | "HR" | "Store Manager";
  permissions: string[]; // e.g. ["billing", "hr", "inventory", "opd", "ipd"]
  isActive: boolean;
  
  // HR Module Fields
  department?: string;
  salary?: number;
  shiftStart?: string; // e.g. "09:00"
  shiftEnd?: string;   // e.g. "17:00"
  attendance?: Array<{
    date: Date;
    status: "Present" | "Absent" | "On Leave";
  }>;
  leaves?: Array<{
    date: Date;
    reason: string;
    status: "Pending" | "Approved" | "Rejected";
  }>;
}

const staffSchema = new Schema<IStaff>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    staffId: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String },
    mobileNo: { type: String },
    role: {
      type: String,
      enum: ["Admin", "Receptionist", "Cashier", "Accountant", "HR", "Store Manager"],
      required: true,
    },
    permissions: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    department: { type: String },
    salary: { type: Number, default: 0 },
    shiftStart: { type: String, default: "09:00" },
    shiftEnd: { type: String, default: "17:00" },
    attendance: [
      {
        date: { type: Date, required: true },
        status: { type: String, enum: ["Present", "Absent", "On Leave"], required: true },
      },
    ],
    leaves: [
      {
        date: { type: Date, required: true },
        reason: { type: String, required: true },
        status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
      },
    ],
  },
  { timestamps: true }
);

const staffModel = mongoose.model<IStaff>("Staff", staffSchema);
export default staffModel;
