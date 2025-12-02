///////////////////// Manish Works (Final Fixed Version) ///////////////////////
import mongoose, { Schema, Document } from "mongoose";
const LabSchema = new Schema({
    labId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    pincode: { type: String, required: true },
    timings: {
        open: { type: String, required: true },
        close: { type: String, required: true },
    },
    certificateNumber: { type: String, required: true },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });
export const LabModel = mongoose.model("Lab", LabSchema);
const TestSchema = new Schema({
    testName: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    customCategory: { type: String },
    precaution: { type: String },
    price: { type: Number, required: true },
    labId: { type: Schema.Types.ObjectId, ref: "Lab", required: true },
}, { timestamps: true });
export const TestModel = mongoose.model("LabTest", TestSchema);
const LabTestBookingSchema = new Schema({
    labId: { type: Schema.Types.ObjectId, ref: "Lab", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    testName: { type: String, required: true },
    category: { type: String },
    price: { type: Number },
    status: {
        type: String,
        enum: ["pending", "completed", "cancelled"],
        default: "pending",
    },
    bookedAt: { type: Date, default: Date.now },
}, { timestamps: true });
export const LabTestBookingModel = mongoose.model("LabTestBooking", LabTestBookingSchema);
const LabPackageSchema = new Schema({
    labId: { type: Schema.Types.ObjectId, ref: "Lab", required: true },
    packageName: { type: String, required: true },
    description: { type: String },
    tests: [{ type: Schema.Types.ObjectId, ref: "LabTest" }],
    totalPrice: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });
export const LabPackageModel = mongoose.model("LabPackage", LabPackageSchema);
const PackageBookingSchema = new Schema({
    packageId: { type: Schema.Types.ObjectId, ref: "LabPackage", required: true },
    labId: { type: Schema.Types.ObjectId, ref: "Lab", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    tests: [{ type: Schema.Types.ObjectId, ref: "LabTest" }],
    bookingDate: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ["pending", "completed", "cancelled"],
        default: "pending",
    },
}, { timestamps: true });
export const PackageBookingModel = mongoose.model("PackageBooking", PackageBookingSchema);
//# sourceMappingURL=lab.model.js.map