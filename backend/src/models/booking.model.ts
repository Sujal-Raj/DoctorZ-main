

import mongoose, { Schema, Document } from "mongoose";

export interface IPatientInfo {
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  aadhar: string;
  contact: string;
}

export interface IBooking extends Document {
  doctorId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // who booked
  patient: IPatientInfo;
  slot: string;
  slotId: mongoose.Types.ObjectId;
  dateTime: Date;
  mode: "online" | "offline";
  fees: number;
  status: "pending" | "completed";
  createdAt: Date;
  updatedAt: Date;
  roomId:string;
}

const bookingSchema = new Schema<IBooking>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },

    userId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },

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
  },
  { timestamps: true }
);


const Booking = mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
