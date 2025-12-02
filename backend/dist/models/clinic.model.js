import mongoose, { Document } from "mongoose";
const clinicSchema = new mongoose.Schema({
    clinicName: {
        type: String,
        required: true,
    },
    clinicType: {
        type: String,
        enum: ["Private", "Government"],
        required: true,
    },
    specialities: { type: [String], required: true },
    // flat address fields
    address: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    pincode: { type: Number, required: true },
    // flat contact fields
    phone: { type: String, required: true },
    email: { type: String, required: true },
    doctors: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
        },
    ],
    clinicLicenseNumber: { type: String, required: true },
    registrationCertificate: { type: String },
    clinicImage: { type: String },
    panNumber: { type: String, required: true },
    operatingHours: { type: String, required: true },
    staffName: {
        type: String,
        required: true,
    },
    staffEmail: {
        type: String,
        required: true,
    },
    staffPassword: {
        type: String,
        required: true,
    },
    staffId: {
        type: String,
        required: true,
        unique: true,
    },
    aadharNumber: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        default: "pending",
        required: true
    }
});
const clinicModel = mongoose.model("Clinic", clinicSchema, "Clinic");
export default clinicModel;
//# sourceMappingURL=clinic.model.js.map