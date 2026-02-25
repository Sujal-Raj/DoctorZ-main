import express from "express"
import {bookToken,getDoctorOfflineBookings,updateOfflineBookingStatus} from "../controllers/offlineBooking.controller.js"


const router = express.Router()

router.post("/bookToken",bookToken);
router.get("/doctor/:doctorId", getDoctorOfflineBookings);
router.put("/:id/status", updateOfflineBookingStatus);

export default router;