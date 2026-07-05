import { Request, Response } from "express";
import offlineBooking from "../models/OfflineBookingModel.js";
import tokenCounter from "../models/tokenCounter.model.js";
import clinicModel from "../models/clinic.model.js";
import patientModel from "../models/patient.model.js";
import doctorModel from "../models/doctor.model.js";
import EMRModel from "../models/emr.model.js";
import mongoose from "mongoose";

// export const bookToken = async (req: Request, res: Response) => {
//   try {
//     console.log(req.body);

//     const { doctorId, userId, patient, fees, date } = req.body;

// // Duplicate check 
//     const existingBooking = await offlineBooking.findOne({
//       doctorId,
//       userId,
//       date,
//     });

//     if (existingBooking) {
//       return res.status(409).json({
//         message: `You have already booked a token for this date. Your token number is #${existingBooking.tokenNumber}.`,
//       });
//     }

//     const today = new Date().toISOString().split("T")[0];

//     const counter = await tokenCounter.findOneAndUpdate(
//       { doctorId, date: today },
//       { $inc: { seq: 1 } },
//       { new: true, upsert: true },
//     );

//     const booking = await offlineBooking.create({
//       doctorId,
//       userId,
//       patient,
//       tokenNumber: counter.seq,
//       date: date,
//       fees,
//       status: "pending",
//     });

//     return res.status(201).json({
//       message: "Offline Booking Done.",
//       tokenNumber: counter.seq,
//       booking,
//     });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ message: "Internal server error." });
//   }
// };


// export const bookToken = async (req: any, res: Response) => {
//   try {
//     console.log(req.body);
//     const { doctorId, userId, patient, fees, date } = req.body;

//     if (!doctorId || !patient || !date) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // 👇 Determine who is booking
//     const isReceptionist = req.user?.clinic; // from receptionist token
//     const isPatient = req.user?.id && !req.user?.clinic;

//     // ===============================
//     // If Receptionist Booking
//     // ===============================
//     if (isReceptionist) {
//       const clinic = await clinicModel.findById(req.user.clinic);

//       if (!clinic) {
//         return res.status(404).json({ message: "Clinic not found" });
//       }

//       // Check doctor belongs to clinic
//       if (!clinic.doctors.includes(doctorId)) {
//         return res.status(403).json({
//           message: "Doctor does not belong to your clinic",
//         });
//       }
//     }

//     // ===============================
//     // Duplicate Check
//     // ===============================
//     const existingBooking = await offlineBooking.findOne({
//       doctorId,
//       userId: userId || null,
//       date,
//     });

//     if (existingBooking) {
//       return res.status(409).json({
//         message: `Already booked. Token number is #${existingBooking.tokenNumber}`,
//       });
//     }

//     // ===============================
//     // Token Counter (PER DATE FIXED)
//     // ===============================
//     const counter = await tokenCounter.findOneAndUpdate(
//       { doctorId, date },
//       { $inc: { seq: 1 } },
//       { new: true, upsert: true }
//     );

//     // ===============================
//     // Create Booking
//     // ===============================
//     const booking = await offlineBooking.create({
//       doctorId,
//       userId: userId || null, // receptionist booking may not have userId
//       patient,
//       tokenNumber: counter.seq,
//       date,
//       fees,
//       status: "pending",
//       bookedBy: isReceptionist ? "receptionist" : "patient",
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Booking Successful",
//       tokenNumber: counter.seq,
//       booking,
//     });

//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ message: "Internal server error." });
//   }
// };

// export const bookToken = async (req: any, res: Response) => {
//   try {
//     const { doctorId, fullName, gender, dob, mobileNumber, aadhar, date, paid } =
//       req.body;


//     // ===============================
//     // Validation
//     // ===============================
//     if (!doctorId || !fullName || !gender || !dob || !mobileNumber || !date) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }


//     // ===============================
//     // Receptionist clinic check
//     // ===============================
//     const isReceptionist = req.user?.clinic;


//     if (isReceptionist) {
//       const clinic = await clinicModel.findById(req.user.clinic);


//       if (!clinic) {
//         return res.status(404).json({ message: "Clinic not found" });
//       }


//       if (!clinic.doctors.includes(doctorId)) {
//         return res
//           .status(403)
//           .json({ message: "Doctor does not belong to your clinic" });
//       }
//     }


//     // ===============================
//     // Find or Register Patient
//     // ===============================


//     // Check by mobile + name first (primary dedup key)
//     let patient = await patientModel.findOne({
//       mobileNumber,
//       fullName,
//     });


//     if (!patient) {
//       // If aadhar provided, make sure it's not already used by someone else
//       if (aadhar) {
//         const aadharExists = await patientModel.findOne({
//           aadhar: String(aadhar),
//         });


//         if (aadharExists) {
//           return res.status(400).json({
//             message:
//               "A different patient with this Aadhar already exists. Please verify details.",
//           });
//         }
//       }


//       // Register new walk-in patient
//       patient = await patientModel.create({
//         fullName,
//         gender,
//         dob,
//         mobileNumber,
//         ...(aadhar ? { aadhar: String(aadhar) } : {}),
//       });
//     }


//     // ===============================
//     // Duplicate booking check
//     // ===============================
//     const existingBooking = await offlineBooking.findOne({
//       doctorId,
//       userId: patient._id,
//       date,
//     });


//     if (existingBooking) {
//       return res.status(409).json({
//         message: `Already booked for this date. Token number is #${existingBooking.tokenNumber}`,
//       });
//     }


//     // ===============================
//     // Get fees from doctor model
//     // ===============================
//     const doctor = await doctorModel.findById(doctorId);
//     console.log(doctor)
//     if (!doctor) {
//       return res.status(404).json({ message: "Doctor not found" });
//     }


//     // ===============================
//     // Token Counter (per doctor per date)
//     // ===============================
//     const counter = await tokenCounter.findOneAndUpdate(
//       { doctorId, date },
//       { $inc: { seq: 1 } },
//       { new: true, upsert: true }
//     );


//     // ===============================
//     // Create Booking
//     // ===============================
//     const booking = await offlineBooking.create({
//       doctorId,
//       userId: patient._id,
//       patient: fullName,
//       tokenNumber: counter.seq,
//       date,
//       fees: (doctor as any).consultationFee,
//       status: "pending",
//       bookedBy: isReceptionist ? "receptionist" : "patient",
//       paid: paid,
//     });


//     return res.status(201).json({
//       success: true,
//       message: "Booking Successful",
//       tokenNumber: counter.seq,
//       booking,
//       patient,
//       paid: paid,
//     });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ message: "Internal server error." });
//   }
// };

export const bookToken = async (req: any, res: Response) => {
  try {
    const {
      doctorId,
      fullName,
      gender,
      dob,
      mobileNumber,
      aadhar,
      date,
      paid,
    } = req.body;

    // ===============================
    // Validation
    // ===============================
    if (!doctorId || !fullName || !gender || !dob || !mobileNumber || !date) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // ===============================
    // Receptionist clinic check
    // ===============================
    const isReceptionist = req.user?.clinic;

    if (isReceptionist) {
      const clinic = await clinicModel.findById(req.user.clinic);

      if (!clinic) {
        return res.status(404).json({
          message: "Clinic not found",
        });
      }

      if (!clinic.doctors.includes(doctorId)) {
        return res.status(403).json({
          message: "Doctor does not belong to your clinic",
        });
      }
    }

    // ===============================
    // Find or Create Patient
    // ===============================
    let patient = await patientModel.findOne({
      fullName,
      mobileNumber,
    });

    if (!patient) {
      patient = await patientModel.create({
        fullName,
        gender,
        dob,
        mobileNumber,
        ...(aadhar ? { aadhar: String(aadhar) } : {}),
      });
    }

    // ===============================
    // Find or Create EMR
    // ===============================
    let emr = await EMRModel.findOne({
      fullName,
      mobileNumber: String(mobileNumber),
    });

    if (!emr) {
      emr = await EMRModel.create({
        fullName,
        mobileNumber: String(mobileNumber),
        ...(aadhar ? { aadhar: String(aadhar) } : {}),
      });
    }

    // ===============================
    // Duplicate booking check
    // ===============================
    const existingBooking = await offlineBooking.findOne({
      doctorId,
      userId: patient._id,
      date,
    });

    if (existingBooking) {
      return res.status(409).json({
        message: `Already booked for this date. Token number is #${existingBooking.tokenNumber}`,
      });
    }

    // ===============================
    // Doctor Check
    // ===============================
    const doctor = await doctorModel.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    // ===============================
    // Token Counter
    // ===============================
    const counter = await tokenCounter.findOneAndUpdate(
      { doctorId, date },
      { $inc: { seq: 1 } },
      {
        new: true,
        upsert: true,
      }
    );

    // ===============================
    // Create Booking
    // ===============================
    const booking = await offlineBooking.create({
      doctorId,
      userId: patient._id,
      patient: fullName,
      tokenNumber: counter.seq,
      date,
      fees: (doctor as any).consultationFee,
      status: "pending",
      bookedBy: isReceptionist ? "receptionist" : "patient",
      paid,
    });

    return res.status(201).json({
      success: true,
      message: "Booking Successful",
      tokenNumber: counter.seq,
      booking,
      patient,
      emr,
      paid,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};


export const getDoctorOfflineBookings = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required." });
    }

    const bookings = await offlineBooking
      .find({ doctorId })
      .populate("userId")
      .sort({ date: 1, tokenNumber: 1 });

    return res.status(200).json({ bookings });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const updateOfflineBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const updated = await offlineBooking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Booking not found." });
    }

    return res.status(200).json({ message: "Status updated.", booking: updated });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getOfflineBookingsByDoctorAllPatient = async(req:Request,res:Response)=>{
  try {
    const { doctorId } = req.params;

    // Find all bookings for this doctor
    const bookings = await offlineBooking.find({ doctorId })
      .populate("userId", "fullName email phone") // patient info
      // .populate("slotId") // slot info
      .populate("tokenNumber date")   
      .lean();

    if (!bookings || bookings.length === 0) {
      return res.status(200).json({ bookings: [] });
    }

    // Add EMR data for each booking's patient
    const bookingsWithEMR = await Promise.all(
      bookings.map(async (b) => {
        const emrData = await EMRModel.find({ patientId: b.userId?._id })
          .sort({ createdAt: -1 })
          .lean();

        return {
          ...b,
          // slot: b.slot || null,
          emr: emrData || [], // include EMR records for this patient
        };
      })
    );

    return res.status(200).json({ bookings: bookingsWithEMR });
  } catch (err) {
    console.error("Error fetching doctor bookings:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// export default {
//   bookToken,
//   getDoctorOfflineBookings,
//   updateOfflineBookingStatus
// };