import { createEMR, getEMRByName, updateEMR } from "../controllers/emr.controller.js";
// import { getEMRByPatientId } from "../controllers/emr.controller.js";
// import { getEMRById } from "../controllers/emr.controller.js";
import { getEMRByAadhar } from "../controllers/emr.controller.js";

import express from "express";
// import { upload } from "../middlewares/upload.js";
import { upload } from "../middlewares/multer.js";
const router = express.Router();

router.post("/createEmr", upload.array("reports"), createEMR);
// router.get("/:emrId", getEMRById);
// router.get("/:patientId", getEMRByPatientId);

router.get("/:aadhar", getEMRByAadhar);
router.get("/name/:name", getEMRByName);
router.put("/update/:emrId", upload.array("reports"), updateEMR);
export default router;