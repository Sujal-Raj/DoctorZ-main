import mongoose, { Schema } from "mongoose";
const emrSchema = new mongoose.Schema({
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: "Doctor",
        default: null,
    },
    fullName: {
        type: String,
        trim: true,
    },
    mobileNumber: {
        type: String,
        trim: true,
    },
    patientId: {
        type: Schema.Types.ObjectId,
        ref: "Patient",
        required: false,
    },
    aadhar: {
        type: Number,
        default: null,
    },
    allergies: {
        type: [String],
        default: [],
    },
    diseases: {
        type: [String],
        default: [],
    },
    pastSurgeries: {
        type: [String],
        default: [],
    },
    currentMedications: {
        type: [String],
        default: [],
    },
    reports: {
        type: [String], // stored as file URL path
        default: [],
    },
    prescriptionId: {
        type: [Schema.Types.ObjectId],
        ref: "Prescription",
        default: [],
    },
}, { timestamps: true });
const EMRModel = mongoose.model("EMR", emrSchema, "EMR");
export default EMRModel;
