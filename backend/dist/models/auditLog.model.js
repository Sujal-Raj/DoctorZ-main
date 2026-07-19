import mongoose, { Schema } from "mongoose";
const auditLogSchema = new Schema({
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
}, { timestamps: { createdAt: true, updatedAt: false } });
// Add robust indexes for fast filtering and reporting
auditLogSchema.index({ hospitalId: 1, createdAt: -1 });
auditLogSchema.index({ module: 1, action: 1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ recordId: 1 });
const auditLogModel = mongoose.model("AuditLog", auditLogSchema);
export default auditLogModel;
