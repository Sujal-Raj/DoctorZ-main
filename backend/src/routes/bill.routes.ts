import express from "express";
import {
  createBill,
  getBillsList,
  recordPayment,
  processInsuranceClaim,
} from "../controllers/bill.controller.js";

const billRouter = express.Router();

billRouter.post("/add", createBill);
billRouter.get("/list/:clinicId", getBillsList);
billRouter.put("/pay/:billId", recordPayment);
billRouter.put("/insurance/:billId", processInsuranceClaim);

export default billRouter;
