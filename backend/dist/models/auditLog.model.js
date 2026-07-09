import mongoose, { Schema } from "mongoose";
const auditLogSchema = new Schema({
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String },
    hospitalId: { type: Schema.Types.ObjectId, ref: "Clinic" },
    action: { type: String, required: true },
    details: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });
const auditLogModel = mongoose.model("AuditLog", auditLogSchema);
export default auditLogModel;
