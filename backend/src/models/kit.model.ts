import mongoose from "mongoose";

export interface IKit {
  doctorId: mongoose.Types.ObjectId;
  name: string;
  medicines: string[];
}

const kitSchema = new mongoose.Schema<IKit>({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
  name: { type: String, required: true },
  medicines: [{ type: String }]
}, { timestamps: true });

const KitModel = mongoose.model<IKit>("Kit", kitSchema);
export default KitModel;
