import mongoose, { Schema } from "mongoose";
const bookingSchema = new Schema({
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Patient", required: false },
    bookedBy: {
        type: String,
        enum: ["patient", "receptionist"],
        required: true,
        default: "patient"
    },
    patient: {
        type: Object,
        required: true,
        default: {},
    },
    slot: { type: String, required: true },
    slotId: {
        type: Schema.Types.ObjectId,
        ref: "TimeSlot",
        required: true,
    },
    dateTime: { type: Date, required: true },
    mode: { type: String, enum: ["online", "offline"], required: true },
    fees: { type: Number, required: true },
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending",
        required: true,
    },
    roomId: {
        type: String,
        required: true,
    },
    meetingLink: {
        type: String,
        // required:true,
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
const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
