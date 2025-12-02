import mongoose, { Schema, Document } from "mongoose";
const slotSchema = new Schema({
    time: { type: String, required: true },
    isActive: { type: Boolean, default: false }
});
const timeSlotSchema = new Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: Date, required: true }, // ek date per slots
    slots: { type: [slotSchema], required: true },
    createdAt: { type: Date, default: Date.now },
});
export default mongoose.model("TimeSlot", timeSlotSchema);
//# sourceMappingURL=timeSlots.model.js.map