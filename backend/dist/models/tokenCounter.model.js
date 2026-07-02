import mongoose, { Schema } from "mongoose";
const tokenCounterSchema = new Schema({
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
export default mongoose.model("TokenCounter", tokenCounterSchema);
