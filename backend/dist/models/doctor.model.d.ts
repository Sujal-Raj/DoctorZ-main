import mongoose from "mongoose";
import { Types } from "mongoose";
export interface IDoctor extends Document {
    doctorId: string;
    fullName: string;
    password: string;
    email: string;
    gender: string;
    dob: Date;
    MobileNo: string;
    MedicalRegistrationNumber: string;
    specialization: string;
    qualification: string;
    DegreeCertificate: string;
    experience: number;
    consultationFee: number;
    language: string;
    Address: string;
    State: string;
    City: string;
    Aadhar: number;
    signature: string;
    photo: string;
    clinic: Types.ObjectId[];
    status?: string;
    notifications: {
        type: string;
        clinicId: Types.ObjectId;
        clinicName: string;
        message: string;
        status: "pending" | "accepted" | "rejected";
        createdAt: Date;
    }[];
}
declare const doctorModel: mongoose.Model<IDoctor, {}, {}, {}, mongoose.Document<unknown, {}, IDoctor, {}, {}> & IDoctor & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
export default doctorModel;
//# sourceMappingURL=doctor.model.d.ts.map