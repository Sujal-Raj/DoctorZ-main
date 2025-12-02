

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
export interface LabTestBookingDocument extends Document {
  labId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  testName: string;
  category: string;
  price: number;
  status: "pending" | "completed" | "cancelled";
  bookedAt: Date;
}

const LabTestBookingSchema = new Schema<LabTestBookingDocument>(
  {
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
  },
  { timestamps: true }
);

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
  status: "pending" | "completed" | "cancelled";
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
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const PackageBookingModel = mongoose.model<PackageBookingDocument>(
  "PackageBooking",
  PackageBookingSchema
);
