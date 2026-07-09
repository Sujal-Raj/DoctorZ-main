import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  clinicId: mongoose.Types.ObjectId;
  patientId?: mongoose.Types.ObjectId;
  type: "Appointment" | "Invoice" | "Admission" | "Discharge" | "Reminder";
  recipientPhone: string;
  message: string;
  status: "Sent" | "Failed";
  sentAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    type: {
      type: String,
      enum: ["Appointment", "Invoice", "Admission", "Discharge", "Reminder"],
      required: true,
    },
    recipientPhone: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["Sent", "Failed"], default: "Sent", required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const notificationModel = mongoose.model<INotification>("Notification", notificationSchema);
export default notificationModel;
