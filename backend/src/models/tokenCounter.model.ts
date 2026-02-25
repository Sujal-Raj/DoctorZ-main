import mongoose, { Schema, Document } from "mongoose";

export interface ITokenCounter extends Document {
  doctorId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  seq: number;
}

const tokenCounterSchema = new Schema<ITokenCounter>({
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

tokenCounterSchema.index({ doctorId: 1, date: 1 }, { unique: true });

export default mongoose.model<ITokenCounter>(
  "TokenCounter",
  tokenCounterSchema
);