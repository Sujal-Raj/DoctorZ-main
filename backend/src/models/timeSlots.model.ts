import mongoose, { Schema, Document } from "mongoose";

interface Slot {
   _id?: mongoose.Types.ObjectId | string| undefined ;
  time: string;
  isActive: boolean;
}

export interface TimeSlot extends Document {
  doctorId: mongoose.Schema.Types.ObjectId;
  date: Date; // ek date ke liye slot banega
  slots: Slot[];
  createdAt?: Date;
}

const slotSchema = new Schema<Slot>(
  {
  time: { type: String, required: true },
  isActive: { type: Boolean, default: false }
  }
   
);

const timeSlotSchema = new Schema<TimeSlot>({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  date: { type: Date, required: true }, // ek date per slots
  slots: { type: [slotSchema], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<TimeSlot>("TimeSlot", timeSlotSchema); 