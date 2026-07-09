import mongoose, { Document, Schema } from "mongoose";

export interface IAuditLog extends Document {
  userId?: string;
  userName?: string;
  userRole?: string;
  hospitalId?: mongoose.Types.ObjectId;
  action: string; // e.g. "PATIENT_RECORD_DELETED", "INVENTORY_RESTOCK"
  details: string; // description
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String },
    hospitalId: { type: Schema.Types.ObjectId, ref: "Clinic" },
    action: { type: String, required: true },
    details: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const auditLogModel = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);

export default auditLogModel;
