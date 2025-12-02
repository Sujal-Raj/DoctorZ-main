import express from "express";
import { addPrescription, downloadPrescription } from "../controllers/prescription.controller.js";
const router = express.Router();
router.post("/addPrescription/:bookingId", addPrescription);
router.get("/download/:id", downloadPrescription);
export default router;
//# sourceMappingURL=prescription.routes.js.map