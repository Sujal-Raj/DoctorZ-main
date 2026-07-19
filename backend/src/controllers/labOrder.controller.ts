import { Request, Response } from "express";
import { LabTestBookingModel, LabModel } from "../models/lab.model.js";
import { generateLabReportPDF } from "../utils/pdfGenerator.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { logAudit } from "../utils/audit.util.js";
import patientModel from "../models/patient.model.js";
import doctorModel from "../models/doctor.model.js";

// Fetch Lab Orders
export const getLabOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let query: any = {};

    if (user.role === "lab") {
      query = { labId: user.id };
    } else if (user.role === "doctor") {
      query = { referredByDoctorId: user.id };
    } else {
      query = { referredByHospitalId: user.clinicId || user.id };
    }

    const orders = await LabTestBookingModel.find(query)
      .populate("userId", "fullName MobileNo gender age dob")
      .populate("referredByDoctorId", "fullName specialization")
      .populate("labId", "name certificateNumber")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    console.error("Get Lab Orders Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update Lab Order Status
export const updateLabOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, testResults, comments } = req.body;
    const user = (req as any).user;

    const order = await LabTestBookingModel.findById(id)
      .populate("userId")
      .populate("labId")
      .populate("referredByDoctorId");

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const previousValue = order.toObject();

    order.status = status;
    if (status === "Delivered") {
      order.actualDelivery = new Date();
    }
    
    if (testResults) order.testResults = testResults;

    // If status is Approved, generate PDF
    if (status === "Approved" && testResults) {
      const patient: any = order.userId;
      const lab: any = order.labId;
      const doctor: any = order.referredByDoctorId;

      const pdfBuffer = await generateLabReportPDF({
        labName: lab.name,
        labCertificate: lab.certificateNumber,
        patientName: patient.fullName,
        patientAge: patient.dob ? (new Date().getFullYear() - new Date(patient.dob).getFullYear()).toString() : "N/A",
        patientGender: patient.gender,
        doctorName: doctor ? doctor.fullName : undefined,
        testName: order.testName,
        results: testResults,
        comments,
        verificationId: order.id,
        date: new Date()
      });

      const url = await uploadToCloudinary(pdfBuffer, "lab_reports", "image");
      order.reportUrl = url;
    }

    await order.save();

    await logAudit({
      req,
      module: "LabOrder",
      action: "Lab Order Status Updated",
      details: `Order ${order.id} status changed to ${status}`,
      recordId: order.id,
      previousValue: {
        "Test Name": order.testName,
        "Status": previousValue.status
      },
      newValue: {
        "Test Name": order.testName,
        "Status": order.status,
        "Report Generated": !!order.reportUrl
      },
    });

    return res.status(200).json({ success: true, order });
  } catch (error: any) {
    console.error("Update Lab Order Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Public route to verify a generated lab report via QR code
export const verifyPublicReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await LabTestBookingModel.findById(id)
      .populate("userId", "fullName")
      .populate("labId", "name certificateNumber")
      .populate("referredByDoctorId", "fullName");

    if (!order) {
      return res.status(404).json({ success: false, message: "Report not found or invalid QR code." });
    }

    if (order.status !== "Approved" && order.status !== "Delivered") {
      return res.status(400).json({ success: false, message: "Report is not yet approved by the lab." });
    }

    // Return only non-sensitive / explicitly public fields needed for verification
    const publicData = {
      testName: order.testName,
      patientName: (order.userId as any)?.fullName,
      labName: (order.labId as any)?.name,
      labCertificate: (order.labId as any)?.certificateNumber,
      referredBy: (order.referredByDoctorId as any)?.fullName || "Self",
      dateGenerated: (order as any).updatedAt,
      reportUrl: order.reportUrl,
      status: order.status
    };

    return res.status(200).json({ success: true, report: publicData });
  } catch (error: any) {
    console.error("Verify Public Report Error:", error);
    return res.status(500).json({ success: false, message: "Server error during verification" });
  }
};
