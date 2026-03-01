import { Express } from "express";
import express from "express"
import { receptionistLogin, walkInRegisteration } from "../controllers/receptionist.controller.js";

const router = express.Router()

router.post("/login",receptionistLogin)
router.post("/walkinregistration",walkInRegisteration)

export default router;;