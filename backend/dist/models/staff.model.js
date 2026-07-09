import mongoose, { Schema } from "mongoose";
const staffSchema = new Schema({
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
}, { timestamps: true });
const staffModel = mongoose.model("Staff", staffSchema);
export default staffModel;
