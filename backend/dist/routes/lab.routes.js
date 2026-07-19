import { Router } from "express";
import labController from "../controllers/lab.controller.js";
import { verifyLabToken } from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.js";
const router = Router();
// 🧪 Lab Auth & Profile
router.post("/register", labController.labRegister);
router.post("/login", labController.labLogin);
router.get("/getLabById/:labId", labController.getLabById);
router.put("/updateLabProfile/:labId", labController.updateLabProfile);
// 🧫 Tests
router.get("/alllabtests", labController.getAllLabTests);
router.post("/addTest", labController.addTest);
router.get("/getAllTestByLabId/:labId", labController.getAllTestByLabId);
router.put("/updateLabTest/:testId", labController.updateLabTest);
router.delete("/deleteLabTest/:testId", labController.deleteLabTest);
// 📋 Bookings & Patients
router.post("/bookTest", labController.addTestBooking);
router.get("/getLabPatients/:labId", labController.getLabPatients);
router.post("/labBookTest", verifyLabToken, labController.labBookTest);
router.post("/labBookPackage", verifyLabToken, labController.labBookPackage);
router.put("/completeTest/:bookingId", verifyLabToken, upload.single("report"), labController.completeTestBooking);
router.put("/completePackage/:bookingId", verifyLabToken, upload.single("report"), labController.completePackageBooking);
// 💼 Packages
// ✅ Get all available packages
router.get("/packages", labController.getAllPackages);
router.get("/packages/:packageId", labController.getPackageDetailsById);
router.post("/packages/book", labController.bookPackage);
// (Other routes…)
router.get("/packages/:labId", labController.getAllPackagesByLabId);
router.post("/addPackage", labController.addLabPackage);
router.get("/getAllPackagesByLabId/:labId", labController.getAllPackagesByLabId);
router.get("/package-bookings/:patientId", labController.getPatientPackageBookings);
router.put("/updatePackage/:packageId", labController.updateLabPackage);
router.delete("/deletePackage/:packageId", labController.deleteLabPackage);
import { getLabOrders, updateLabOrderStatus, verifyPublicReport } from "../controllers/labOrder.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
// 🚀 Advanced Lab Orders
router.get("/orders", authMiddleware, getLabOrders);
router.put("/orders/:id/status", authMiddleware, updateLabOrderStatus);
// 🔍 Public QR Verification
router.get("/public/verify/:id", verifyPublicReport);
export default router;
