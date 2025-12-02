import mongoose from "mongoose";
export interface IMedicine extends Document {
    name: string;
    dosage: string;
    quantity?: string;
}
export interface IPrescription extends Document {
    doctorId: mongoose.Schema.Types.ObjectId | string;
    patientAadhar: string;
    bookingId: mongoose.Types.ObjectId | string;
    diagnosis: string;
    symptoms: string[];
    medicines: IMedicine[];
    recommendedTests?: string[];
    pdfUrl?: string;
    notes?: string;
}
declare const PrescriptionModel: mongoose.Model<IPrescription, {}, {}, {}, mongoose.Document<unknown, {}, IPrescription, {}, {}> & IPrescription & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
export default PrescriptionModel;
//# sourceMappingURL=prescription.model.d.ts.map