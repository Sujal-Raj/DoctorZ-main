import mongoose, { Document, Schema } from "mongoose";

export interface IBillItem {
  name: string; // e.g. "Deluxe Ward stay", "Syringes"
  quantity: number;
  unitPrice: number;
  total: number;
  inventoryItemId?: mongoose.Types.ObjectId; // For automatic stock deductions
}

export interface IBill extends Document {
  clinicId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  admissionId?: mongoose.Types.ObjectId; // Links to IPD stay if inpatient
  invoiceNumber: string; // e.g. INV-2026-0001
  items: IBillItem[];
  subTotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  status: "Unpaid" | "Partially Paid" | "Paid" | "Refunded";

  // Insurance Tracking
  insuranceClaimed: boolean;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  claimAmount?: number;
  approvedAmount?: number;
  claimStatus?: "Pending" | "Approved" | "Rejected";

  paymentMethod?: "cash" | "upi" | "card" | "netbanking" | "other";
  paymentHistory: Array<{
    date: Date;
    amount: number;
    method: string;
    transactionId?: string;
  }>;
}

const billItemSchema = new Schema<IBillItem>({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
  inventoryItemId: { type: Schema.Types.ObjectId, ref: "Inventory" },
});

const billSchema = new Schema<IBill>(
  {
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
  },
  { timestamps: true }
);

const billModel = mongoose.model<IBill>("Bill", billSchema);
export default billModel;
