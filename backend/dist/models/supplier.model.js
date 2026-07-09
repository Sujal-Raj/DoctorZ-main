import mongoose, { Schema } from "mongoose";
const supplierPurchaseLogSchema = new Schema({
    date: { type: Date, default: Date.now },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    paidAmount: { type: Number, required: true },
});
const supplierSchema = new Schema({
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    name: { type: String, required: true },
    contactPerson: { type: String },
    mobile: { type: String },
    balanceDue: { type: Number, default: 0, required: true },
    purchaseHistory: [supplierPurchaseLogSchema],
}, { timestamps: true });
// Prevent duplicate supplier name inside the same clinic/hospital tenant
supplierSchema.index({ clinicId: 1, name: 1 }, { unique: true });
const supplierModel = mongoose.model("Supplier", supplierSchema);
export default supplierModel;
