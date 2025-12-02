import mongoose, { Schema } from "mongoose";
const MedicineSchema = new Schema({
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    quantity: { type: String },
});
const PrescriptionSchema = new Schema({
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    },
    patientAadhar: {
        type: String,
        required: true
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
    },
    diagnosis: { type: String, required: true },
    symptoms: { type: [String], default: [] },
    medicines: { type: [MedicineSchema], required: true },
    recommendedTests: { type: [String], default: [] },
    notes: { type: String },
    pdfUrl: { type: String }
});
const PrescriptionModel = mongoose.model("Prescription", PrescriptionSchema);
export default PrescriptionModel;
//# sourceMappingURL=prescription.model.js.map