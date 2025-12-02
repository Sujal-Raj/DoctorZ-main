import timeSlotsModel from "../models/timeSlots.model.js";
import { generateTimeSlots } from "../utils/slotGenerator.js";
//------------------------Create time slots ------------------------
export const createTimeSlot = async (req, res) => {
    try {
        console.log("Request Body:", req.body);
        const { doctorId, dates, workingHours } = req.body;
        const slots = generateTimeSlots(workingHours.start, workingHours.end);
        const availability = [];
        const alreadyExistDates = [];
        for (const rawDate of dates) {
            // ✅ Support ISO + plain date formats
            const dateStr = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;
            let dateIso = rawDate;
            // Remove time part
            if (dateIso.includes("T")) {
                dateIso = dateIso.split("T")[0];
            }
            const [year, month, day] = dateIso.split("-").map(Number);
            // ✅ Create a date WITHOUT timezone shift
            const pureDate = new Date(Date.UTC(year, month - 1, day));
            if (isNaN(pureDate.getTime())) {
                console.log("Invalid parsed date:", rawDate, pureDate);
                continue; // skip invalid dates
            }
            // ✅ Check existing
            const existing = await timeSlotsModel.findOne({
                doctorId,
                date: pureDate,
            });
            if (existing) {
                alreadyExistDates.push(dateStr);
                continue;
            }
            availability.push({
                doctorId,
                date: pureDate,
                slots,
            });
        }
        if (availability.length > 0) {
            await timeSlotsModel.insertMany(availability);
            console.log("Inserted Availability:", availability);
        }
        return res.status(200).json({
            success: true,
            message: "Time slots processed successfully",
            createdDates: availability.map((a) => a.date.toISOString().split("T")[0]),
            alreadyExistDates,
        });
    }
    catch (error) {
        console.error("Error creating time slot:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
//------------------------Get all slots ------------------------
export const getTimeSlots = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const slots = await timeSlotsModel.find({ doctorId });
        return res.status(200).json(slots);
    }
    catch (error) {
        console.error("Error fetching time slots:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
// -------------------------Update a  slot------------------------
export const updateSlot = async (req, res) => {
    try {
        const { time, isActive } = req.body;
        const { id } = req.params;
        const timeSlot = await timeSlotsModel.findById(id);
        if (!timeSlot) {
            return res.status(404).json({ message: "Time slot not found" });
        }
        const slot = timeSlot.slots.find((s) => s.time === time);
        if (!slot) {
            return res.status(404).json({ message: "Specific slot not found" });
        }
        slot.isActive = isActive;
        await timeSlot.save();
        return res
            .status(200)
            .json({ message: "Slot updated successfully", slots: timeSlot.slots });
    }
    catch (error) {
        console.error("Error updating slot:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
//------------------------Edit slots for a date------------------------
export const editTimeSlot = async (req, res) => {
    try {
        const { doctorId, date, workingHours } = req.body;
        if (!doctorId || !date || !workingHours) {
            return res.status(400).json({ message: "doctorId, date & workingHours are required" });
        }
        const { start, end } = workingHours;
        const existing = await timeSlotsModel.findOne({ doctorId, date });
        if (!existing) {
            return res.status(404).json({ message: "No slot found for this date" });
        }
        // Generate new 15-min slots
        const generated = generateTimeSlots(start, end);
        // Merge old states
        const merged = generated.map((slot) => {
            const oldSlot = existing.slots.find((s) => s.time === slot.time);
            if (oldSlot) {
                return {
                    time: slot.time,
                    isActive: oldSlot.isActive,
                    _id: oldSlot._id, // only add if exists
                };
            }
            // new slot → active by default
            return {
                time: slot.time,
                isActive: true,
            };
        });
        existing.slots = merged;
        await existing.save();
        return res.status(200).json({
            success: true,
            message: "Time slots updated successfully",
            data: existing,
        });
    }
    catch (err) {
        console.error("Edit Slot Error:", err);
        return res.status(500).json({ message: "Server error", error: err });
    }
};
//----------------------------getActiveSlots----------------------------
export const getActiveSlots = async (req, res) => {
    try {
        const { doctorId } = req.params;
        // Get all time slots for doctor
        const slots = await timeSlotsModel.find({ doctorId });
        // Filter only those having at least 1 active slot
        const filteredSlots = slots.filter((slot) => slot.slots.some((s) => s.isActive));
        // Return only active ones
        res.status(200).json(filteredSlots);
    }
    catch (error) {
        console.error("Error fetching active slots:", error);
        res.status(500).json({ message: "Server error" });
    }
};
//# sourceMappingURL=timeSlots.controller.js.map