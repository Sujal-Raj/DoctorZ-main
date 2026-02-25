import mongoose, { Schema } from "mongoose";

export interface IPatientInfo {
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  aadhar: string;
  contact: string;
}

export interface IBooking extends Document {
  doctorId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  patient: IPatientInfo;
  slot: string;
  slotId: mongoose.Types.ObjectId;
  dateTime: Date;
  mode: "online" | "offline";
  fees: number;
  status: "pending" | "completed";
  createdAt: Date;
  updatedAt: Date;
  roomId: string;
  meetingLink: string;
}

const offlineBookingSchema = new mongoose.Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },

    userId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
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
  },
  { timestamps: true },
);

const offlineBooking = mongoose.model("offlineBooking", offlineBookingSchema);

export default offlineBooking;
