import { Request, Response } from "express";
import offlineBooking from "../models/OfflineBookingModel.js";
import tokenCounter from "../models/tokenCounter.model.js";

export const bookToken = async (req: Request, res: Response) => {
  try {
    console.log(req.body);

    const { doctorId, userId, patient, fees, date } = req.body;

// Duplicate check 
    const existingBooking = await offlineBooking.findOne({
      doctorId,
      userId,
      date,
    });

    if (existingBooking) {
      return res.status(409).json({
        message: `You have already booked a token for this date. Your token number is #${existingBooking.tokenNumber}.`,
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const counter = await tokenCounter.findOneAndUpdate(
      { doctorId, date: today },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );

    const booking = await offlineBooking.create({
      doctorId,
      userId,
      patient,
      tokenNumber: counter.seq,
      date: date,
      fees,
      status: "pending",
    });

    return res.status(201).json({
      message: "Offline Booking Done.",
      tokenNumber: counter.seq,
      booking,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error." });
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

// export default {
//   bookToken,
//   getDoctorOfflineBookings,
//   updateOfflineBookingStatus
// };