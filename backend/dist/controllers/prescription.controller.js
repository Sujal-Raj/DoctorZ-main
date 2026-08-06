import puppeteer from "puppeteer";
import PrescriptionModel from "../models/prescription.model.js";
import BookingModel from "../models/booking.model.js";
import offlineBooking from "../models/OfflineBookingModel.js";
import cloudinary from "../config/cloudinary.js";
import axios from "axios";
import EMRModel from "../models/emr.model.js";
import { logAudit } from "../utils/audit.util.js";
import { transporter } from "../utils/email.js";
export const addPrescription = async (req, res) => {
    try {
        console.log(req.body);
        const { bookingId } = req.params;
        const { patientAadhar, doctorId, diagnosis, symptoms, medicines, recommendedTests, notes, name, gender, mobileNumber, treatmentPlan, followUp, language = "en" } = req.body;
        console.log(name, mobileNumber);
        if (!doctorId || !diagnosis || !medicines) {
            return res.status(400).json({
                message: "doctorId, diagnosis & medicines are required",
            });
        }
        const prescription = await PrescriptionModel.create({
            doctorId,
            name,
            mobileNumber,
            bookingId,
            diagnosis,
            symptoms: symptoms || [],
            medicines,
            recommendedTests: recommendedTests || [],
            notes: notes || "",
            treatmentPlan: treatmentPlan || "",
            followUp: followUp || "",
            language
        });
        const labels = language === "hi" ? {
            title: "पर्ची (Prescription)",
            patientDetails: "मरीज का विवरण",
            name: "नाम",
            gender: "लिंग",
            aadhar: "आधार / पहचान पत्र",
            diagnosis: "निदान (Diagnosis)",
            symptoms: "लक्षण (Symptoms)",
            medicines: "दवाइयाँ (Medicines)",
            medName: "दवा का नाम",
            dosage: "खुराक (Dosage)",
            quantity: "मात्रा (Qty)",
            tests: "अनुशंसित परीक्षण (Recommended Tests)",
            treatmentPlan: "उपचार योजना (Treatment Plan)",
            followUp: "अगली मुलाक़ात / निर्देश (Follow-up)",
            notes: "टिप्पणी (Notes)",
            none: "कोई नहीं"
        } : {
            title: "Prescription",
            patientDetails: "Patient Details",
            name: "Name",
            gender: "Gender",
            aadhar: "Aadhar / Patient ID",
            diagnosis: "Diagnosis",
            symptoms: "Symptoms",
            medicines: "Medicines",
            medName: "Medicine Name",
            dosage: "Dosage",
            quantity: "Quantity",
            tests: "Recommended Tests",
            treatmentPlan: "Treatment Plan",
            followUp: "Follow-up Instructions",
            notes: "Notes",
            none: "None"
        };
        const htmlContent = `
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; color: #333; line-height: 1.5; }
          h1 { color: #0c213e; border-bottom: 2px solid #0c213e; padding-bottom: 10px; margin-top: 0; }
          .section { margin-bottom: 25px; }
          .section h3 { color: #0c213e; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; font-size: 16px; }
          .details-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 10px; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
          .details-grid p { margin: 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          table, th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          th { background-color: #f1f5f9; color: #0c213e; font-weight: bold; font-size: 13px; }
          td { font-size: 14px; }
          ul { margin: 0; padding-left: 20px; }
          li { font-size: 14px; margin-bottom: 4px; }
          p { font-size: 14px; }
        </style>
      </head>
      <body>
        <h1>${labels.title}</h1>

        <div class="details-grid">
          <p><strong>${labels.name}:</strong> ${name || "-"}</p>
          <p><strong>${labels.gender}:</strong> ${gender || "-"}</p>
          <p><strong>${labels.aadhar}:</strong> ${patientAadhar || "-"}</p>
        </div>

        <div class="section">
          <h3>${labels.diagnosis}</h3>
          <p>${diagnosis}</p>
        </div>

        ${symptoms && symptoms.length > 0 ? `
        <div class="section">
          <h3>${labels.symptoms}</h3>
          <ul>
            ${symptoms.map((s) => `<li>${s}</li>`).join("")}
          </ul>
        </div>` : ""}

        <div class="section">
          <h3>${labels.medicines}</h3>
          <table>
            <tr>
              <th>${labels.medName}</th>
              <th>${labels.dosage}</th>
              <th>${labels.quantity}</th>
            </tr>
            ${(medicines || [])
            .map((m) => `
              <tr>
                <td><strong>${m.name || "-"}</strong></td>
                <td>${m.dosage || "-"}</td>
                <td>${m.quantity || "-"}</td>
              </tr>
            `)
            .join("")}
          </table>
        </div>

        ${recommendedTests && recommendedTests.length > 0 ? `
        <div class="section">
          <h3>${labels.tests}</h3>
          <ul>
            ${recommendedTests.map((t) => `<li>${t}</li>`).join("")}
          </ul>
        </div>` : ""}

        ${treatmentPlan ? `
        <div class="section">
          <h3>${labels.treatmentPlan}</h3>
          <p>${treatmentPlan}</p>
        </div>` : ""}

        ${followUp ? `
        <div class="section">
          <h3>${labels.followUp}</h3>
          <p>${followUp}</p>
        </div>` : ""}

        ${notes ? `
        <div class="section">
          <h3>${labels.notes}</h3>
          <p>${notes}</p>
        </div>` : ""}
      </body>
      </html>
    `;
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 794, height: 1123 });
        await page.setContent(htmlContent, {
            waitUntil: "domcontentloaded",
            timeout: 0,
        });
        const imageBuffer = await page.screenshot({ fullPage: true });
        // const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
        await browser.close();
        const cloudResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
                resource_type: "image",
                folder: "prescriptions",
                format: "png",
                public_id: `prescription_${prescription._id}`,
            }, (error, result) => {
                if (error) {
                    console.log("Cloudinary Upload Error:", error);
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
            uploadStream.end(imageBuffer);
        });
        prescription.pdfUrl = cloudResult.secure_url;
        console.log("Cloudinary Response:", cloudResult);
        await prescription.save();
        // let emr = await EMRModel.findOne({
        //   doctorId,
        //   aadhar: patientAadhar,
        // });
        // if (!emr) {
        //   emr = await EMRModel.create({
        //     doctorId,
        //     aadhar: patientAadhar,
        //     prescriptionId: [],
        //   });
        // }
        let emr = await EMRModel.findOne({
            doctorId,
            name,
            mobileNumber,
        });
        if (!emr) {
            emr = await EMRModel.create({
                doctorId,
                name,
                mobileNumber,
                prescriptionId: [],
            });
        }
        if (!emr.prescriptionId) {
            emr.prescriptionId = [];
        }
        emr.prescriptionId.push(prescription._id);
        await emr.save();
        await logAudit({
            req,
            module: "Doctor",
            action: "Prescription Generated",
            details: `Prescription generated for patient ${name || mobileNumber}`,
            recordId: prescription._id,
            newValue: {
                "Patient Name": name || "Unknown",
                "Mobile": mobileNumber || "Unknown",
                "Diagnosis": diagnosis,
                "Medicines Prescribed": medicines?.length || 0,
                "Recommended Tests": recommendedTests?.join(", ") || "None"
            },
        });
        return res.status(201).json({
            message: "Prescription saved with image",
            data: prescription,
            emr,
        });
    }
    catch (err) {
        console.error("Prescription Error:", err);
        return res.status(500).json({
            message: "Something went wrong",
            error: err instanceof Error ? err.message : err,
        });
    }
};
export const downloadPrescription = async (req, res) => {
    try {
        const { id } = req.params;
        const prescription = await PrescriptionModel.findById(id);
        const fileUrl = prescription?.pdfUrl;
        if (!fileUrl)
            return res.status(404).send("Image not found");
        const ext = fileUrl.split(".").pop()?.toLowerCase() || "png";
        const response = await axios.get(fileUrl, {
            responseType: "arraybuffer",
        });
        res.setHeader("Content-Disposition", `attachment; filename="prescription_${id}.${ext}"`);
        res.setHeader("Content-Type", "application/octet-stream");
        return res.send(response.data);
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Error downloading image");
    }
};
;
export const getPrescriptionsForUser = async (req, res) => {
    try {
        const { patientAadhar, doctorId, name, mobileNumber } = req.query;
        const query = {};
        if (patientAadhar)
            query.patientAadhar = patientAadhar;
        if (doctorId)
            query.doctorId = doctorId;
        if (name)
            query.name = name;
        if (mobileNumber)
            query.mobileNumber = mobileNumber;
        if (Object.keys(query).length === 0) {
            return res.status(400).json({
                message: "Provide at least one query param: patientAadhar, doctorId, name, or mobileNumber",
            });
        }
        const prescriptions = await PrescriptionModel.find(query)
            .populate({
            path: "doctorId",
            select: "fullName specialization ",
        })
            .sort({ _id: -1 });
        return res.status(200).json({
            count: prescriptions.length,
            prescriptions,
        });
    }
    catch (err) {
        console.error("getPrescriptionsForUser error:", err);
        return res.status(500).json({
            message: "Something went wrong",
            error: err instanceof Error ? err.message : err,
        });
    }
};
export const getConsultationDetails = async (req, res) => {
    try {
        const { bookingId } = req.params;
        // 1. Try to find in online bookings
        let booking = await BookingModel.findById(bookingId).populate("userId").lean();
        let isOffline = false;
        if (!booking) {
            // 2. Try to find in offline bookings
            booking = await offlineBooking.findById(bookingId).populate("userId").lean();
            isOffline = true;
        }
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        // 3. Extract patient details
        let patientInfo = {};
        if (isOffline) {
            const user = booking.userId;
            patientInfo = {
                name: user?.fullName || booking.patient?.name || "Walk-in Patient",
                gender: user?.gender || booking.patient?.gender || "Unknown",
                mobileNumber: user?.mobileNumber || booking.patient?.contact || "",
                aadhar: user?.aadhar || booking.patient?.aadhar || "",
                age: user?.dob ? new Date().getFullYear() - new Date(user.dob).getFullYear() : (booking.patient?.age || ""),
                dob: user?.dob || null,
                patientId: user?._id || null,
            };
        }
        else {
            const user = booking.userId;
            patientInfo = {
                name: booking.patient?.name || user?.fullName || "Online Patient",
                gender: booking.patient?.gender || user?.gender || "Unknown",
                mobileNumber: booking.patient?.contact || user?.mobileNumber || "",
                aadhar: booking.patient?.aadhar || user?.aadhar || "",
                age: booking.patient?.age || (user?.dob ? new Date().getFullYear() - new Date(user.dob).getFullYear() : ""),
                dob: user?.dob || null,
                patientId: user?._id || null,
            };
        }
        // 4. Fetch EMR profile (Allergies, chronic conditions, etc.)
        let emrProfile = await EMRModel.findOne({
            $or: [
                ...(patientInfo.patientId ? [{ patientId: patientInfo.patientId }] : []),
                ...(patientInfo.aadhar ? [{ aadhar: Number(patientInfo.aadhar) }] : []),
                { mobileNumber: patientInfo.mobileNumber }
            ]
        }).lean();
        // 5. Fetch all historical prescriptions for this patient
        const pastPrescriptions = await PrescriptionModel.find({
            $or: [
                ...(patientInfo.aadhar ? [{ patientAadhar: patientInfo.aadhar }] : []),
                { mobileNumber: patientInfo.mobileNumber },
                { name: patientInfo.name }
            ]
        })
            .populate("doctorId", "fullName specialization")
            .sort({ _id: -1 })
            .lean();
        return res.status(200).json({
            success: true,
            patientInfo,
            emrProfile: emrProfile || { allergies: [], diseases: [], pastSurgeries: [], currentMedications: [] },
            pastPrescriptions: pastPrescriptions || [],
            clinicId: booking?.clinicId || null,
            doctorId: booking?.doctorId || null
        });
    }
    catch (err) {
        console.error("Error fetching consultation details:", err);
        return res.status(500).json({ message: "Internal server error", error: err instanceof Error ? err.message : err });
    }
};
export const sendPrescriptionEmail = async (req, res) => {
    try {
        const { prescriptionId, email } = req.body;
        if (!prescriptionId || !email) {
            return res.status(400).json({ message: "prescriptionId and email are required" });
        }
        const prescription = await PrescriptionModel.findById(prescriptionId).populate("doctorId", "fullName");
        if (!prescription) {
            return res.status(404).json({ message: "Prescription not found" });
        }
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: `Prescription from Dr. ${prescription.doctorId?.fullName || "Doctor"}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #0c213e;">Prescription Details</h2>
          <p>Dear Patient,</p>
          <p>Your doctor has generated a digital prescription for you on the DoctorZ platform.</p>
          <p>You can view, print, or download your prescription image/document directly using the link below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${prescription.pdfUrl}" target="_blank" style="background-color: #0c213e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Prescription</a>
          </div>
          <p>If the button above does not work, copy and paste this URL into your browser:</p>
          <p><a href="${prescription.pdfUrl}" target="_blank">${prescription.pdfUrl}</a></p>
          <br/>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #777; text-align: center;">This is an automated email from the DoctorZ Platform. Please do not reply directly to this message.</p>
        </div>
      `,
        };
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, message: "Email sent successfully" });
    }
    catch (err) {
        console.error("Error sending prescription email:", err);
        return res.status(500).json({ message: "Failed to send email", error: err instanceof Error ? err.message : err });
    }
};
