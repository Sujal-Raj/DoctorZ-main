import mongoose, { Schema } from "mongoose";
const billItemSchema = new Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
    inventoryItemId: { type: Schema.Types.ObjectId, ref: "Inventory" },
});
const billSchema = new Schema({
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    admissionId: { type: Schema.Types.ObjectId, ref: "IPDAdmission" },
    invoiceNumber: { type: String, required: true, unique: true },
    items: [billItemSchema],
    subTotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ["Unpaid", "Partially Paid", "Paid", "Refunded"],
        default: "Unpaid",
        required: true,
    },
    insuranceClaimed: { type: Boolean, default: false },
    insuranceProvider: { type: String },
    insurancePolicyNumber: { type: String },
    claimAmount: { type: Number, default: 0 },
    approvedAmount: { type: Number, default: 0 },
    claimStatus: { type: String, enum: ["Pending", "Approved", "Rejected"] },
    paymentMethod: { type: String },
    paymentHistory: [
        {
            date: { type: Date, default: Date.now },
            amount: { type: Number, required: true },
            method: { type: String, required: true },
            transactionId: { type: String },
        },
    ],
}, { timestamps: true });
const billModel = mongoose.model("Bill", billSchema);
export default billModel;
