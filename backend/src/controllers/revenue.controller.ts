import type { Request, Response } from "express";
import mongoose from "mongoose";
import BookingModel from "../models/booking.model.js";
import offlineBooking from "../models/OfflineBookingModel.js";
import { LabTestBookingModel, PackageBookingModel } from "../models/lab.model.js";
import doctorModel from "../models/doctor.model.js";
import clinicModel from "../models/clinic.model.js";

// ==========================================
// DOCTOR EARNINGS CALCULATIONS
// ==========================================
export const getDoctorEarnings = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { clinicId } = req.query; // optional clinicId. Can be clinic ObjectId, "independent", or "all"

    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(startOfMonth.getDate() - 30);
    startOfMonth.setHours(0, 0, 0, 0);

    // Build filters
    const filter: any = {
      doctorId: new mongoose.Types.ObjectId(doctorId),
      paymentStatus: "paid"
    };

    if (clinicId) {
      if (clinicId === "independent") {
        filter.clinicId = null;
      } else if (clinicId !== "all") {
        filter.clinicId = new mongoose.Types.ObjectId(clinicId as string);
      }
    }

    // Query both online and offline paid bookings
    // For online bookings we check 'dateTime', for offline we check 'date'
    const onlineBookings = await BookingModel.find({
      ...filter,
    }).lean();

    const offlineBookings = await offlineBooking.find({
      ...filter,
    }).lean();

    // Map fields consistently
    const allBookings = [
      ...onlineBookings.map((b: any) => ({
        _id: b._id,
        patientName: b.patient?.name || "Patient",
        fees: b.fees || 0,
        date: new Date(b.dateTime),
        paymentMethod: b.paymentMethod || "online",
        transactionId: b.transactionId || "—",
        type: "online",
        clinicId: b.clinicId
      })),
      ...offlineBookings.map((b: any) => ({
        _id: b._id,
        patientName: typeof b.patient === "string" ? b.patient : b.patient?.name || "Patient",
        fees: b.fees || 0,
        date: new Date(b.date),
        paymentMethod: b.paymentMethod || "cash",
        transactionId: b.transactionId || "—",
        type: "offline",
        clinicId: b.clinicId
      }))
    ];

    // Compute stats
    let totalEarnings = 0;
    let todayEarnings = 0;
    let weeklyEarnings = 0;
    let monthlyEarnings = 0;
    const consultationCount = allBookings.length;

    allBookings.forEach((b) => {
      totalEarnings += b.fees;
      const bTime = b.date.getTime();

      if (bTime >= startOfToday.getTime()) {
        todayEarnings += b.fees;
      }
      if (bTime >= startOfWeek.getTime()) {
        weeklyEarnings += b.fees;
      }
      if (bTime >= startOfMonth.getTime()) {
        monthlyEarnings += b.fees;
      }
    });

    const averageFee = consultationCount > 0 ? Math.round(totalEarnings / consultationCount) : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalEarnings,
        todayEarnings,
        weeklyEarnings,
        monthlyEarnings,
        consultationCount,
        averageFee,
      },
      bookings: allBookings.sort((a, b) => b.date.getTime() - a.date.getTime())
    });

  } catch (err) {
    console.error("Error in getDoctorEarnings:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ==========================================
// CLINIC REVENUE CALCULATIONS
// ==========================================
export const getClinicRevenue = async (req: Request, res: Response) => {
  try {
    const { clinicId } = req.params;

    const clinic = await clinicModel.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ message: "Clinic not found" });
    }

    const cId = new mongoose.Types.ObjectId(clinicId);

    // Fetch all bookings (online and offline) where clinicId is this clinic and status is paid
    const onlineBookings = await BookingModel.find({ clinicId: cId, paymentStatus: "paid" })
      .populate("doctorId", "fullName")
      .lean();

    const offlineBookings = await offlineBooking.find({ clinicId: cId, paymentStatus: "paid" })
      .populate("doctorId", "fullName")
      .lean();

    const allBookings = [
      ...onlineBookings.map((b: any) => ({
        _id: b._id,
        doctorId: b.doctorId?._id,
        doctorName: b.doctorId?.fullName || "Doctor",
        patientName: b.patient?.name || "Patient",
        fees: b.fees || 0,
        date: new Date(b.dateTime),
        paymentMethod: b.paymentMethod || "online",
        transactionId: b.transactionId || "—",
        type: "online"
      })),
      ...offlineBookings.map((b: any) => ({
        _id: b._id,
        doctorId: b.doctorId?._id,
        doctorName: b.doctorId?.fullName || "Doctor",
        patientName: typeof b.patient === "string" ? b.patient : b.patient?.name || "Patient",
        fees: b.fees || 0,
        date: new Date(b.date),
        paymentMethod: b.paymentMethod || "cash",
        transactionId: b.transactionId || "—",
        type: "offline"
      }))
    ];

    // Compute stats
    let totalRevenue = 0;
    const doctorWiseMap: Record<string, { doctorName: string; amount: number; count: number }> = {};
    const dailyMap: Record<string, number> = {};
    const monthlyMap: Record<string, number> = {};

    allBookings.forEach((b) => {
      totalRevenue += b.fees;

      // Group doctor wise
      const docIdStr = String(b.doctorId);
      if (!doctorWiseMap[docIdStr]) {
        doctorWiseMap[docIdStr] = { doctorName: b.doctorName, amount: 0, count: 0 };
      }
      doctorWiseMap[docIdStr].amount += b.fees;
      doctorWiseMap[docIdStr].count += 1;

      // Group daily (YYYY-MM-DD)
      const dayKey = b.date.toISOString().split("T")[0];
      dailyMap[dayKey] = (dailyMap[dayKey] || 0) + b.fees;

      // Group monthly (YYYY-MM)
      const monthKey = b.date.toISOString().slice(0, 7);
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + b.fees;
    });

    // Format maps into arrays
    const doctorWiseRevenue = Object.values(doctorWiseMap);
    const dailyRevenue = Object.entries(dailyMap).map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date));
    const monthlyRevenue = Object.entries(monthlyMap).map(([month, amount]) => ({ month, amount })).sort((a, b) => a.month.localeCompare(b.month));

    return res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        bookingCount: allBookings.length
      },
      doctorWiseRevenue,
      dailyRevenue,
      monthlyRevenue,
      appointments: allBookings.sort((a, b) => b.date.getTime() - a.date.getTime())
    });

  } catch (err) {
    console.error("Error in getClinicRevenue:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ==========================================
// RECEPTIONIST COLLECTIONS CALCULATIONS
// ==========================================
export const getReceptionistCollections = async (req: Request, res: Response) => {
  try {
    const receptionistClinicId = (req as any).user?.clinic;
    if (!receptionistClinicId) {
      return res.status(403).json({ message: "Access denied. Clinic association not found." });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const cId = new mongoose.Types.ObjectId(receptionistClinicId);

    // Get all offline bookings booked by receptionist for this clinic
    const bookings = await offlineBooking.find({
      clinicId: cId,
      bookedBy: "receptionist"
    }).populate("doctorId", "fullName").lean();

    let dailyCollections = 0;
    let totalPaymentsCollected = 0;
    const pendingPayments: any[] = [];
    const paymentHistory: any[] = [];

    bookings.forEach((b: any) => {
      const fees = b.fees || 0;
      const bDate = new Date(b.date);
      const isPaidStr = String(b.paymentStatus || (b.paid ? "paid" : "unpaid")).toLowerCase();
      const isPaid = isPaidStr === "paid";

      const formatted = {
        _id: b._id,
        patientName: typeof b.patient === "string" ? b.patient : b.patient?.name || "Patient",
        doctorName: b.doctorId?.fullName || "Doctor",
        fees,
        date: bDate,
        paymentStatus: isPaid ? "Paid" : isPaidStr === "pending" ? "Pending" : "Unpaid",
        paymentMethod: b.paymentMethod || "—",
        transactionId: b.transactionId || "—"
      };

      if (isPaid) {
        totalPaymentsCollected += fees;
        if (bDate.getTime() >= startOfToday.getTime()) {
          dailyCollections += fees;
        }
        paymentHistory.push(formatted);
      } else {
        pendingPayments.push(formatted);
      }
    });

    return res.status(200).json({
      success: true,
      stats: {
        dailyCollections,
        totalPaymentsCollected,
        pendingCount: pendingPayments.length
      },
      pendingPayments,
      paymentHistory: paymentHistory.sort((a, b) => b.date.getTime() - a.date.getTime())
    });

  } catch (err) {
    console.error("Error in getReceptionistCollections:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ==========================================
// LAB REVENUE CALCULATIONS
// ==========================================
export const getLabRevenue = async (req: Request, res: Response) => {
  try {
    const { labId } = req.params;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(startOfMonth.getDate() - 30);
    startOfMonth.setHours(0, 0, 0, 0);

    const lId = new mongoose.Types.ObjectId(labId);

    // Query paid test bookings and package bookings
    const testBookings = await LabTestBookingModel.find({ labId: lId, paymentStatus: "paid" })
      .populate("userId", "fullName")
      .lean();

    const packageBookings = await PackageBookingModel.find({ labId: lId, paymentStatus: "paid" })
      .populate("userId", "fullName")
      .populate("packageId", "packageName totalPrice")
      .lean();

    const allBookings = [
      ...testBookings.map((b: any) => ({
        _id: b._id,
        patientName: b.userId?.fullName || "Patient",
        itemName: b.testName || "Lab Test",
        amount: b.price || 0,
        date: new Date(b.bookingDate),
        paymentMethod: b.paymentMethod || "online",
        transactionId: b.transactionId || "—",
        type: "test"
      })),
      ...packageBookings.map((b: any) => ({
        _id: b._id,
        patientName: b.userId?.fullName || "Patient",
        itemName: b.packageId?.packageName || "Health Package",
        amount: b.packageId?.totalPrice || 0,
        date: new Date(b.bookingDate),
        paymentMethod: b.paymentMethod || "online",
        transactionId: b.transactionId || "—",
        type: "package"
      }))
    ];

    let totalRevenue = 0;
    let todayRevenue = 0;
    let weeklyRevenue = 0;
    let monthlyRevenue = 0;
    const testCount = allBookings.length;

    allBookings.forEach((b) => {
      totalRevenue += b.amount;
      const bTime = b.date.getTime();

      if (bTime >= startOfToday.getTime()) {
        todayRevenue += b.amount;
      }
      if (bTime >= startOfWeek.getTime()) {
        weeklyRevenue += b.amount;
      }
      if (bTime >= startOfMonth.getTime()) {
        monthlyRevenue += b.amount;
      }
    });

    const averageBill = testCount > 0 ? Math.round(totalRevenue / testCount) : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        todayRevenue,
        weeklyRevenue,
        monthlyRevenue,
        testCount,
        averageBill
      },
      bookings: allBookings.sort((a, b) => b.date.getTime() - a.date.getTime())
    });

  } catch (err) {
    console.error("Error in getLabRevenue:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ==========================================
// UPDATE APPOINTMENT OR LAB PAYMENT STATUS
// ==========================================
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { bookingType, bookingId } = req.params;
    const { paymentStatus, paymentMethod, transactionId } = req.body;

    if (!["paid", "unpaid", "pending"].includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid paymentStatus. Must be 'paid', 'unpaid', or 'pending'." });
    }

    const updateFields: any = {
      paymentStatus,
      paymentDate: paymentStatus === "paid" ? new Date() : null,
      paymentMethod: paymentStatus === "paid" ? paymentMethod : null,
      transactionId: paymentStatus === "paid" ? transactionId : null
    };

    let updatedDoc = null;

    if (bookingType === "online") {
      updatedDoc = await BookingModel.findByIdAndUpdate(bookingId, updateFields, { new: true });
    } else if (bookingType === "offline") {
      // Keep 'paid' boolean in sync with paymentStatus
      updateFields.paid = paymentStatus === "paid";
      updatedDoc = await offlineBooking.findByIdAndUpdate(bookingId, updateFields, { new: true });
    } else if (bookingType === "labTest") {
      updatedDoc = await LabTestBookingModel.findByIdAndUpdate(bookingId, updateFields, { new: true });
    } else if (bookingType === "labPackage") {
      updatedDoc = await PackageBookingModel.findByIdAndUpdate(bookingId, updateFields, { new: true });
    } else {
      return res.status(400).json({ message: "Invalid bookingType. Must be 'online', 'offline', 'labTest', or 'labPackage'." });
    }

    if (!updatedDoc) {
      return res.status(404).json({ message: "Booking record not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      booking: updatedDoc
    });

  } catch (err) {
    console.error("Error in updatePaymentStatus:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
