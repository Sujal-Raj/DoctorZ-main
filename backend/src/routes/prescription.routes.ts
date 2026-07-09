import express from "express"
import { addPrescription, downloadPrescription, getPrescriptionsForUser } from "../controllers/prescription.controller.js";

const router=express.Router();
router.post("/addPrescription/:bookingId",addPrescription);
router.get("/download/:id",downloadPrescription);
router.get("/prescriptions", getPrescriptionsForUser);
export default router;
