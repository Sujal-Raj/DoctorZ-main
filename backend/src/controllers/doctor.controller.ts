import bcrypt from "bcryptjs";
import { transporter } from "../utils/email.js";
import nodemailer from "nodemailer";
import type { Response, Request } from "express";
import doctorModel from "../models/doctor.model.js";
import Booking from "../models/booking.model.js";
import jwt from "jsonwebtoken";
import clinicModel from "../models/clinic.model.js";
import patientModel from "../models/patient.model.js";
import mongoose from "mongoose";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js"

interface MulterFiles {
  [fieldname: string]: Express.Multer.File[];
}

interface Params {
  doctorId: string; // this ensures `req.params.doctorId` is typed as string
}

// const doctorRegister = async (req: Request, res: Response) => {
//   try {
//     console.log("Text fields:", req.body);
//     console.log("Files:", req.files);

//     const files = req.files as MulterFiles | undefined;

//     const experience = Number(req.body.experience);
//     const consultationFee = Number(req.body.fees);
//     const Aadhar = Number(req.body.aadhar);
//     const Address = req.body.address;
//     const State = req.body.state;
//     const City = req.body.city;
//     const dob = new Date(req.body.dob);
//     const MobileNo = req.body.mobileNo;
//     const email = req.body.email;

//     const degreeCert = files?.["degreeCert"]?.[0]?.filename || "";
//     const photo = files?.["photo"]?.[0]?.filename || "";
//     const signature = files?.["signature"]?.[0]?.filename || "";

//     if (!req.body.password) {
//       return res.status(400).json({ message: "Password is required" });
//     }

//     const hashedPassword = await bcrypt.hash(req.body.password, 10);
//     const clinicId = req.body.clinicId;

//     const doctor = new doctorModel({
//       fullName: req.body.fullName,
//       password: hashedPassword,
//       gender: req.body.gender,
//       dob,
//       MobileNo,
//       MedicalRegistrationNumber: req.body.regNumber,
//       specialization: req.body.specialization || "",
//       qualification: req.body.qualification,
//       experience,
//       consultationFee,
//       language: req.body.languages || "",
//       Aadhar,
//       Address,
//       State,
//       City,
//       DegreeCertificate: degreeCert,
//       photo,
//       signature,
//       email,
//       clinic: clinicId,
//       status: "pending",
//     });

//     if (clinicId) {
//       await clinicModel.findByIdAndUpdate(clinicId, {
//         $push: { doctors: doctor._id },
//       });
//     }

//     await doctor.save();
//     return res.status(201).json({ message: "Doctor registered", doctor });
//   } catch (error) {
//     console.error("Registration error:", error);
//     return res.status(500).json({ message: "Registration failed", error });
//   }
// };


const doctorRegister = async (req: Request, res: Response) => {
  try {
    console.log("Incoming request: POST /api/doctor/register");
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    // ---------- FILE VALIDATION ----------
    if (!files?.degreeCert?.[0]) {
      return res.status(400).json({ message: "Degree certificate is required" });
    }

    if (!files?.photo?.[0]) {
      return res.status(400).json({ message: "Photo is required" });
    }

    if (!files?.signature?.[0]) {
      return res.status(400).json({ message: "Signature is required" });
    }

    // ---------- UPLOAD TO CLOUDINARY ----------
    let degreeCertUrl = "";
    let photoUrl = "";
    let signatureUrl = "";

    try {
      degreeCertUrl = await uploadToCloudinary(
        files.degreeCert[0].buffer,
        "doctors/degree",
        files.degreeCert[0].mimetype === "application/pdf" ? "raw" : "image"
      );

      photoUrl = await uploadToCloudinary(
        files.photo[0].buffer,
        "doctors/photos"
      );

      signatureUrl = await uploadToCloudinary(
        files.signature[0].buffer,
        "doctors/signatures"
      );
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res.status(400).json({ message: "File upload failed" });
    }

    // ---------- DATA PROCESSING ----------
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const doctor = new doctorModel({
      fullName: req.body.fullName,
      password: hashedPassword,
      gender: req.body.gender,
      dob: new Date(req.body.dob),
      MobileNo: req.body.mobileNo,
      MedicalRegistrationNumber: req.body.regNumber,
      specialization: req.body.specialization,
      qualification: req.body.qualification,
      experience: Number(req.body.experience),
      consultationFee: Number(req.body.fees),
      language: req.body.languages,
      Aadhar: Number(req.body.aadhar),
      Address: req.body.address,
      State: req.body.state,
      City: req.body.city,
      DegreeCertificate: degreeCertUrl,
      photo: photoUrl,
      signature: signatureUrl,
      email: req.body.email,
      clinic: req.body.clinicId,
      status: "pending"
    });

    await doctor.save();

    // ---------- LINK DOCTOR TO CLINIC ----------
    if (req.body.clinicId) {
      await clinicModel.findByIdAndUpdate(req.body.clinicId, {
        $push: { doctors: doctor._id }
      });
    }

    return res.status(201).json({
      message: "Doctor registered successfully",
      doctor
    });
  } catch (error) {
    console.error("Doctor registration error:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
};


// ==========================
// Doctor Login
// ==========================
const doctorLogin = async (req: Request, res: Response) => {
  try {
    console.log("Login request body:", req.body);

    const { doctorId, password } = req.body;

    if (!doctorId || !password) {
      return res
        .status(400)
        .json({ message: "doctorId and password are required" });
    }

    const doctor = await doctorModel.findOne({ doctorId });
    console.log("Doctor found:", doctor);
    if (!doctor) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign(
      {
        id: doctor._id,
        doctorId: doctor.doctorId,
        email: doctor.email,
        role: "doctor",
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login Successful",
      token,
      doctor: {
        _id: doctor._id,
        doctorId: doctor.doctorId,
        fullName: doctor.fullName,
        email: doctor.email,
      },
    });
  } catch (error) {
    console.error("Doctor login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Get Doctor by ID
// ==========================
const getDoctorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doctor = await doctorModel.findById(id);
    if (!doctor) {
      return res.status(400).json({ message: "Doctor not found" });
    }

    return res.status(200).json({ message: "Doctor found", doctor });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return res.status(500).json({ message: "Failed to fetch doctor" });
  }
};

// ==========================
// Get All Approved Doctors
// ==========================

const getAllDoctors = async (req: Request, res: Response) => {
  try {
    // Fetch all approved doctors
    const doctors = await doctorModel.find({ status: "approved" });

    const { patientId } = req.params;

    // If user not logged in, just return doctors normally
    if (!patientId || patientId === "null" || patientId === "undefined") {
      return res
        .status(200)
        .json({ message: "Approved doctors fetched successfully", doctors });
    }

    // Get patient's favourite doctor list
    const patient = await patientModel
      .findById(patientId)
      .select("favouriteDoctors");

    const favouriteIds = new Set(
      (patient?.favouriteDoctors || []).map((id: any) => id.toString())
    );

    // Mark each doctor as favourite: true / false
    const doctorsWithFav = doctors.map((doc: any) => ({
      ...doc.toObject(),
      isFavourite: favouriteIds.has(doc._id.toString()),
    }));

    // Sort favourites first
    const sortedDoctors = doctorsWithFav.sort((a, b) =>
      a.isFavourite === b.isFavourite ? 0 : a.isFavourite ? -1 : 1
    );

    return res.status(200).json({
      message: "Approved doctors fetched successfully",
      doctors: sortedDoctors,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return res.status(500).json({ message: "Failed to fetch doctors" });
  }
};
// ==========================
// Update Doctor ID and Password
// ==========================
const updateDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { doctorId, password } = req.body;

    if (!doctorId || !password) {
      return res
        .status(400)
        .json({ message: "doctorId and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedDoctor = await doctorModel.findByIdAndUpdate(
      id,
      { doctorId, password: hashedPassword },
      { new: true, runValidators: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Send confirmation email
    if (updatedDoctor.email) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: updatedDoctor.email,
        subject: "Your Doctor Login Details Updated",
        text: `
Your login credentials have been updated successfully.

Doctor ID: ${doctorId}
Password: (hidden for security)

If you did not request this change, please contact support immediately.

Regards,
Your Hospital Admin Team
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });
    }

    return res.status(200).json({
      message: "Doctor ID and password updated successfully.",
      updatedDoctor,
    });
  } catch (error: any) {
    console.error("Error updating doctor:", error.message || error);
    return res.status(500).json({ message: "Failed to update doctor" });
  }
};






const updateDoctorData = async (req: Request, res: Response) => {
  try {
    const doctorId = req.params.id;

    const updates: any = { ...req.body };

    //  Block fields that should never be updated directly
    const blockedFields = ["notifications", "clinic", "DegreeCertificate", "signature", "doctorId"];

    blockedFields.forEach((field) => delete updates[field]);

    // convert number fields
    const numberFields = ["experience", "consultationFee", "Aadhar"];
    numberFields.forEach((field) => {
      if (updates[field] !== undefined) {
        updates[field] = Number(updates[field]);
      }
    });

    // MobileNo should always be string
    if (updates.MobileNo) {
      updates.MobileNo = String(updates.MobileNo);
    }

    // Date field
    if (updates.dob) {
      updates.dob = new Date(updates.dob);
    }

    // photo upload
    if (req.file) {
      updates.photo = req.file.filename;
    }

    const updatedDoctor = await doctorModel.findByIdAndUpdate(
      doctorId,
      { $set: updates },
      { new: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res.json({
      message: "Profile updated successfully",
      doctor: updatedDoctor,
    });
  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};



const getClinicDoctors = async (req: Request, res: Response) => {
  try {
    const { clinicId } = req.params;
    const doctors = await doctorModel.find({
      clinic: clinicId,
      status: "approved",
    });

    return res.status(200).json({
      message: "Doctors fetched successfully",
      doctors,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return res.status(500).json({ message: "Failed to fetch doctors" });
  }
};

// ==========================
// Get Today's Booked Appointments
// ==========================
export const getTodaysBookedAppointments = async (
  req: Request,
  res: Response
) => {
  try {
    const doctorId = req.params.doctorId;
    console.log("Fetching appointments for doctorId:", doctorId);
    const now = new Date();
    const startOfDay = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0
      )
    );
    const endOfDay = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999
      )
    );
 
    const bookedAppointments = await Booking.find({
      doctorId,
      dateTime: { $gte: startOfDay, $lte: endOfDay },
      status: "pending",
    });
     
    res.status(200).json(bookedAppointments);
  } catch (error) {
    console.error("Error fetching today's booked appointments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getTotalPatients = async (req: Request, res: Response) => {
  try {
    const doctorId = req.params.doctorId;

    const totalPatients = await Booking.countDocuments({
      doctorId,
      status: "pending",
    });

    res.status(200).json({ totalPatients });
  } catch (error) {
    console.error("Error fetching total patients:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedoctor = await doctorModel.findByIdAndDelete(id);

    if (!deleteDoctor) {
      return res.status(400).json({
        message: "Doctor not found",
      });
    }

    return res.status(202).json({
      message: "doctor deleted successfully",
      deleteDoctor,
    });
  } catch (error) {
    console.error("Error deleting doctor", error);
    return res.status(500).json({
      message: "failed to delete doctor",
    });
  }
};

export const searchDoctors = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    // Empty search → return all doctors
    const filter = query
      ? {
          fullName: { $regex: query, $options: "i" },
        }
      : {};

    const doctors = await doctorModel.find(filter);

    return res.status(200).json({
      message: "Doctors fetched",
      doctors,
    });
  } catch (error) {
    console.error("Doctor search error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};



export const getDoctorNotifications = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;

    const doctor = await doctorModel.findById(doctorId);

    // ✅ Null check added
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res.json({
      notifications: doctor.notifications || [],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching notifications" });
  }
};

export const acceptDoctorRequest = async (req: Request, res: Response) => {
  try {
    const { doctorId, notificationId, clinicId } = req.body;

    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // update status
    const notif = doctor.notifications.find(
      (n: any) => n._id.toString() === notificationId
    );

    if (!notif) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notif.status = "accepted";

    // add clinic to doctor profile
    if (!doctor.clinic.includes(clinicId)) {
      doctor.clinic.push(clinicId);
    }

    await doctor.save();

    res.json({ message: "Request accepted" });
  } catch (error) {
    res.json({ message: "Error accepting request" });
  }
};

export const rejectDoctorRequest = async (req: Request, res: Response) => {
  try {
    const { doctorId, notificationId } = req.body;

    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const notif = doctor.notifications.find(
      (n: any) => n._id.toString() === notificationId
    );

    if (!notif) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notif.status = "rejected";

    await doctor.save();

    res.json({ message: "Request rejected" });
  } catch (error) {
    res.json({ message: "Error rejecting request" });
  }
};

export default {
  getAllDoctors,
  doctorRegister,
  updateDoctorData,
  getDoctorById,
  deleteDoctor,
  updateDoctor,
  getClinicDoctors,
  doctorLogin,
  getTodaysBookedAppointments,
  getTotalPatients,
  searchDoctors,
  getDoctorNotifications,
  acceptDoctorRequest,
  rejectDoctorRequest,
};
