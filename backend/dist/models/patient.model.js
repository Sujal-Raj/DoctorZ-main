import mongoose from "mongoose";
const patientSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    dob: {
        type: Date,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePhoto: {
        type: String,
    },
    mobileNumber: {
        type: Number,
        required: true,
    },
    aadhar: {
        type: String,
        unique: true, // ✅ UNIQUE AADHAR
        trim: true,
        required: true,
        match: [/^[0-9]{12}$/, "Invalid aadhar number"],
    },
    address: {
        city: {
            type: String,
            require: true,
        },
        pincode: {
            type: Number,
        },
    },
    abhaId: {
        type: String,
    },
    emergencyContact: {
        name: {
            type: String,
        },
        number: {
            type: Number,
        },
    },
    favouriteDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }],
    favouriteClinics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Clinic" }],
}, { timestamps: true });
const patientModel = mongoose.model("Patient", patientSchema, "Patient");
export default patientModel;
//# sourceMappingURL=patient.model.js.map