import mongoose, { Schema } from "mongoose";
const bedSchema = new Schema({
    bedNumber: { type: String, required: true },
    status: {
        type: String,
        enum: ["Available", "Occupied", "Cleaning", "Maintenance"],
        default: "Available",
        required: true,
    },
    currentAdmissionId: { type: Schema.Types.ObjectId, ref: "IPDAdmission" },
});
const wardSchema = new Schema({
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ["General", "Semi-Private", "Private", "ICU", "Deluxe"],
        required: true,
    },
    chargePerDay: { type: Number, required: true, default: 0 },
    beds: [bedSchema],
}, { timestamps: true });
// Prevent duplicate ward name in the same clinic/hospital tenant
wardSchema.index({ clinicId: 1, name: 1 }, { unique: true });
const wardModel = mongoose.model("Ward", wardSchema);
export default wardModel;
