import type { Request, Response } from "express";
import timeSlotsModel from "../models/timeSlots.model.js";

/* =======================
   Helpers
======================= */

const normalizeDate = (dateStr: string): Date => {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
};

const toMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const generateTimeSlots = (
  startTime: string,
  endTime: string
): { time: string; isActive: boolean }[] => {
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

export const createTimeSlot = async (req: Request, res: Response) => {
  try {
    const { doctorId, dates, workingHours, mode } = req.body;
    console.log(mode)

    if (!doctorId || !dates?.length || !workingHours?.start || !workingHours?.end || !mode) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const slots = generateTimeSlots(workingHours.start, workingHours.end);

    const createdDates: string[] = [];
    const alreadyExistDates: string[] = [];

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
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

/* =======================
   EDIT
======================= */

export const editTimeSlot = async (req: Request, res: Response) => {
  try {
    const { doctorId, date, workingHours, mode } = req.body;

    const slots = generateTimeSlots(workingHours.start, workingHours.end);

    const updated = await timeSlotsModel.findOneAndUpdate(
      { doctorId, date: normalizeDate(date), mode },
      { slots },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Slot not found" });
    }

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/* =======================
   GET
======================= */

export const getTimeSlots = async (req: Request, res: Response) => {
  const { doctorId } = req.params;
  const data = await timeSlotsModel.find({ doctorId }).sort({ date: 1 });
  res.json(data);
};

/* =======================
   UPDATE SINGLE SLOT
======================= */

export const updateSlot = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { time, isActive } = req.body;

  const updated = await timeSlotsModel.findOneAndUpdate(
    { _id: id, "slots.time": time },
    { $set: { "slots.$.isActive": isActive } },
    { new: true }
  );

  if (!updated) {
    return res.status(404).json({ message: "Slot not found" });
  }

  res.json({ success: true });
};

/* =======================
   DELETE
======================= */

export const deleteTimeSlot = async (req: Request, res: Response) => {
  await timeSlotsModel.findByIdAndDelete(req.params.slotId);
  res.json({ success: true });
};
