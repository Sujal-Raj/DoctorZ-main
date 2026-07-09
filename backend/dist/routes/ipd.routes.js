import express from "express";
import { createWard, getWardsList, updateBedStatus, admitPatient, getAdmissionsList, addNursingNote, addVitalsRecord, addMARRecord, dischargePatient, } from "../controllers/ipd.controller.js";
const ipdRouter = express.Router();
// Ward & Bed setup
ipdRouter.post("/wards/add", createWard);
ipdRouter.get("/wards/:clinicId", getWardsList);
ipdRouter.put("/wards/bed-status/:wardId/:bedId", updateBedStatus);
// Inpatient Admissions
ipdRouter.post("/admit", admitPatient);
ipdRouter.get("/admissions/:clinicId", getAdmissionsList);
// Daily Clinical Charting (Notes, Vitals, MAR)
ipdRouter.post("/chart/note/:admissionId", addNursingNote);
ipdRouter.post("/chart/vitals/:admissionId", addVitalsRecord);
ipdRouter.post("/chart/mar/:admissionId", addMARRecord);
// Discharge Process
ipdRouter.post("/discharge/:admissionId", dischargePatient);
export default ipdRouter;
