import { Request, Response } from "express";
import referralModel from "../models/referral.model.js";
import { logAudit } from "../utils/audit.util.js";
import { v4 as uuidv4 } from "uuid";
import clinicModel from "../models/clinic.model.js";
import { LabModel } from "../models/lab.model.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

// Create a new referral
export const createReferral = async (req: Request, res: Response) => {
  try {
    const {
      type,
      patientId,
      referredToHospitalId,
      referredToDoctorId,
      referredToLabId,
      reason,
      notes,
      priority,
      attachments
    } = req.body;

    const user = (req as any).user; // extracted from auth middleware

    const referralData: any = {
      referralId: `REF-${uuidv4().substring(0, 8).toUpperCase()}`,
      type,
      patientId,
      reason,
      notes,
      priority,
      attachments: attachments || []
    };

    if (user.role === "doctor") {
      referralData.referredByDoctorId = user.id;
    } else {
      referralData.referredByHospitalId = user.clinicId || user.id;
    }

    const isObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

    if (referredToHospitalId) {
      if (isObjectId(referredToHospitalId)) {
        referralData.referredToHospitalId = referredToHospitalId;
      } else {
        const foundClinic = await clinicModel.findOne({ clinicName: { $regex: new RegExp(`^${referredToHospitalId}$`, "i") } });
        if (foundClinic) referralData.referredToHospitalId = foundClinic._id;
        else referralData.externalHospitalName = referredToHospitalId;
      }
    }
    
    if (referredToDoctorId) referralData.referredToDoctorId = referredToDoctorId;
    
    if (referredToLabId) {
      if (isObjectId(referredToLabId)) {
        referralData.referredToLabId = referredToLabId;
      } else {
        const foundLab = await LabModel.findOne({ 
          $or: [
            { name: { $regex: new RegExp(`^${referredToLabId}$`, "i") } },
            { labId: { $regex: new RegExp(`^${referredToLabId}$`, "i") } }
          ]
        });
        if (foundLab) referralData.referredToLabId = foundLab._id;
        else referralData.externalLabName = referredToLabId;
      }
    }

    const newReferral = await referralModel.create(referralData);

    await logAudit({
      req,
      module: "Referral",
      action: "Referral Created",
      details: `Referral ${newReferral.referralId} created for patient ${patientId}`,
      recordId: newReferral.id,
      newValue: {
        "Referral ID": newReferral.referralId,
        "Type": newReferral.type,
        "Reason": newReferral.reason,
        "Status": newReferral.status
      },
    });

    // TODO: Trigger Email Notifications to receiving party

    return res.status(201).json({ success: true, referral: newReferral });
  } catch (error: any) {
    console.error("Create Referral Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get referrals based on user context
export const getReferrals = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let query: any = {};

    if (user.role === "doctor") {
      query = { $or: [{ referredByDoctorId: user.id }, { referredToDoctorId: user.id }] };
    } else if (user.role === "lab") {
      query = { referredToLabId: user.id };
    } else {
      // Clinic/Hospital context
      query = { $or: [{ referredByHospitalId: user.clinicId || user.id }, { referredToHospitalId: user.clinicId || user.id }] };
    }

    const referrals = await referralModel.find(query)
      .populate("patientId", "fullName MobileNo gender")
      .populate("referredByDoctorId", "fullName specialization")
      .populate("referredToDoctorId", "fullName specialization")
      .populate("referredToHospitalId", "clinicName")
      .populate("referredToLabId", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: referrals.length, referrals });
  } catch (error: any) {
    console.error("Get Referrals Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update referral status
export const updateReferralStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const referral = await referralModel.findById(id);
    if (!referral) return res.status(404).json({ success: false, message: "Referral not found" });

    const previousValue = referral.toObject();
    referral.status = status;
    await referral.save();

    await logAudit({
      req,
      module: "Referral",
      action: "Referral Status Updated",
      details: `Referral ${referral.referralId} status changed from ${previousValue.status} to ${status}`,
      recordId: referral.id,
      previousValue: {
        "Referral ID": referral.referralId,
        "Status": previousValue.status
      },
      newValue: {
        "Referral ID": referral.referralId,
        "Status": referral.status
      },
    });

    // TODO: Trigger Email Notifications to sending party

    return res.status(200).json({ success: true, referral });
  } catch (error: any) {
    console.error("Update Referral Status Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add a message to the discussion thread
export const addReferralMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const user = (req as any).user;

    const referral = await referralModel.findById(id);
    if (!referral) return res.status(404).json({ success: false, message: "Referral not found" });

    referral.thread.push({
      senderId: user.id,
      senderName: user.name || user.fullName || user.clinicName || "Staff",
      message,
      createdAt: new Date(),
    });

    await referral.save();

    return res.status(200).json({ success: true, message: "Message added", referral });
  } catch (error: any) {
    console.error("Add Referral Message Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const searchTargets = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== "string") {
      return res.status(200).json({ success: true, results: [] });
    }

    const regex = new RegExp(query, "i");

    // Search Clinics
    const clinics = await clinicModel.find({
      clinicName: regex
    }).limit(10).select("_id clinicName district state");

    // Search Labs
    const labs = await LabModel.find({
      $or: [
        { name: regex },
        { labId: regex }
      ]
    }).limit(10).select("_id name labId city state");

    const results = [
      ...clinics.map(c => ({
        _id: c._id,
        name: c.clinicName,
        customId: "N/A", // clinic doesn't have a custom ID like labId
        type: "HOSPITAL",
        location: `${c.district}, ${c.state}`
      })),
      ...labs.map(l => ({
        _id: l._id,
        name: l.name,
        customId: l.labId,
        type: "LAB",
        location: `${l.city}, ${l.state}`
      }))
    ];

    return res.status(200).json({ success: true, results });
  } catch (error: any) {
    console.error("Search Targets Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const uploadReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const file = req.file;

    const referral = await referralModel.findById(id);
    if (!referral) return res.status(404).json({ success: false, message: "Referral not found" });

    let attachmentUrl = "";
    if (file) {
      attachmentUrl = await uploadToCloudinary(
        file.buffer,
        "referral_reports",
        file.mimetype === "application/pdf" ? "raw" : "image"
      );
    }

    if (attachmentUrl) {
      referral.attachments.push({
        url: attachmentUrl,
        name: file?.originalname || "Lab Report",
        type: "Report"
      });
    }

    if (message) {
      referral.thread.push({
        senderId: (req as any).user.id,
        senderName: (req as any).user.role === "doctor" ? "Doctor" : (req as any).user.role === "lab" ? "Lab" : "Hospital",
        message,
        createdAt: new Date()
      });
    }

    // Automatically mark as completed if report is uploaded
    const previousValue = referral.toObject();
    referral.status = "Completed";
    
    await referral.save();

    await logAudit({
      req,
      module: "Referral",
      action: "Referral Report Uploaded",
      details: `Report uploaded and status changed to Completed for Referral ${referral.referralId}`,
      recordId: referral.id,
      previousValue: {
        "Referral ID": referral.referralId,
        "Status": previousValue.status,
        "Attachments": previousValue.attachments?.length || 0
      },
      newValue: {
        "Referral ID": referral.referralId,
        "Status": referral.status,
        "Attachments": referral.attachments?.length || 0
      },
    });

    return res.status(200).json({ success: true, message: "Report uploaded successfully", referral });
  } catch (error: any) {
    console.error("Upload Report Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
