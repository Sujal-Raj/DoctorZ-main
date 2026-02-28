import { Express } from "express";
import express from "express"
import { receptionistLogin } from "../controllers/receptionist.controller.js";

const router = express.Router()

router.post("/login",receptionistLogin)

export default router;;