import mongoose, { Document } from "mongoose";
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
export declare const LabModel: mongoose.Model<LabDocument, {}, {}, {}, mongoose.Document<unknown, {}, LabDocument, {}, {}> & LabDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export interface TestDocument extends Document {
    testName: string;
    description: string;
    category: string;
    customCategory?: string;
    precaution: string;
    price: number;
    labId: mongoose.Types.ObjectId;
}
export declare const TestModel: mongoose.Model<TestDocument, {}, {}, {}, mongoose.Document<unknown, {}, TestDocument, {}, {}> & TestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export interface LabTestBookingDocument extends Document {
    labId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    testName: string;
    category: string;
    price: number;
    status: "pending" | "completed" | "cancelled";
    bookedAt: Date;
}
export declare const LabTestBookingModel: mongoose.Model<LabTestBookingDocument, {}, {}, {}, mongoose.Document<unknown, {}, LabTestBookingDocument, {}, {}> & LabTestBookingDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export interface LabPackageDocument extends Document {
    labId: mongoose.Types.ObjectId;
    packageName: string;
    description: string;
    tests: mongoose.Types.ObjectId[];
    totalPrice: number;
    createdAt: Date;
}
export declare const LabPackageModel: mongoose.Model<LabPackageDocument, {}, {}, {}, mongoose.Document<unknown, {}, LabPackageDocument, {}, {}> & LabPackageDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export interface PackageBookingDocument extends Document {
    packageId: mongoose.Types.ObjectId;
    labId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    tests: mongoose.Types.ObjectId[];
    bookingDate: Date;
    status: "pending" | "completed" | "cancelled";
}
export declare const PackageBookingModel: mongoose.Model<PackageBookingDocument, {}, {}, {}, mongoose.Document<unknown, {}, PackageBookingDocument, {}, {}> & PackageBookingDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=lab.model.d.ts.map