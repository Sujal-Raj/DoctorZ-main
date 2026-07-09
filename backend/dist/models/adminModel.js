import mongoose, { Schema } from "mongoose";
const AdminSchema = new Schema({
    adminId: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["super_admin", "support_admin"],
        default: "super_admin",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const AdminModel = mongoose.model("Admin", AdminSchema);
export default AdminModel;
