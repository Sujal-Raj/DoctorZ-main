import express from "express";
import { createTimeSlot, updateSlot ,editTimeSlot, getDoctorTimeSlots, getPatientSlots } from "../controllers/timeSlots.controller.js";

const router = express.Router();
router.post("/createTimeSlot", createTimeSlot);
// router.get("/getTimeSlots/:doctorId", getTimeSlots);
// Doctor side
router.get(
  "/getTimeSlots/:doctorId",
  getDoctorTimeSlots
);

// Patient side
router.get(
  "/patient/slots/:doctorId",
  getPatientSlots
);

router.put("/editTimeSlot", editTimeSlot);
router.patch("/updateSlot/:id", updateSlot);
// router.get("/getActiveSlots/:doctorId", getActiveSlots);

export default router;