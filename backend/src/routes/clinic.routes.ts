
import express from "express"
import { clinicLogin, clinicRegister, deleteClinic, getAllClinic, getClinicById, searchClinicAndDoctor, updateClinic, getAllClinicPatients, getClinicStatus , sendDoctorRequest ,getClinicDoctorStatus  } from "../controllers/clinic.controller.js";
import { upload } from "../middlewares/upload.js";

const router=express.Router();

// Route with single file upload

// routes/clinic.route.ts
router.post(
  "/register",
  upload.fields([
    { name: "registrationCert", maxCount: 1 },
    { name: "clinicImage", maxCount: 1 }, // New field for clinic image
  ]),
  clinicRegister
);

router.put("/update/:id",updateClinic);
router.delete("/delete/:id",deleteClinic);
router.get("/search",searchClinicAndDoctor);                                                                                                                        
router.get("/getClinic/:patientId",getAllClinic);
router.post("/clinicLogin",clinicLogin);
router.get("/getClinicById/:id",getClinicById);
router.get("/getAllClinicPatients/:clinicId",getAllClinicPatients);
router.get("/getClinicStats/:clinicId",getClinicStatus);
router.post("/send-doctor-request", sendDoctorRequest);
router.get("/doctor-status/:clinicId",getClinicDoctorStatus);


export default router;