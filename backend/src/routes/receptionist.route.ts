import { Express } from "express";
import express from "express"
import { getClinicDoctorsForReception, receptionistLogin, walkInRegisteration } from "../controllers/receptionist.controller.js";
import { receptionistVerifyToken } from "../middlewares/auth.js";


const router = express.Router()

router.post("/login",receptionistLogin)
router.post("/walkinregistration",walkInRegisteration)
router.get("/getClinicDoctorsForReceptionist",receptionistVerifyToken,getClinicDoctorsForReception)

export default router;;