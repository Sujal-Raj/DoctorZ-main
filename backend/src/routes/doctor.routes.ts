import mongoose from "mongoose";
import doctorController, { addReview } from "../controllers/doctor.controller.js";
import Router from 'express';
// import { upload } from "../middlewares/upload.js";
import { upload } from "../middlewares/multer.js";


const router = Router();

router.post('/register',upload.fields([
  { name: "degreeCert", maxCount: 1 },
  { name: "photo", maxCount: 1 },
  { name: "signature", maxCount: 1 },
  { name: "achievementFiles", maxCount: 10 },
])
,doctorController.doctorRegister);

  router.get('/search',doctorController.searchDoctors);
router.get('/allDoctors/:patientId',doctorController.getAllDoctors);
router.get("/search-master-medicines", doctorController.searchMasterMedicines);
router.post("/kits/create", doctorController.createKit);
router.get("/kits/:doctorId", doctorController.getKits);
router.get('/:id',doctorController.getDoctorById);
router.delete("/delete/medicine-from-list", doctorController.deleteMedicineFromList);
router.delete('/delete/:id',doctorController.deleteDoctor);
router.put(
  '/updateDoctor/:id',
  upload.single("photo"),
  doctorController.updateDoctorData
);

router.put('/update/:id',doctorController.updateDoctor);

router.get('/getClinicDoctors/:clinicId',doctorController.getClinicDoctors);
router.post('/login',doctorController.doctorLogin);
router.get("/todays-appointments/:doctorId", doctorController.getTodaysBookedAppointments);
router.get('/total-patients/:doctorId', doctorController.getTotalPatients);
router.get('/notifications/:doctorId',doctorController.getDoctorNotifications);
router.post('/notifications/accept',doctorController.acceptDoctorRequest);
router.post('/notifications/reject',doctorController.rejectDoctorRequest);
router.post("/review/:doctorId", addReview);
router.post("/add/medicine-to-list",doctorController.addMedicineToList);
router.get("/medicine-list/:doctorId", doctorController.getMedicineList);


export default router;