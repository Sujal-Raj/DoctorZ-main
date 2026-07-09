import mongoose, { Schema } from "mongoose";
const nursingNoteSchema = new Schema({
    date: { type: Date, default: Date.now },
    note: { type: String, required: true },
    recordedBy: { type: String, required: true },
});
const vitalRecordSchema = new Schema({
    date: { type: Date, default: Date.now },
    bp: { type: String, required: true },
    temp: { type: Number, required: true },
    heartRate: { type: Number, required: true },
    spo2: { type: Number, required: true },
    recordedBy: { type: String, required: true },
});
const marRecordSchema = new Schema({
    date: { type: Date, default: Date.now },
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },
    status: { type: String, enum: ["Given", "Missed"], default: "Given", required: true },
    administeredBy: { type: String, required: true },
});
const ipdAdmissionSchema = new Schema({
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    wardId: { type: Schema.Types.ObjectId, ref: "Ward", required: true },
    bedNumber: { type: String, required: true },
    admissionDate: { type: Date, default: Date.now },
    dischargeDate: { type: Date },
    reasonForAdmission: { type: String, required: true },
    emergencyContact: {
        name: { type: String, required: true },
        relation: { type: String, required: true },
        contact: { type: String, required: true },
    },
    initialDeposit: { type: Number, default: 0 },
    status: { type: String, enum: ["Admitted", "Discharged"], default: "Admitted", required: true },
    nursingNotes: [nursingNoteSchema],
    vitals: [vitalRecordSchema],
    mar: [marRecordSchema],
    dischargeSummary: {
        date: { type: Date },
        conditionAtDischarge: { type: String },
        advice: { type: String },
        followUpDate: { type: Date },
    },
}, { timestamps: true });
const ipdAdmissionModel = mongoose.model("IPDAdmission", ipdAdmissionSchema);
export default ipdAdmissionModel;
