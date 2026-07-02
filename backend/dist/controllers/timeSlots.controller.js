import timeSlotsModel from "../models/timeSlots.model.js";
/* =======================
   Helpers
======================= */
const normalizeDate = (dateStr) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
};
const toMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};
const generateTimeSlots = (startTime, endTime) => {
    const start = toMinutes(startTime);
    const end = toMinutes(endTime);
    if (isNaN(start) || isNaN(end) || start >= end) {
        throw new Error("Invalid working hours");
    }
    const slots = [];
    for (let t = start; t < end; t += 30) {
        const h = Math.floor(t / 60);
        const m = t % 60;
        slots.push({
            time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
            isActive: true,
        });
    }
    return slots;
};
/* =======================
   CREATE
======================= */
export const createTimeSlot = async (req, res) => {
    try {
        const { doctorId, dates, workingHours, mode } = req.body;
        console.log(mode);
        if (!doctorId || !dates?.length || !workingHours?.start || !workingHours?.end || !mode) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const slots = generateTimeSlots(workingHours.start, workingHours.end);
        const createdDates = [];
        const alreadyExistDates = [];
        for (const dateStr of dates) {
            const date = normalizeDate(dateStr);
            const exists = await timeSlotsModel.findOne({ doctorId, date, mode });
            if (exists) {
                alreadyExistDates.push(dateStr);
                continue;
            }
            await timeSlotsModel.create({
                doctorId,
                date,
                mode,
                slots,
            });
            createdDates.push(dateStr);
        }
        res.status(201).json({
            success: true,
            createdDates,
            alreadyExistDates,
        });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
};
/* =======================
   EDIT
======================= */
export const editTimeSlot = async (req, res) => {
    try {
        const { doctorId, date, workingHours, mode } = req.body;
        const slots = generateTimeSlots(workingHours.start, workingHours.end);
        const updated = await timeSlotsModel.findOneAndUpdate({ doctorId, date: normalizeDate(date), mode }, { slots }, { new: true });
        if (!updated) {
            return res.status(404).json({ message: "Slot not found" });
        }
        res.json({ success: true, data: updated });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
/* =======================
   GET
======================= */
// export const getTimeSlots = async (req: Request, res: Response) => {
//   const { doctorId } = req.params;
//   const data = await timeSlotsModel.find({ doctorId }).sort({ date: 1 });
//   res.json(data);
// };
export const getDoctorTimeSlots = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const slots = await timeSlotsModel
            .find({ doctorId })
            .sort({ date: 1 });
        res.json(slots); // ✅ raw array
    }
    catch (error) {
        console.error("Error fetching doctor slots:", error);
        res.status(500).json({ message: "Server error" });
    }
};
// export const getPatientSlots = async (req:Request, res:Response) => {
//   try {
//     const { doctorId } = req.params;
//     const { mode } = req.query;
//     if (!mode || !["online", "offline"].includes(mode as string)) {
//       return res.status(400).json({
//         message: "Mode must be 'online' or 'offline'",
//       });
//     }
//     const slots = await timeSlotsModel
//       .find({ doctorId, mode })
//       .sort({ date: 1 });
//     const availableMonths: { [key: string]: { date: string; slots: any[] }[] } = {};
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     for (const entry of slots) {
//       const entryDate = new Date(entry.date);
//       entryDate.setHours(0, 0, 0, 0);
//       if (entryDate < today) continue;
//       const year = entryDate.getFullYear();
//       const month = String(entryDate.getMonth() + 1).padStart(2, "0");
//       const monthKey = `${year}-${month}`;
//       if (!availableMonths[monthKey]) {
//         availableMonths[monthKey] = [];
//       }
//       availableMonths[monthKey].push({
//         date: entry.date.toISOString(),
//         slots: entry.slots,
//       });
//     }
//     res.json({
//       message: "Available months and slots fetched successfully",
//       availableMonths,
//     });
//   } catch (error) {
//     console.error("Error fetching patient slots:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// export const getPatientSlots = async (req: Request, res: Response) => {
//   try {
//     const { doctorId } = req.params;
//     const { mode } = req.query;
//     if (!mode || !["online", "offline"].includes(mode as string)) {
//       return res.status(400).json({
//         message: "Mode must be 'online' or 'offline'",
//       });
//     }
//     const slots = await timeSlotsModel
//       .find({ doctorId, mode })
//       .sort({ date: 1 });
//     const availableMonths: { [key: string]: { date: string; slots: any[] }[] } =
//       {};
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     for (const entry of slots) {
//       const entryDate = new Date(entry.date);
//       entryDate.setHours(0, 0, 0, 0);
//       if (entryDate < today) continue;
//       const year = entryDate.getFullYear();
//       const month = String(entryDate.getMonth() + 1).padStart(2, "0");
//       const monthKey = `${year}-${month}`;
//       if (!availableMonths[monthKey]) {
//         availableMonths[monthKey] = [];
//       }
//       availableMonths[monthKey].push({
//         date: entry.date.toISOString(),
//         slots: entry.slots,
//       });
//     }
//     res.json({
//       message: "Available months and slots fetched successfully",
//       availableMonths,
//     });
//   } catch (error) {
//     console.error("Error fetching patient slots:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
export const getPatientSlots = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { mode } = req.query;
        console.log(`[getPatientSlots] doctorId: ${doctorId}, mode: ${mode}`);
        if (!mode || !["online", "offline"].includes(mode)) {
            return res.status(400).json({
                message: "Mode must be 'online' or 'offline'",
            });
        }
        console.log(`[getPatientSlots] Querying with filter: { doctorId: ${doctorId}, mode: ${mode} }`);
        const slots = await timeSlotsModel
            .find({ doctorId, mode })
            .sort({ date: 1 });
        console.log(`[getPatientSlots] Found ${slots.length} documents`);
        slots.forEach((slot, index) => {
            console.log(`  [${index}] Date: ${slot.date}, Mode: ${slot.mode}, Slots: ${slot.slots.length}`);
        });
        const availableMonths = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (const entry of slots) {
            const entryDate = new Date(entry.date);
            entryDate.setHours(0, 0, 0, 0);
            if (entryDate < today)
                continue;
            const year = entryDate.getFullYear();
            const month = String(entryDate.getMonth() + 1).padStart(2, "0");
            const monthKey = `${year}-${month}`;
            if (!availableMonths[monthKey]) {
                availableMonths[monthKey] = [];
            }
            availableMonths[monthKey].push({
                date: entry.date.toISOString(),
                slots: entry.slots,
            });
        }
        console.log(`[getPatientSlots] Returning months:`, Object.keys(availableMonths));
        res.json({
            message: "Available months and slots fetched successfully",
            availableMonths,
        });
    }
    catch (error) {
        console.error("Error fetching patient slots:", error);
        res.status(500).json({ message: "Server error" });
    }
};
// export const getTimeSlots = async (req: Request, res: Response) => {
//   try {
//     const { doctorId } = req.params;
//     const { mode } = req.query;
//     console.log(doctorId,mode)
//     if (!mode || !["online", "offline"].includes(mode as string)) {
//       return res.status(400).json({
//         message: "Mode must be 'online' or 'offline'",
//       });
//     }
//     // Fetch slots filtered by doctor + mode
//     const slots = await timeSlotsModel
//       .find({
//         doctorId,
//         mode,
//       })
//       .sort({ date: 1 });
//     const availableMonths: {
//       [key: string]: { date: string; slots: any[] }[];
//     } = {};
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     for (const entry of slots) {
//       const entryDate = new Date(entry.date);
//       entryDate.setHours(0, 0, 0, 0);
//       // Only include today & future dates
//       if (entryDate < today) continue;
//       const year = entryDate.getFullYear();
//       const month = String(entryDate.getMonth() + 1).padStart(2, "0");
//       const monthKey = `${year}-${month}`;
//       if (!availableMonths[monthKey]) {
//         availableMonths[monthKey] = [];
//       }
//       availableMonths[monthKey].push({
//         date: entry.date.toISOString(),
//         slots: entry.slots,
//       });
//     }
//     res.json({ availableMonths });
//   } catch (error) {
//     console.error("Error fetching slots:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
/* =======================
   UPDATE SINGLE SLOT
======================= */
export const updateSlot = async (req, res) => {
    const { id } = req.params;
    const { time, isActive } = req.body;
    const updated = await timeSlotsModel.findOneAndUpdate({ _id: id, "slots.time": time }, { $set: { "slots.$.isActive": isActive } }, { new: true });
    if (!updated) {
        return res.status(404).json({ message: "Slot not found" });
    }
    res.json({ success: true });
};
/* =======================
   DELETE
======================= */
export const deleteTimeSlot = async (req, res) => {
    await timeSlotsModel.findByIdAndDelete(req.params.slotId);
    res.json({ success: true });
};
