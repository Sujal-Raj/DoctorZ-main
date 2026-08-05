import express from "express";
import { addPrescription, downloadPrescription, getPrescriptionsForUser, getConsultationDetails, sendPrescriptionEmail } from "../controllers/prescription.controller.js";
const router = express.Router();
router.post("/addPrescription/:bookingId", addPrescription);
router.get("/download/:id", downloadPrescription);
router.get("/prescriptions", getPrescriptionsForUser);
router.get("/consultation-details/:bookingId", getConsultationDetails);
router.post("/send-email", sendPrescriptionEmail);
export default router;
