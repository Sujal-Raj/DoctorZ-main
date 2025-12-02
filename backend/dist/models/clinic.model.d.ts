import mongoose, { Document } from "mongoose";
export interface IClinic extends Document {
    clinicName: string;
    clinicType: "Private" | "Government";
    specialities: string[];
    address: string;
    state: string;
    district: string;
    pincode: number;
    phone: string;
    email: string;
    doctors: mongoose.Types.ObjectId[];
    operatingHours: string;
    clinicLicenseNumber: string;
    registrationCertificate?: string;
    clinicImage?: string;
    aadharNumber: number;
    panNumber: string;
    staffName: string;
    staffEmail: string;
    staffPassword: string;
    staffId: string;
    status: string;
}
declare const clinicModel: mongoose.Model<IClinic, {}, {}, {}, mongoose.Document<unknown, {}, IClinic, {}, {}> & IClinic & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default clinicModel;
//# sourceMappingURL=clinic.model.d.ts.map