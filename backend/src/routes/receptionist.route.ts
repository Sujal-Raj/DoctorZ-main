import { Express } from "express";
import express from "express"
import { getAllClinicPatients, getClinicDoctorsForReception, getProfile, receptionistLogin, walkInRegisteration } from "../controllers/receptionist.controller.js";
import { receptionistVerifyToken } from "../middlewares/auth.js";
import { bookToken } from "../controllers/offlineBooking.controller.js";


const router = express.Router()

router.post("/login",receptionistLogin)
router.post("/walkinregistration",walkInRegisteration)
router.get("/getClinicDoctorsForReceptionist",receptionistVerifyToken,getClinicDoctorsForReception)
router.post(
  "/book-token",
  receptionistVerifyToken, // OR patientVerifyToken
  bookToken
);

router.get(
  "/clinic-patients",
  receptionistVerifyToken,
  getAllClinicPatients
);

router.get("/profile",receptionistVerifyToken,getProfile)

export default router;;