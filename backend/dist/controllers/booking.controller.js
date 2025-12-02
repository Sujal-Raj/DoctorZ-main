import BookingModel from "../models/booking.model.js";
import timeSlotsModel from "../models/timeSlots.model.js";
import EMRModel from "../models/emr.model.js";
export const bookAppointment = async (req, res) => {
    try {
        // Parse patient and EMR data from FormData (they come as strings)
        const patient = req.body.patient ? JSON.parse(req.body.patient) : null;
        const emr = req.body.emr ? JSON.parse(req.body.emr) : null;
        const { doctorId, slot, slotId, dateTime, mode, fees, userId } = req.body;
        // Uploaded files
        const files = req.files; // Multer handles files
        let reportPaths = [];
        if (files?.length) {
            reportPaths = files.map(f => `/uploads/${f.filename}`);
            console.log("📂 Uploaded Reports:", reportPaths);
        }
        // Validate required fields
        if (!patient || !doctorId || !slot || !dateTime || !mode || !userId || !fees) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const roomId = `room_${doctorId}_${userId}_${Date.now()}`;
        // ✅ Check if patient already has booking today
        const existingAadharBooking = await BookingModel.findOne({
            "patient.aadhar": patient.aadhar,
            status: "booked"
        });
        const { name, age, gender, aadhar, contact, relation } = patient;
        const { allergies, diseases, pastSurgeries, currentMedications } = emr || {};
        // Create Booking
        const booking = await BookingModel.create({
            userId,
            doctorId,
            slot,
            slotId,
            dateTime: new Date(dateTime),
            mode,
            fees,
            // emrId: newEmr?._id || null,
            // status: "booked",
            roomId,
            status: "pending",
            patient: { name, age, gender, aadhar, contact, relation },
        });
        // Create EMR if any EMR data or reports exist
        if ((allergies?.length) ||
            (diseases?.length) ||
            (pastSurgeries?.length) ||
            (currentMedications?.length) ||
            reportPaths.length) {
            await EMRModel.create({
                doctorId,
                aadhar, // just for reference
                allergies: allergies || [],
                diseases: diseases || [],
                pastSurgeries: pastSurgeries || [],
                currentMedications: currentMedications || [],
                reports: reportPaths,
            });
        }
        // Mark the booked slot as inactive
        await timeSlotsModel.updateOne({ "slots._id": slotId }, { $set: { "slots.$.isActive": false } });
        return res.status(201).json({
            message: "Appointment booked successfully",
            booking,
        });
    }
    catch (err) {
        console.error("Booking error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
import Booking from "../models/booking.model.js";
export const getBookingsByDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;
        // Find all bookings for this doctor
        const bookings = await Booking.find({ doctorId, status: "pending" })
            .populate("userId", "fullName email phone") // patient info
            .populate("slotId") // slot info
            .lean();
        if (!bookings || bookings.length === 0) {
            return res.status(200).json({ bookings: [] });
        }
        // Add EMR data for each booking's patient
        const bookingsWithEMR = await Promise.all(bookings.map(async (b) => {
            const emrData = await EMRModel.find({ patientId: b.userId?._id })
                .sort({ createdAt: -1 })
                .lean();
            return {
                ...b,
                slot: b.slot || null,
                emr: emrData || [], // include EMR records for this patient
            };
        }));
        return res.status(200).json({ bookings: bookingsWithEMR });
    }
    catch (err) {
        console.error("Error fetching doctor bookings:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body; // expected: "completed" or "cancelled"
        if (!["completed", "cancelled", "booked"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }
        const booking = await BookingModel.findByIdAndUpdate(bookingId, { status }, { new: true });
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        return res.json({ message: "Booking updated successfully", booking });
    }
    catch (err) {
        console.error("Error updating booking status:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const getBookingsByDoctorAllPatient = async (req, res) => {
    try {
        const { doctorId } = req.params;
        // Find all bookings for this doctor
        const bookings = await Booking.find({ doctorId })
            .populate("userId", "fullName email phone") // patient info
            .populate("slotId") // slot info
            .lean();
        if (!bookings || bookings.length === 0) {
            return res.status(200).json({ bookings: [] });
        }
        // Add EMR data for each booking's patient
        const bookingsWithEMR = await Promise.all(bookings.map(async (b) => {
            const emrData = await EMRModel.find({ patientId: b.userId?._id })
                .sort({ createdAt: -1 })
                .lean();
            return {
                ...b,
                slot: b.slot || null,
                emr: emrData || [], // include EMR records for this patient
            };
        }));
        return res.status(200).json({ bookings: bookingsWithEMR });
    }
    catch (err) {
        console.error("Error fetching doctor bookings:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
//# sourceMappingURL=booking.controller.js.map