import mongoose, { Schema } from "mongoose";
const referralSchema = new Schema({
    referralId: { type: String, required: true, unique: true },
    type: {
        type: String,
        enum: ["DOCTOR_TO_DOCTOR", "HOSPITAL_TO_HOSPITAL", "DOCTOR_TO_HOSPITAL", "HOSPITAL_TO_LAB"],
        required: true
    },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    referredByHospitalId: { type: Schema.Types.ObjectId, ref: "Clinic" },
    referredByDoctorId: { type: Schema.Types.ObjectId, ref: "Doctor" },
    referredToHospitalId: { type: Schema.Types.ObjectId, ref: "Clinic" },
    externalHospitalName: { type: String },
    referredToDoctorId: { type: Schema.Types.ObjectId, ref: "Doctor" },
    referredToLabId: { type: Schema.Types.ObjectId, ref: "Lab" },
    externalLabName: { type: String },
    reason: { type: String, required: true },
    notes: { type: String },
    priority: { type: String, enum: ["Routine", "Urgent", "Emergency"], default: "Routine" },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Scheduled", "Completed", "Cancelled", "Expired", "Rejected"],
        default: "Pending"
    },
    attachments: [
        {
            url: { type: String, required: true },
            name: { type: String, required: true },
            type: { type: String, required: true },
        }
    ],
    thread: [
        {
            senderId: { type: String, required: true },
            senderName: { type: String, required: true },
            message: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });
referralSchema.index({ referredToHospitalId: 1, status: 1 });
referralSchema.index({ referredToDoctorId: 1, status: 1 });
referralSchema.index({ referredToLabId: 1, status: 1 });
referralSchema.index({ referredByHospitalId: 1 });
referralSchema.index({ patientId: 1 });
const referralModel = mongoose.model("Referral", referralSchema);
export default referralModel;
