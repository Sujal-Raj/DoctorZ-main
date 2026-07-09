import mongoose, { Schema } from "mongoose";
const offlineBookingSchema = new mongoose.Schema({
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Patient", required: false, default: null },
    bookedBy: {
        type: String,
        enum: ["patient", "receptionist"],
        required: true,
    },
    patient: {
        type: Object,
        required: true,
        default: {},
    },
    tokenNumber: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    fees: { type: Number, required: true },
    status: {
        type: String,
        enum: ["pending", "completed", "registered", "waiting", "in-consultation", "cancelled"],
        default: "pending",
        required: true,
    },
    paid: {
        type: Boolean,
        require: true,
        default: false,
    },
    clinicId: {
        type: Schema.Types.ObjectId,
        ref: "Clinic",
        required: false,
        default: null,
    },
    paymentStatus: {
        type: String,
        enum: ["paid", "unpaid", "pending"],
        default: "unpaid",
        required: true,
    },
    paymentDate: {
        type: Date,
        required: false,
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "upi", "card", "netbanking", "other"],
        required: false,
    },
    transactionId: {
        type: String,
        required: false,
    }
}, { timestamps: true });
const offlineBooking = mongoose.model("offlineBooking", offlineBookingSchema);
export default offlineBooking;
