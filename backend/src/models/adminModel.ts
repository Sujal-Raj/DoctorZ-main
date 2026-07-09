import mongoose, { Document, Schema, Model } from "mongoose";

export interface IAdmin extends Document {
  adminId: string;
  email?: string;
  password: string;
  role: "super_admin" | "support_admin";
  isActive: boolean;
  createdAt: Date;
}

const AdminSchema: Schema<IAdmin> = new Schema<IAdmin>({
  adminId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["super_admin", "support_admin"],
    default: "super_admin",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AdminModel: Model<IAdmin> = mongoose.model<IAdmin>("Admin", AdminSchema);
export default AdminModel;
