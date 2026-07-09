import mongoose, { Schema } from "mongoose";
const departmentSchema = new Schema({
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    name: { type: String, required: true },
    description: { type: String },
    headDoctorId: { type: Schema.Types.ObjectId, ref: "Doctor" },
    doctors: [{ type: Schema.Types.ObjectId, ref: "Doctor" }],
}, { timestamps: true });
// Prevent duplicate department name inside the same clinic/hospital tenant context
departmentSchema.index({ clinicId: 1, name: 1 }, { unique: true });
const departmentModel = mongoose.model("Department", departmentSchema);
export default departmentModel;
