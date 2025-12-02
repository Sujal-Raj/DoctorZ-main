import express from "express";
import { createTimeSlot, getTimeSlots, updateSlot, getActiveSlots, editTimeSlot } from "../controllers/timeSlots.controller.js";
const router = express.Router();
router.post("/createTimeSlot", createTimeSlot);
router.get("/getTimeSlots/:doctorId", getTimeSlots);
router.put("/editTimeSlot", editTimeSlot);
router.patch("/updateSlot/:id", updateSlot);
router.get("/getActiveSlots/:doctorId", getActiveSlots);
export default router;
//# sourceMappingURL=timeSlots.routes.js.map