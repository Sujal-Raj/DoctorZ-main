import mongoose from "mongoose";
export interface IPatient extends Document {
    fullName: string;
    gender: string;
    dob: Date;
    email: string;
    password: string;
    mobileNumber: number;
    aadhar: string;
    address: {
        city: string;
        pincode: number;
    };
    profilePhoto?: string;
    abhaId: string;
    emergencyContact: {
        name: string;
        number: number;
    };
    favouriteDoctors?: mongoose.Types.ObjectId[];
    favouriteClinics?: mongoose.Types.ObjectId[];
}
declare const patientModel: mongoose.Model<IPatient, {}, {}, {}, mongoose.Document<unknown, {}, IPatient, {}, mongoose.DefaultSchemaOptions> & IPatient & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<IPatient, mongoose.Model<IPatient, any, any, any, mongoose.Document<unknown, any, IPatient, any, {}> & IPatient & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, IPatient, mongoose.Document<unknown, {}, mongoose.FlatRecord<IPatient>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<IPatient> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default patientModel;
//# sourceMappingURL=patient.model.d.ts.map