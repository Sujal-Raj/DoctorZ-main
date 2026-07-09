import { Request, Response } from "express";
import wardModel from "../models/bed.model.js";
import ipdAdmissionModel from "../models/ipdAdmission.model.js";
import patientModel from "../models/patient.model.js";
import doctorModel from "../models/doctor.model.js";
import { sendSimulatedAlert } from "../utils/smsHelper.js";

// ==========================================
// WARD & BED MANAGEMENT
// ==========================================

export const createWard = async (req: Request, res: Response) => {
  try {
    const { clinicId, name, type, chargePerDay, bedCount } = req.body;

    if (!clinicId || !name || !type) {
      return res.status(400).json({ success: false, message: "Clinic ID, name, and type are required" });
    }

    // Auto-generate bed list based on bed count
    const beds = [];
    const count = Number(bedCount) || 5;
    const typeCode = type.substring(0, 3).toUpperCase();
    for (let i = 1; i <= count; i++) {
      beds.push({
        bedNumber: `${typeCode}-${i.toString().padStart(2, "0")}`,
        status: "Available" as const,
      });
    }

    const ward = new wardModel({
      clinicId,
      name,
      type,
      chargePerDay: chargePerDay || 0,
      beds,
    });

    await ward.save();

    return res.status(201).json({ success: true, message: "Ward created successfully", ward });
  } catch (err: any) {
    console.error("Error creating ward:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to create ward" });
  }
};

export const getWardsList = async (req: Request, res: Response) => {
  try {
    const { clinicId } = req.params;

    const list = await wardModel.find({ clinicId });
    return res.status(200).json({ success: true, wards: list });
  } catch (err: any) {
    console.error("Error fetching wards list:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateBedStatus = async (req: Request, res: Response) => {
  try {
    const { wardId, bedId } = req.params;
    const { status } = req.body; // Available | Occupied | Cleaning | Maintenance

    if (!["Available", "Occupied", "Cleaning", "Maintenance"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const ward = await wardModel.findById(wardId);
    if (!ward) {
      return res.status(404).json({ success: false, message: "Ward not found" });
    }

    const bed = ward.beds.find(b => String(b._id) === bedId);
    if (!bed) {
      return res.status(404).json({ success: false, message: "Bed not found" });
    }

    bed.status = status;
    await ward.save();

    return res.status(200).json({ success: true, message: "Bed status modified successfully", ward });
  } catch (err: any) {
    console.error("Error updating bed status:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ==========================================
// IPD ADMISSIONS & CLINICAL CHARTING
// ==========================================

export const admitPatient = async (req: Request, res: Response) => {
  try {
    const {
      clinicId,
      patientId,
      doctorId,
      wardId,
      bedId,
      reasonForAdmission,
      emergencyContactName,
      emergencyContactRelation,
      emergencyContactPhone,
      initialDeposit,
    } = req.body;

    if (!clinicId || !patientId || !doctorId || !wardId || !bedId || !reasonForAdmission) {
      return res.status(400).json({ success: false, message: "Required admission fields are missing" });
    }

    // Verify patient and doctor exist
    const [patient, doctor, ward] = await Promise.all([
      patientModel.findById(patientId),
      doctorModel.findById(doctorId),
      wardModel.findById(wardId),
    ]);

    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
    if (!ward) return res.status(404).json({ success: false, message: "Ward not found" });

    // Locate bed
    const bed = ward.beds.find(b => String(b._id) === bedId);
    if (!bed) return res.status(404).json({ success: false, message: "Bed not found" });
    if (bed.status !== "Available") {
      return res.status(400).json({ success: false, message: "This bed is currently occupied or undergoing maintenance" });
    }

    // Create admission log
    const admission = new ipdAdmissionModel({
      clinicId,
      patientId,
      doctorId,
      wardId,
      bedNumber: bed.bedNumber,
      reasonForAdmission,
      emergencyContact: {
        name: emergencyContactName,
        relation: emergencyContactRelation,
        contact: emergencyContactPhone,
      },
      initialDeposit: initialDeposit || 0,
      status: "Admitted",
    });

    await admission.save();

    // Map bed status to Occupied and save ref
    bed.status = "Occupied";
    bed.currentAdmissionId = admission._id as any;
    await ward.save();

    // Simulated SMS Alert for Admission
    sendSimulatedAlert({
      clinicId: admission.clinicId,
      patientId: admission.patientId,
      type: "Admission",
      recipientPhone: String(patient.mobileNumber),
      message: `Hello ${patient.fullName}, you have been admitted to ${ward.name}, Bed ${admission.bedNumber}. Emergency Contact relations notified. Thank you!`,
    }).catch(err => console.error("Simulated alert error:", err));

    return res.status(201).json({ success: true, message: "Patient admitted to ward", admission });

  } catch (err: any) {
    console.error("Error admitting patient:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to admit patient" });
  }
};

export const getAdmissionsList = async (req: Request, res: Response) => {
  try {
    const { clinicId } = req.params;
    const list = await ipdAdmissionModel.find({ clinicId })
      .populate("patientId", "fullName mobileNumber age gender")
      .populate("doctorId", "fullName specialization")
      .populate("wardId", "name type chargePerDay")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, admissions: list });
  } catch (err: any) {
    console.error("Error fetching admissions list:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const addNursingNote = async (req: Request, res: Response) => {
  try {
    const { admissionId } = req.params;
    const { note, recordedBy } = req.body;

    const admission = await ipdAdmissionModel.findById(admissionId);
    if (!admission) return res.status(404).json({ success: false, message: "Admission log not found" });

    admission.nursingNotes = admission.nursingNotes || [];
    admission.nursingNotes.push({
      date: new Date(),
      note,
      recordedBy,
    });

    await admission.save();

    return res.status(200).json({ success: true, message: "Nursing note logged", notes: admission.nursingNotes });
  } catch (err: any) {
    console.error("Error adding nursing note:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const addVitalsRecord = async (req: Request, res: Response) => {
  try {
    const { admissionId } = req.params;
    const { bp, temp, heartRate, spo2, recordedBy } = req.body;

    const admission = await ipdAdmissionModel.findById(admissionId);
    if (!admission) return res.status(404).json({ success: false, message: "Admission log not found" });

    admission.vitals = admission.vitals || [];
    admission.vitals.push({
      date: new Date(),
      bp,
      temp: Number(temp),
      heartRate: Number(heartRate),
      spo2: Number(spo2),
      recordedBy,
    });

    await admission.save();

    return res.status(200).json({ success: true, message: "Vitals log saved", vitals: admission.vitals });
  } catch (err: any) {
    console.error("Error recording vitals:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const addMARRecord = async (req: Request, res: Response) => {
  try {
    const { admissionId } = req.params;
    const { medicineName, dosage, status, administeredBy } = req.body;

    const admission = await ipdAdmissionModel.findById(admissionId);
    if (!admission) return res.status(404).json({ success: false, message: "Admission log not found" });

    admission.mar = admission.mar || [];
    admission.mar.push({
      date: new Date(),
      medicineName,
      dosage,
      status,
      administeredBy,
    });

    await admission.save();

    return res.status(200).json({ success: true, message: "Medication administration logged", mar: admission.mar });
  } catch (err: any) {
    console.error("Error recording MAR log:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const dischargePatient = async (req: Request, res: Response) => {
  try {
    const { admissionId } = req.params;
    const { conditionAtDischarge, advice, followUpDate } = req.body;

    const admission = await ipdAdmissionModel.findById(admissionId);
    if (!admission) return res.status(404).json({ success: false, message: "Admission record not found" });

    if (admission.status === "Discharged") {
      return res.status(400).json({ success: false, message: "Patient has already been discharged" });
    }

    // Set status to Discharged, clear occupancy on bed
    admission.status = "Discharged";
    admission.dischargeDate = new Date();
    admission.dischargeSummary = {
      date: new Date(),
      conditionAtDischarge,
      advice,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
    };

    await admission.save();

    // Release bed in ward model (switch to Cleaning state so ward is prepared)
    const ward = await wardModel.findById(admission.wardId);
    if (ward) {
      const bed = ward.beds.find(b => b.bedNumber === admission.bedNumber);
      if (bed) {
        bed.status = "Cleaning";
        bed.currentAdmissionId = undefined;
        await ward.save();
      }
    }

    // Simulated SMS Alert for Discharge
    try {
      await admission.populate("patientId");
      const p = admission.patientId as any;
      if (p) {
        sendSimulatedAlert({
          clinicId: admission.clinicId,
          patientId: p._id,
          type: "Discharge",
          recipientPhone: String(p.mobileNumber),
          message: `Dear ${p.fullName}, you have been discharged from bed ${admission.bedNumber}. Condition: ${conditionAtDischarge}. Advice: ${advice}. Follow-up: ${followUpDate || "as advised"}. Thank you!`,
        }).catch(err => console.error("Simulated alert error:", err));
      }
    } catch (popErr) {
      console.error("Discharge population error:", popErr);
    }

    return res.status(200).json({ success: true, message: "Patient discharged successfully", admission });

  } catch (err: any) {
    console.error("Error discharging patient:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to discharge patient" });
  }
};
