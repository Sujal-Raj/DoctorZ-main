import mongoose, { Schema, Document } from "mongoose";

interface Slot {
  _id?: mongoose.Types.ObjectId | string | undefined;
  time: string;
  isActive: boolean;
}

export interface TimeSlot extends Document {
  doctorId: mongoose.Schema.Types.ObjectId;
  date: Date;
  mode: "offline" | "online"; // offline = Visiting Offline, online = Available Online
  slots: Slot[];
  createdAt?: Date;
}

const slotSchema = new Schema<Slot>({
  time: { type: String, required: true },
  isActive: { type: Boolean, default: true }
});

const timeSlotSchema = new Schema<TimeSlot>({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  date: { type: Date, required: true },
  mode: { type: String, enum: ["offline", "online"], required: true },
  slots: { type: [slotSchema], required: true },
  createdAt: { type: Date, default: Date.now },
});

// Index to ensure unique combination of doctorId, date, and mode
timeSlotSchema.index({ doctorId: 1, date: 1, mode: 1 }, { unique: true });

export default mongoose.model<TimeSlot>("TimeSlot", timeSlotSchema);