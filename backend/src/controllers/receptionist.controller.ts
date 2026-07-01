import { Request, Response } from "express";
import receptionModel from "../models/reception.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import patientModel from "../models/patient.model.js";
import clinicModel from "../models/clinic.model.js";
import Booking from "../models/booking.model.js";
import offlineBooking from "../models/OfflineBookingModel.js";
import { LuBookUp } from "react-icons/lu";

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

export const getAllClinicPatients = async (req: any, res: Response) => {
  try {
    const clinicId = req.user.clinic;

    // 1️⃣ Find clinic with doctors
    const clinic = await clinicModel.findById(clinicId).select("doctors");

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    const doctorIds = clinic.doctors;

    if (!doctorIds || doctorIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No doctors found in this clinic",
        patients: [],
      });
    }

    // 2️⃣ Find all bookings of those doctors
    const bookings = await offlineBooking.find({
      doctorId: { $in: doctorIds },
    })
      .populate("doctorId", "fullName specialization")
      .populate("userId","fullName mobileNumber")
      .sort({ createdAt: -1 });

      // console.log("bookings",bookings);

    // 3️⃣ Extract patient details
    const patients = bookings.map((booking: any) => ({
      bookingId: booking._id,
      doctor: booking.doctorId,
      patient: booking.patient,
      bookedBy: booking.bookedBy,
      fees: booking.fees,
      paid: booking.paid,
      status: booking.status,
      date: booking.date,
      mobileNumber:booking.userId?.mobileNumber || booking.mobileNumber || null,
      tokenNumber:booking.tokenNumber,
    }));

    console.log(patients)

    return res.status(200).json({
      success: true,
      totalPatients: patients.length,
      patients,
    });
  } catch (error) {
    console.error("Get Clinic Patients Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


export const getProfile = async(req:any,res:Response)=>{
  try {
    const {receptionistId} = req.query;
    console.log(receptionistId);

    if(!receptionistId){
      res.status(404).json({
        message:"Receptionist id is not found"
      })
    }

    const reception = await receptionModel.findById(receptionistId);

    res.status(200).json({
      reception,
      message:"Fetched sucessfully"
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error:error
    })
    
  }
}


export const updateClinicPatient = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { patient, mobileNumber, fees, status,paid } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const updatedPatient = await offlineBooking.findByIdAndUpdate(
      bookingId,
      {
        ...(patient !== undefined && { patient }),
        ...(mobileNumber !== undefined && { mobileNumber }),
        ...(fees !== undefined && { fees }),
        ...(status !== undefined && { status }),
        ...(paid !== undefined && { paid }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient booking not found" });
    }

    return res.status(200).json({
      message: "Patient updated successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    console.error("updateClinicPatient error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};