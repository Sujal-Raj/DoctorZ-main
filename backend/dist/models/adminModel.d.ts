import { Document, Model } from 'mongoose';
export interface IAdmin extends Document {
    adminId: string;
    password: string;
    createdAt: Date;
}
declare const AdminModel: Model<IAdmin>;
export default AdminModel;
//# sourceMappingURL=adminModel.d.ts.map