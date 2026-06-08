import express from "express"
import {bookToken,getDoctorOfflineBookings,getOfflineBookingsByDoctorAllPatient,updateOfflineBookingStatus} from "../controllers/offlineBooking.controller.js"


const router = express.Router()

router.post("/bookToken",bookToken);
router.get("/doctor/:doctorId", getDoctorOfflineBookings);
router.put("/:id/status", updateOfflineBookingStatus);
router.get("/doctor/:doctorId/all-patient",getOfflineBookingsByDoctorAllPatient)

export default router;