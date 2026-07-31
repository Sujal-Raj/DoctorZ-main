

///////////////////// Manish Works (Final Fixed Version) ///////////////////////
import mongoose, { Schema, Document } from "mongoose";

// ------------------ LAB MODEL ------------------
export interface LabDocument extends Document {
  labId: string;
  name: string;
  email: string;
  password: string;
  state: string;
  city: string;
  address: string;
  pincode: string;
  timings: {
    open: string;
    close: string;
  };
  certificateNumber: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  subscriptionPlan?: mongoose.Types.ObjectId;
  subscriptionExpiresAt?: Date;
}

const LabSchema = new Schema<LabDocument>(
  {
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
    subscriptionPlan: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan" },
    subscriptionExpiresAt: { type: Date },
  },
  { timestamps: true }
);

export const LabModel = mongoose.model<LabDocument>("Lab", LabSchema);

// ------------------ TEST MODEL ------------------
export interface TestDocument extends Document {
  testName: string;
  description: string;
  category: string;
  customCategory?: string;
  precaution: string;
  price: number;
  labId: mongoose.Types.ObjectId;
}

const TestSchema = new Schema<TestDocument>(
  {
    testName: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    customCategory: { type: String },
    precaution: { type: String },
    price: { type: Number, required: true },
    labId: { type: Schema.Types.ObjectId, ref: "Lab", required: true },
  },
  { timestamps: true }
);

export const TestModel = mongoose.model<TestDocument>("LabTest", TestSchema);

// ------------------ LAB TEST BOOKING MODEL ------------------
// interface
export interface LabTestBookingDocument extends Document {
  labId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  referredByDoctorId?: mongoose.Types.ObjectId;
  referredByHospitalId?: mongoose.Types.ObjectId;
  testName: string;
  category: string;
  price: number;
  status: "Created" | "Accepted" | "Sample Collection Pending" | "Sample Collected" | "Processing" | "Report Ready" | "Approved" | "Delivered" | "Rejected" | "Cancelled";
  bookingDate: Date; // <-- user chosen date
  bookedAt: Date; // when the booking was created in system
  bookedBy?: string;
  reportUrl?: string;
  testResults?: any; // JSON for individual test markers/ranges
  paymentStatus?: "paid" | "unpaid" | "pending";
  paymentDate?: Date;
  paymentMethod?: "cash" | "upi" | "card" | "netbanking" | "other";
  transactionId?: string;
  expectedDelivery?: Date; // SLA tracking
  actualDelivery?: Date; // TAT tracking
}

const LabTestBookingSchema = new Schema<LabTestBookingDocument>(
  {
    labId: { type: Schema.Types.ObjectId, ref: "Lab", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    referredByDoctorId: { type: Schema.Types.ObjectId, ref: "Doctor" },
    referredByHospitalId: { type: Schema.Types.ObjectId, ref: "Clinic" },
    testName: { type: String, required: true },
    category: { type: String },
    price: { type: Number },
    status: {
      type: String,
      enum: ["Created", "Accepted", "Sample Collection Pending", "Sample Collected", "Processing", "Report Ready", "Approved", "Delivered", "Rejected", "Cancelled"],
      default: "Created",
    },
    bookingDate: { type: Date, required: true }, // <-- now required
    bookedAt: { type: Date, default: Date.now }, // creation timestamp
    bookedBy: {
      type: String,
      enum: ["patient", "lab", "hospital", "doctor"],
      default: "patient",
    },
    reportUrl: { type: String },
    testResults: { type: Schema.Types.Mixed }, // Store results mapped by parameter
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "pending"],
      default: "unpaid",
      required: true,
    },
    paymentDate: { type: Date, required: false },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "netbanking", "other"],
      required: false,
    },
    transactionId: { type: String, required: false },
    expectedDelivery: { type: Date },
    actualDelivery: { type: Date }
  },
  { timestamps: true }
);

LabTestBookingSchema.index({ labId: 1, status: 1 });
LabTestBookingSchema.index({ userId: 1 });
LabTestBookingSchema.index({ referredByDoctorId: 1 });
LabTestBookingSchema.index({ referredByHospitalId: 1 });



export const LabTestBookingModel = mongoose.model<LabTestBookingDocument>(
  "LabTestBooking",
  LabTestBookingSchema
);

// ------------------ LAB PACKAGE MODEL ------------------
export interface LabPackageDocument extends Document {
  labId: mongoose.Types.ObjectId;
  packageName: string;
  description: string;
  tests: mongoose.Types.ObjectId[];
  totalPrice: number;
  createdAt: Date;
}

const LabPackageSchema = new Schema<LabPackageDocument>(
  {
    labId: { type: Schema.Types.ObjectId, ref: "Lab", required: true },
    packageName: { type: String, required: true },
    description: { type: String },
    tests: [{ type: Schema.Types.ObjectId, ref: "LabTest" }],
    totalPrice: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const LabPackageModel = mongoose.model<LabPackageDocument>(
  "LabPackage",
  LabPackageSchema
);

// ------------------ PACKAGE BOOKING MODEL ------------------
export interface PackageBookingDocument extends Document {
  packageId: mongoose.Types.ObjectId;
  labId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tests: mongoose.Types.ObjectId[];
  bookingDate: Date;
  status: "Created" | "Accepted" | "Sample Collection Pending" | "Sample Collected" | "Processing" | "Report Ready" | "Approved" | "Delivered" | "Rejected" | "Cancelled";
  bookedBy?: string;
  reportUrl?: string;
  paymentStatus?: "paid" | "unpaid" | "pending";
  paymentDate?: Date;
  paymentMethod?: "cash" | "upi" | "card" | "netbanking" | "other";
  transactionId?: string;
}

const PackageBookingSchema = new Schema<PackageBookingDocument>(
  {
    packageId: { type: Schema.Types.ObjectId, ref: "LabPackage", required: true },
    labId: { type: Schema.Types.ObjectId, ref: "Lab", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    tests: [{ type: Schema.Types.ObjectId, ref: "LabTest" }],
    bookingDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Created", "Accepted", "Sample Collection Pending", "Sample Collected", "Processing", "Report Ready", "Approved", "Delivered", "Rejected", "Cancelled"],
      default: "Created",
    },
    bookedBy: {
      type: String,
      enum: ["patient", "lab"],
      default: "patient",
    },
    reportUrl: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "pending"],
      default: "unpaid",
      required: true,
    },
    paymentDate: {
      type: Date,
      required: false,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "netbanking", "other"],
      required: false,
    },
    transactionId: {
      type: String,
      required: false,
    }
  },
  { timestamps: true }
);

export const PackageBookingModel = mongoose.model<PackageBookingDocument>(
  "PackageBooking",
  PackageBookingSchema
);
