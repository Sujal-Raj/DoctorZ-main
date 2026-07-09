import { Router } from "express";
import {
  getDoctorEarnings,
  getClinicRevenue,
  getReceptionistCollections,
  getLabRevenue,
  updatePaymentStatus
} from "../controllers/revenue.controller.js";
import {
  verifyToken,
  verifyClinicToken,
  receptionistVerifyToken,
  verifyLabToken
} from "../middlewares/auth.js";

const router = Router();

// Doctor Earnings
router.get("/doctor/:doctorId", verifyToken, getDoctorEarnings);

// Clinic Revenue
router.get("/clinic/:clinicId", verifyClinicToken, getClinicRevenue);

// Receptionist Collections (uses logged in token to resolve clinic)
router.get("/receptionist", receptionistVerifyToken, getReceptionistCollections);

// Lab Revenue
router.get("/lab/:labId", verifyLabToken, getLabRevenue);

// Update Payment details
router.put("/payment/:bookingType/:bookingId", updatePaymentStatus);

export default router;
