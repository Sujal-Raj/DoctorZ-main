import express from "express";
import {
  createReferral,
  getReferrals,
  updateReferralStatus,
  addReferralMessage,
  searchTargets,
  uploadReport
} from "../controllers/referral.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";
import { requireFeature } from "../middlewares/subscription.middleware.js";

const referralRouter = express.Router();

// All referral routes require authentication and Enterprise subscription
referralRouter.use(authMiddleware);
referralRouter.use(requireFeature("Referrals"));

referralRouter.get("/searchTargets", searchTargets);
referralRouter.post("/create", createReferral);
referralRouter.get("/", getReferrals);
referralRouter.put("/:id/status", updateReferralStatus);
referralRouter.post("/:id/message", addReferralMessage);
referralRouter.post("/:id/upload-report", upload.single("report"), uploadReport);

export default referralRouter;
