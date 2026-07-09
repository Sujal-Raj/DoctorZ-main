import notificationModel from "../models/notification.model.js";
import mongoose from "mongoose";

export const sendSimulatedAlert = async (params: {
  clinicId: string | mongoose.Types.ObjectId;
  patientId?: string | mongoose.Types.ObjectId;
  type: "Appointment" | "Invoice" | "Admission" | "Discharge" | "Reminder";
  recipientPhone: string;
  message: string;
}) => {
  try {
    // Print to console to simulate real SMS/WhatsApp transmission
    console.log(`\n======================================================`);
    console.log(`🚨 [SIMULATED WHATSAPP/SMS GATEWAY DISPATCH]`);
    console.log(`------------------------------------------------------`);
    console.log(`Type:      ${params.type}`);
    console.log(`Recipient: +91 ${params.recipientPhone}`);
    console.log(`Message:   "${params.message}"`);
    console.log(`======================================================\n`);

    const log = new notificationModel({
      clinicId: params.clinicId,
      patientId: params.patientId || undefined,
      type: params.type,
      recipientPhone: params.recipientPhone,
      message: params.message,
      status: "Sent",
      sentAt: new Date(),
    });

    await log.save();
    return true;
  } catch (error) {
    console.error("Error logging notification dispatch:", error);
    return false;
  }
};
