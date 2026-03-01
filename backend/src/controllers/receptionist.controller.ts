import { Request, Response } from "express";
import receptionModel from "../models/reception.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import patientModel from "../models/patient.model.js";
import clinicModel from "../models/clinic.model.js";

export const receptionistLogin = async (req: Request, res: Response) => {
  try {
    const { receptionId, password } = req.body;

    // Validate input
    if (!receptionId || !password) {
      return res.status(400).json({
        success: false,
        message: "Reception ID and password are required",
      });
    }

    // Find receptionist
    const receptionist = await receptionModel.findOne({ receptionId });

    if (!receptionist) {
      return res.status(404).json({
        success: false,
        message: "Receptionist not found",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, receptionist.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: receptionist._id,
        clinic: receptionist.clinic,
        role: "receptionist",
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      receptionist: {
        id: receptionist._id,
        receptionId: receptionist.receptionId,
        clinic: receptionist.clinic,
      },
    });
  } catch (error) {
    console.error("Receptionist Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const walkInRegisteration = async (req: Request, res: Response) => {
  try {
    const { fullName, gender, dob, mobileNumber, aadhar } = req.body;

    // ✅ Required validation (minimal fields)
    if (!fullName || !gender || !dob || !mobileNumber || !aadhar) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    // ✅ Check if Aadhar already exists
    const existingAadhar = await patientModel.findOne({
      aadhar: String(aadhar),
    });

    if (existingAadhar) {
      return res.status(400).json({
        message: "Patient with this Aadhar already exists",
      });
    }

    // ✅ Create walk-in patient (no email/password)
    const patient = await patientModel.create({
      fullName,
      gender,
      dob,
      mobileNumber,
      aadhar,
      // registrationType: "walk-in", // optional flag if needed
    });

    return res.status(201).json({
      message: "Walk-in patient registered successfully",
      patient,
    });
  } catch (error) {
    console.log("Walk-in Registration Error:", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};


export const getClinicDoctorsForReception = async (req: any, res: Response) => {
  try {
    const clinicId = req.user.clinic;

    const clinic = await clinicModel
      .findById(clinicId)
      .populate("doctors");

    if (!clinic) {
      return res.status(404).json({ message: "Clinic not found" });
    }

    res.status(200).json({
      success: true,
      doctors: clinic.doctors,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};