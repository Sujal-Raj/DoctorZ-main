import mongoose from "mongoose";
const doctorSchema = new mongoose.Schema({
    doctorId: { type: String, default: null, required: false },
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
    password: { type: String, required: true },
    email: { type: String, required: true },
    MobileNo: {
        type: String,
        required: true,
    },
    MedicalRegistrationNumber: {
        type: String,
        required: true,
    },
    specialization: {
        type: String,
        required: true,
    },
    qualification: {
        type: String,
        required: true,
    },
    DegreeCertificate: {
        type: String,
        // required:true,
    },
    experience: {
        type: Number,
        required: true,
    },
    consultationFee: {
        type: Number,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    Address: {
        type: String,
        required: true,
    },
    State: {
        type: String,
        required: true,
    },
    City: {
        type: String,
        require: true,
    },
    Aadhar: {
        type: Number,
        required: true,
    },
    District: {
        type: String,
        required: false,
        default: null,
    },
    Pincode: {
        type: Number,
        required: false,
        default: null,
    },
    hprId: {
        type: String,
        required: false,
        default: null,
    },
    achievements: [
        {
            title: { type: String, required: true },
            certificate: { type: String },
        }
    ],
    signature: {
        type: String,
        // required:true,
    },
    photo: {
        type: String,
        // required:true,
    },
    clinic: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Clinic",
        },
    ],
    status: { type: String, default: "pending" },
    availableOnline: {
        type: Boolean,
        default: false,
        required: true,
    },
    listOfMedicine: {
        type: [String],
        default: [],
    },
    // -----------------------
    // ⭐ Added Notifications
    // -----------------------
    notifications: [
        {
            type: {
                type: String, // example: "clinic_request"
            },
            clinicId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Clinic",
            },
            clinicName: String,
            message: String,
            status: {
                type: String,
                enum: ["pending", "accepted", "rejected"],
                default: "pending",
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    //for feedback
    feedback: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            rating: Number,
            comment: String,
            createdAt: { type: Date, default: Date.now }
        }
    ],
    totalRating: {
        type: Number,
        // required:true
        default: 0
    },
    ratingCount: {
        type: Number,
        default: 0,
    }
});
const doctorModel = mongoose.model("Doctor", doctorSchema, "Doctor");
export default doctorModel;
