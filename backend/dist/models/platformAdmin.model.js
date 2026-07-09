import mongoose, { Schema } from "mongoose";
const platformAdminSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["super_admin", "support_admin"], default: "super_admin" },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
const platformAdminModel = mongoose.model("PlatformAdmin", platformAdminSchema);
export default platformAdminModel;
