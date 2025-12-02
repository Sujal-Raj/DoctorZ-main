import { createEMR } from "../controllers/emr.controller.js";
// import { getEMRByPatientId } from "../controllers/emr.controller.js";
// import { getEMRById } from "../controllers/emr.controller.js";
import { getEMRByAadhar } from "../controllers/emr.controller.js";
import express from "express";
import { upload } from "../middlewares/upload.js";
const router = express.Router();
router.post("/createEmr", upload.array("reports"), createEMR);
// router.get("/:emrId", getEMRById);
// router.get("/:patientId", getEMRByPatientId);
router.get("/:aadhar", getEMRByAadhar);
export default router;
//# sourceMappingURL=emr.routes.js.map