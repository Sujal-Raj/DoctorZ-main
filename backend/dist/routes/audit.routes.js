import express from "express";
import { getAuditLogs } from "../controllers/audit.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireFeature } from "../middlewares/subscription.middleware.js";
const auditRouter = express.Router();
auditRouter.use(authMiddleware);
auditRouter.use(requireFeature("Audit Logs"));
auditRouter.get("/", getAuditLogs);
export default auditRouter;
