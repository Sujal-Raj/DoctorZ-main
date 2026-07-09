import mongoose, { Schema } from "mongoose";
const notificationSchema = new Schema({
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    type: {
        type: String,
        enum: ["Appointment", "Invoice", "Admission", "Discharge", "Reminder"],
        required: true,
    },
    recipientPhone: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["Sent", "Failed"], default: "Sent", required: true },
    sentAt: { type: Date, default: Date.now },
}, { timestamps: true });
const notificationModel = mongoose.model("Notification", notificationSchema);
export default notificationModel;
