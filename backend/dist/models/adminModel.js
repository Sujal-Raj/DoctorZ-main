// import mongoose, { Document, Schema, Model } from 'mongoose';
// import bcrypt from 'bcrypt';
// // 1. Define the Admin interface (instance type)
// export interface IAdmin extends Document {
//   name: string;
//   email: string;
//   password: string;
//   createdAt: Date;
//   comparePassword(candidatePassword: string): Promise<boolean>;
// }
// // 2. Define the schema
// const AdminSchema: Schema<IAdmin> = new mongoose.Schema<IAdmin>({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });
// // 3. Password hash before saving
// AdminSchema.pre<IAdmin>('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (err) {
//     next(err as Error);
//   }
// });
// // 4. Add instance method to compare password
// AdminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
//   return bcrypt.compare(candidatePassword, this.password);
// };
// // 5. Create and export the model
// const Admin: Model<IAdmin> = mongoose.model<IAdmin>('Admin', AdminSchema);
// export default Admin;
import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcrypt';
const AdminSchema = new mongoose.Schema({
    adminId: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const AdminModel = mongoose.model('Admin', AdminSchema);
export default AdminModel;
//# sourceMappingURL=adminModel.js.map