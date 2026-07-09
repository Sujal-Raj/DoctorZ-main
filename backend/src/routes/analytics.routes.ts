import express from "express";
import { getHospitalAnalytics } from "../controllers/analytics.controller.js";

const analyticsRouter = express.Router();

analyticsRouter.get("/summary/:clinicId", getHospitalAnalytics);

export default analyticsRouter;
