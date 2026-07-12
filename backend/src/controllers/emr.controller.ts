import mongoose from "mongoose";
import EMRModel from "../models/emr.model.js";
import patientModel from "../models/patient.model.js";
import type { Request, Response } from "express";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

export const createEMR = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    console.log(req.files);

    const files = req.files as Express.Multer.File[];

    console.log("📩 Received EMR body:", body);

    const { patientId, doctorId } = body;

    const patient = await patientModel.findById(patientId);
    if (!patient) {
      return res.status(400).json({ message: "Patient not found" });
    }

    const safeParse = (value: any): string[] => {
      try {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        return JSON.parse(value);
      } catch {
        return [];
      }
    };

    const allergies = safeParse(body.allergies);
    const diseases = safeParse(body.diseases);
    const pastSurgeries = safeParse(body.pastSurgeries);
    const currentMedications = safeParse(body.currentMedications);

    // ✅ Upload reports to Cloudinary
    let reportUrls: string[] = [];

    if (files && files.length > 0) {
      reportUrls = await Promise.all(
        files.map((file) =>
          uploadToCloudinary(
            file.buffer,
            "emr/reports",
            file.mimetype === "application/pdf" ? "raw" : "image"
          )
        )
      );
    }

    const emr = await EMRModel.create({
      aadhar: body.aadhar ? Number(body.aadhar) : undefined,
      doctorId,
      patientId,
      allergies,
      diseases,
      pastSurgeries,
      currentMedications,
      reports: reportUrls,
    });

    return res.status(201).json({
      message: "EMR created successfully",
      emr,
    });
  } catch (error) {
    console.log("Create EMR Error:", error);
    return res.status(500).json({ message: "Error creating EMR" });
  }
};




// export const getEMRByPatientId = async (req: Request, res: Response) => {
//   try {
//     const { patientId } = req.params;

//     if (!patientId) {
//       return res.status(400).json({ message: "Patient ID is required" });
//     }

//     const emrs = await EMRModel.find({ patientId }).sort({ createdAt: -1 });

//     if (!emrs || emrs.length === 0) {
//       return res.status(404).json({ message: "No EMR records found" });
//     }

//     return res.status(200).json({
//       message: "EMR records fetched successfully",
//       data: emrs,
//     });
//   } catch (error) {
//     console.log("Error fetching EMR:", error);
//     return res.status(500).json({ message: "Error fetching EMR data" });
//   }
// };





// // ✅ Get EMR by emrId
// export const getEMRById = async (req: Request, res: Response) => {
//   try {
//     const { emrId } = req.params;
//     if (!emrId) {
//       return res.status(400).json({ message: "EMR ID is required" });
//     }

//     const emr = await EMRModel.findById(emrId);
//     if (!emr) {
//       return res.status(404).json({ message: "EMR not found" });
//     }

//     return res.status(200).json({
//       message: "EMR fetched successfully",
//       data: emr,
//     });
//   } catch (error) {
//     console.error("Error fetching EMR by ID:", error);
//     return res.status(500).json({ message: "Error fetching EMR" });
//   }
// };


export const getEMRByAadhar = async (req: Request, res: Response) => {
  try {
    const { aadhar } = req.params;

    if (!aadhar) {
      return res.status(400).json({ message: "Aadhar or Patient ID is required" });
    }

    const query: any = {};
    if (mongoose.Types.ObjectId.isValid(aadhar)) {
      query.patientId = aadhar;
    } else {
      query.aadhar = Number(aadhar);
    }

    // find all EMRs that match this query
    const emrRecords = await EMRModel.find(query).sort({ createdAt: -1 });

    if (!emrRecords || emrRecords.length === 0) {
      return res.status(404).json({ message: "No EMR found for this identifier" });
    }

    return res.status(200).json({
      message: "EMR records fetched successfully",
      emr: emrRecords,
    });
  } catch (error) {
    console.error("Error fetching EMR:", error);
    return res.status(500).json({ message: "Error fetching EMR data" });
  }
};


export const getEMRByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({
        message: "Patient name is required",
      });
    }

    const emrRecords = await EMRModel.find({
      fullName: { $regex: name, $options: "i" }, // case-insensitive search
    }).sort({ createdAt: -1 });

    if (!emrRecords || emrRecords.length === 0) {
      return res.status(404).json({
        message: "No EMR found for this name",
      });
    }

    return res.status(200).json({
      message: "EMR records fetched successfully",
      emr: emrRecords,
    });
  } catch (error) {
    console.error("Error fetching EMR:", error);
    return res.status(500).json({
      message: "Error fetching EMR data",
    });
  }
};
