import express from "express";
import { adminLogin, getDashboardStats, getAllHospitals, addHospital, updateHospitalStatus, addSubscriptionPlan, getSubscriptionPlans, } from "../controllers/admin.controller.js";
const saasRouter = express.Router();
// Super Admin auth (uses merged adminLogin)
saasRouter.post("/login", adminLogin);
// SaaS Dashboard stats
saasRouter.get("/stats", getDashboardStats);
// Hospital Management
saasRouter.get("/hospitals", getAllHospitals);
saasRouter.post("/hospitals/add", addHospital);
saasRouter.put("/hospitals/status/:hospitalId", updateHospitalStatus);
// Subscription Plans
saasRouter.post("/plans/add", addSubscriptionPlan);
saasRouter.get("/plans", getSubscriptionPlans);
export default saasRouter;
