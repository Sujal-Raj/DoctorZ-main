import mongoose, { Schema } from "mongoose";
const slotSchema = new Schema({
    time: { type: String, required: true },
    isActive: { type: Boolean, default: true }
});
const timeSlotSchema = new Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: Date, required: true },
    mode: { type: String, enum: ["offline", "online"], required: true },
    slots: { type: [slotSchema], required: true },
    createdAt: { type: Date, default: Date.now },
});
// Index to ensure unique combination of doctorId, date, and mode
timeSlotSchema.index({ doctorId: 1, date: 1, mode: 1 }, { unique: true });
export default mongoose.model("TimeSlot", timeSlotSchema);
