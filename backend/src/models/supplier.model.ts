import mongoose, { Document, Schema } from "mongoose";

export interface ISupplierPurchaseLog {
  _id?: mongoose.Types.ObjectId;
  date: Date;
  itemName: string;
  quantity: number;
  totalCost: number;
  paidAmount: number;
}

export interface ISupplier extends Document {
  clinicId: mongoose.Types.ObjectId;
  name: string;
  contactPerson?: string;
  mobile?: string;
  balanceDue: number;
  purchaseHistory: ISupplierPurchaseLog[];
}

const supplierPurchaseLogSchema = new Schema<ISupplierPurchaseLog>({
  date: { type: Date, default: Date.now },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  paidAmount: { type: Number, required: true },
});

const supplierSchema = new Schema<ISupplier>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    name: { type: String, required: true },
    contactPerson: { type: String },
    mobile: { type: String },
    balanceDue: { type: Number, default: 0, required: true },
    purchaseHistory: [supplierPurchaseLogSchema],
  },
  { timestamps: true }
);

// Prevent duplicate supplier name inside the same clinic/hospital tenant
supplierSchema.index({ clinicId: 1, name: 1 }, { unique: true });

const supplierModel = mongoose.model<ISupplier>("Supplier", supplierSchema);
export default supplierModel;
