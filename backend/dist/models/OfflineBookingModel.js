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
        enum: ["pending", "completed"],
        default: "pending",
        required: true,
    },
    paid: {
        type: Boolean,
        require: true,
        default: false,
    }
}, { timestamps: true });
const offlineBooking = mongoose.model("offlineBooking", offlineBookingSchema);
export default offlineBooking;
