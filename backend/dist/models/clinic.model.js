import mongoose from "mongoose";
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
    city: { type: String, required: true },
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
    hprId: { type: String, required: false, default: null },
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
    },
    about: {
        type: String,
    },
    vision: {
        type: String,
        default: "To be the leading neurological center recognized for clinical excellence, research, and transformative patient outcomes."
    },
    mission: {
        type: String,
        default: "To deliver exceptional neurological care through innovation, compassion, and a patient-centered approach that improves quality of life."
    },
    // SaaS Fields
    subdomain: { type: String, unique: true, sparse: true },
    allowedFeatures: { type: [String], default: ["OPD", "EMR", "Billing", "HR", "Inventory"] },
    logo: { type: String },
    primaryColor: { type: String, default: "#0c213e" },
    secondaryColor: { type: String, default: "#1a3a5f" },
    subscriptionPlan: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan" },
    subscriptionExpiresAt: { type: Date },
    storageLimitGb: { type: Number, default: 5 },
    storageUsedBytes: { type: Number, default: 0 }
});
const clinicModel = mongoose.model("Clinic", clinicSchema, "Clinic");
export default clinicModel;
