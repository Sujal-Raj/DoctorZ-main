import mongoose, { Document, Schema } from "mongoose";

export interface IAuditLog extends Document {
  auditId: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  hospitalId?: mongoose.Types.ObjectId;
  module: string; // e.g. "Patient", "Billing", "Referral"
  action: string; // e.g. "Patient Created", "Report Uploaded"
  details: string; // description
  recordId?: string; // ID of the entity that was affected
  previousValue?: any; // JSON representation of the previous state
  newValue?: any; // JSON representation of the new state
  ipAddress?: string;
  device?: string; // e.g. "Desktop", "Mobile"
  browser?: string; // e.g. "Chrome", "Safari"
  userAgent?: string;
  status: "success" | "failure";
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    auditId: { type: String, unique: true, required: true },
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String },
    hospitalId: { type: Schema.Types.ObjectId, ref: "Clinic" },
    module: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: String, required: true },
    recordId: { type: String },
    previousValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    device: { type: String },
    browser: { type: String },
    userAgent: { type: String },
    status: { type: String, enum: ["success", "failure"], default: "success" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Add robust indexes for fast filtering and reporting
auditLogSchema.index({ hospitalId: 1, createdAt: -1 });
auditLogSchema.index({ module: 1, action: 1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ recordId: 1 });

const auditLogModel = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);

export default auditLogModel;
