import bcrypt from "bcryptjs";
import { transporter } from "../utils/email.js";
import doctorModel from "../models/doctor.model.js";
import Booking from "../models/booking.model.js";
import jwt from "jsonwebtoken";
import clinicModel from "../models/clinic.model.js";
import patientModel from "../models/patient.model.js";
import mongoose from "mongoose";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import MasterMedicineModel from "../models/masterMedicine.model.js";
import KitModel from "../models/kit.model.js";
// const doctorRegister = async (req: Request, res: Response) => {
//   try {
//     console.log("Text fields:", req.body);
//     console.log("Files:", req.files);
//     const files = req.files as MulterFiles | undefined;
//     const experience = Number(req.body.experience);
//     const consultationFee = Number(req.body.fees);
//     const Aadhar = Number(req.body.aadhar);
//     const Address = req.body.address;
//     const State = req.body.state;
//     const City = req.body.city;
//     const dob = new Date(req.body.dob);
//     const MobileNo = req.body.mobileNo;
//     const email = req.body.email;
//     const degreeCert = files?.["degreeCert"]?.[0]?.filename || "";
//     const photo = files?.["photo"]?.[0]?.filename || "";
//     const signature = files?.["signature"]?.[0]?.filename || "";
//     if (!req.body.password) {
//       return res.status(400).json({ message: "Password is required" });
//     }
//     const hashedPassword = await bcrypt.hash(req.body.password, 10);
//     const clinicId = req.body.clinicId;
//     const doctor = new doctorModel({
//       fullName: req.body.fullName,
//       password: hashedPassword,
//       gender: req.body.gender,
//       dob,
//       MobileNo,
//       MedicalRegistrationNumber: req.body.regNumber,
//       specialization: req.body.specialization || "",
//       qualification: req.body.qualification,
//       experience,
//       consultationFee,
//       language: req.body.languages || "",
//       Aadhar,
//       Address,
//       State,
//       City,
//       DegreeCertificate: degreeCert,
//       photo,
//       signature,
//       email,
//       clinic: clinicId,
//       status: "pending",
//     });
//     if (clinicId) {
//       await clinicModel.findByIdAndUpdate(clinicId, {
//         $push: { doctors: doctor._id },
//       });
//     }
//     await doctor.save();
//     return res.status(201).json({ message: "Doctor registered", doctor });
//   } catch (error) {
//     console.error("Registration error:", error);
//     return res.status(500).json({ message: "Registration failed", error });
//   }
// };
const doctorRegister = async (req, res) => {
    try {
        console.log("Incoming request: POST /api/doctor/register");
        console.log("BODY:", req.body);
        console.log("FILES:", req.files);
        const files = req.files;
        // ---------- FILE VALIDATION ----------
        if (!files?.degreeCert?.[0]) {
            return res.status(400).json({ message: "Degree certificate is required" });
        }
        if (!files?.photo?.[0]) {
            return res.status(400).json({ message: "Photo is required" });
        }
        if (!files?.signature?.[0]) {
            return res.status(400).json({ message: "Signature is required" });
        }
        // ---------- UPLOAD TO CLOUDINARY ----------
        let degreeCertUrl = "";
        let photoUrl = "";
        let signatureUrl = "";
        try {
            degreeCertUrl = await uploadToCloudinary(files.degreeCert[0].buffer, "doctors/degree", files.degreeCert[0].mimetype === "application/pdf" ? "raw" : "image");
            photoUrl = await uploadToCloudinary(files.photo[0].buffer, "doctors/photos");
            signatureUrl = await uploadToCloudinary(files.signature[0].buffer, "doctors/signatures");
        }
        catch (uploadError) {
            console.error("Cloudinary upload error:", uploadError);
            return res.status(400).json({ message: "File upload failed" });
        }
        // ---------- PROCESS BOOLEAN ----------
        const availableOnline = req.body.availableOnline === "true";
        // ---------- HASH PASSWORD ----------
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        // ---------- PROCESS ACHIEVEMENTS ----------
        let parsedTitles = [];
        if (req.body.achievementTitles) {
            try {
                parsedTitles = JSON.parse(req.body.achievementTitles);
            }
            catch {
                parsedTitles = Array.isArray(req.body.achievementTitles)
                    ? req.body.achievementTitles
                    : [req.body.achievementTitles];
            }
        }
        const achievementFiles = files?.achievementFiles || [];
        const achievements = [];
        if (Array.isArray(parsedTitles)) {
            for (let i = 0; i < parsedTitles.length; i++) {
                let certUrl = "";
                const file = achievementFiles[i];
                if (file) {
                    try {
                        certUrl = await uploadToCloudinary(file.buffer, "doctors/achievements", file.mimetype === "application/pdf" ? "raw" : "image");
                    }
                    catch (uploadError) {
                        console.error("Cloudinary upload error for achievement:", uploadError);
                    }
                }
                achievements.push({
                    title: parsedTitles[i],
                    certificate: certUrl,
                });
            }
        }
        // ---------- CREATE DOCTOR ----------
        const doctor = new doctorModel({
            fullName: req.body.fullName,
            password: hashedPassword,
            gender: req.body.gender,
            dob: new Date(req.body.dob),
            MobileNo: req.body.mobileNo,
            MedicalRegistrationNumber: req.body.regNumber,
            specialization: req.body.specialization,
            qualification: req.body.qualification,
            experience: Number(req.body.experience),
            consultationFee: Number(req.body.fees),
            language: req.body.languages,
            Aadhar: Number(req.body.aadhar),
            District: req.body.district || null,
            Pincode: req.body.pincode ? Number(req.body.pincode) : null,
            hprId: req.body.hprId || null,
            achievements: achievements,
            Address: req.body.address,
            State: req.body.state,
            City: req.body.city,
            DegreeCertificate: degreeCertUrl,
            photo: photoUrl,
            signature: signatureUrl,
            email: req.body.email,
            clinic: req.body.clinicId || null,
            availableOnline: availableOnline, // ✅ added
            status: "pending",
        });
        await doctor.save();
        // ---------- LINK DOCTOR TO CLINIC ----------
        if (req.body.clinicId) {
            await clinicModel.findByIdAndUpdate(req.body.clinicId, {
                $push: { doctors: doctor._id },
            });
        }
        return res.status(201).json({
            message: "Doctor registered successfully",
            doctor,
        });
    }
    catch (error) {
        console.error("Doctor registration error:", error);
        return res.status(500).json({ message: "Registration failed" });
    }
};
// ==========================
// Doctor Login
// ==========================
const doctorLogin = async (req, res) => {
    try {
        console.log("Login request body:", req.body);
        const { doctorId, password } = req.body;
        if (!doctorId || !password) {
            return res
                .status(400)
                .json({ message: "doctorId and password are required" });
        }
        const doctor = await doctorModel.findOne({ doctorId });
        console.log("Doctor found:", doctor);
        if (!doctor) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }
        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }
        const token = jwt.sign({
            id: doctor._id,
            doctorId: doctor.doctorId,
            email: doctor.email,
            role: "doctor",
        }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.status(200).json({
            message: "Login Successful",
            token,
            doctor: {
                _id: doctor._id,
                doctorId: doctor.doctorId,
                fullName: doctor.fullName,
                email: doctor.email,
            },
        });
    }
    catch (error) {
        console.error("Doctor login error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
// ==========================
// Get Doctor by ID
// ==========================
const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await doctorModel.findById(id).populate("clinic", "clinicName");
        if (!doctor) {
            return res.status(400).json({ message: "Doctor not found" });
        }
        return res.status(200).json({ message: "Doctor found", doctor });
    }
    catch (error) {
        console.error("Error fetching doctor:", error);
        return res.status(500).json({ message: "Failed to fetch doctor" });
    }
};
// ==========================
// Get All Approved Doctors
// ==========================
const getAllDoctors = async (req, res) => {
    try {
        // Fetch all approved doctors
        const doctors = await doctorModel.find({ status: "approved" });
        const { patientId } = req.params;
        // If user not logged in, just return doctors normally
        if (!patientId || patientId === "null" || patientId === "undefined") {
            return res
                .status(200)
                .json({ message: "Approved doctors fetched successfully", doctors });
        }
        // Get patient's favourite doctor list
        const patient = await patientModel
            .findById(patientId)
            .select("favouriteDoctors");
        const favouriteIds = new Set((patient?.favouriteDoctors || []).map((id) => id.toString()));
        // Mark each doctor as favourite: true / false
        const doctorsWithFav = doctors.map((doc) => ({
            ...doc.toObject(),
            isFavourite: favouriteIds.has(doc._id.toString()),
        }));
        // Sort favourites first
        const sortedDoctors = doctorsWithFav.sort((a, b) => a.isFavourite === b.isFavourite ? 0 : a.isFavourite ? -1 : 1);
        return res.status(200).json({
            message: "Approved doctors fetched successfully",
            doctors: sortedDoctors,
        });
    }
    catch (error) {
        console.error("Error fetching doctors:", error);
        return res.status(500).json({ message: "Failed to fetch doctors" });
    }
};
// ==========================
// Update Doctor ID and Password
// ==========================
const updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const { doctorId, password } = req.body;
        if (!doctorId || !password) {
            return res
                .status(400)
                .json({ message: "doctorId and password are required" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedDoctor = await doctorModel.findByIdAndUpdate(id, { doctorId, password: hashedPassword }, { new: true, runValidators: true });
        if (!updatedDoctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        // Send confirmation email
        if (updatedDoctor.email) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: updatedDoctor.email,
                subject: "Your Doctor Login Details Updated",
                text: `
Your login credentials have been updated successfully.

Doctor ID: ${doctorId}
Password: (hidden for security)

If you did not request this change, please contact support immediately.

Regards,
Your Hospital Admin Team
        `,
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Error sending email:", error);
                }
                else {
                    console.log("Email sent:", info.response);
                }
            });
        }
        return res.status(200).json({
            message: "Doctor ID and password updated successfully.",
            updatedDoctor,
        });
    }
    catch (error) {
        console.error("Error updating doctor:", error.message || error);
        return res.status(500).json({ message: "Failed to update doctor" });
    }
};
const updateDoctorData = async (req, res) => {
    try {
        const doctorId = req.params.id;
        const updates = { ...req.body };
        const blockedFields = [
            "notifications",
            "clinic",
            "DegreeCertificate",
            "signature",
            "doctorId",
        ];
        blockedFields.forEach((field) => delete updates[field]);
        // convert number fields
        const numberFields = ["experience", "consultationFee", "Aadhar"];
        numberFields.forEach((field) => {
            if (updates[field] !== undefined) {
                updates[field] = Number(updates[field]);
            }
        });
        if (updates.MobileNo) {
            updates.MobileNo = String(updates.MobileNo);
        }
        if (updates.dob) {
            updates.dob = new Date(updates.dob);
        }
        // ✅ FIX: Upload photo to Cloudinary
        if (req.file) {
            try {
                const photoUrl = await uploadToCloudinary(req.file.buffer, "doctors/photos");
                updates.photo = photoUrl; // Save Cloudinary URL
            }
            catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                return res.status(400).json({ message: "Photo upload failed" });
            }
        }
        const updatedDoctor = await doctorModel.findByIdAndUpdate(doctorId, { $set: updates }, { new: true });
        if (!updatedDoctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        return res.json({
            message: "Profile updated successfully",
            doctor: updatedDoctor,
        });
    }
    catch (err) {
        console.error("Update error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
const getClinicDoctors = async (req, res) => {
    try {
        const { clinicId } = req.params;
        const doctors = await doctorModel.find({
            clinic: clinicId,
            status: "approved",
        });
        return res.status(200).json({
            message: "Doctors fetched successfully",
            doctors,
        });
    }
    catch (error) {
        console.error("Error fetching doctors:", error);
        return res.status(500).json({ message: "Failed to fetch doctors" });
    }
};
// ==========================
// Get Today's Booked Appointments
// ==========================
export const getTodaysBookedAppointments = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        console.log("Fetching appointments for doctorId:", doctorId);
        const now = new Date();
        const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
        const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
        const bookedAppointments = await Booking.find({
            doctorId,
            dateTime: { $gte: startOfDay, $lte: endOfDay },
            status: "pending",
        });
        res.status(200).json(bookedAppointments);
    }
    catch (error) {
        console.error("Error fetching today's booked appointments:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export const getTotalPatients = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        const totalPatients = await Booking.countDocuments({
            doctorId,
            status: "pending",
        });
        res.status(200).json({ totalPatients });
    }
    catch (error) {
        console.error("Error fetching total patients:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedoctor = await doctorModel.findByIdAndDelete(id);
        if (!deleteDoctor) {
            return res.status(400).json({
                message: "Doctor not found",
            });
        }
        return res.status(202).json({
            message: "doctor deleted successfully",
            deleteDoctor,
        });
    }
    catch (error) {
        console.error("Error deleting doctor", error);
        return res.status(500).json({
            message: "failed to delete doctor",
        });
    }
};
export const searchDoctors = async (req, res) => {
    try {
        const { query } = req.query;
        // Empty search → return all doctors
        const filter = query
            ? {
                fullName: { $regex: query, $options: "i" },
            }
            : {};
        const doctors = await doctorModel.find(filter);
        return res.status(200).json({
            message: "Doctors fetched",
            doctors,
        });
    }
    catch (error) {
        console.error("Doctor search error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
export const getDoctorNotifications = async (req, res) => {
    try {
        const { doctorId } = req.params;
        if (!doctorId || doctorId === "null" || doctorId === "undefined" || !mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(200).json({ notifications: [] }); // return empty instead of throwing error
        }
        const doctor = await doctorModel.findById(doctorId);
        // ✅ Null check added
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        return res.json({
            notifications: doctor.notifications || [],
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching notifications" });
    }
};
export const acceptDoctorRequest = async (req, res) => {
    try {
        const { doctorId, notificationId, clinicId } = req.body;
        const doctor = await doctorModel.findById(doctorId);
        if (!doctor)
            return res.status(404).json({ message: "Doctor not found" });
        const notif = doctor.notifications.find((n) => n._id.toString() === notificationId);
        if (!notif) {
            return res.status(404).json({ message: "Notification not found" });
        }
        // ✅ Update notification
        notif.status = "accepted";
        doctor.markModified("notifications");
        // ✅ Add clinic to doctor
        doctor.clinic = doctor.clinic || [];
        if (!doctor.clinic.some(id => id.toString() === clinicId)) {
            doctor.clinic.push(clinicId);
        }
        await doctor.save();
        // ✅ IMPORTANT: Update clinic with doctor
        const clinic = await clinicModel.findById(clinicId);
        if (!clinic) {
            return res.status(404).json({ message: "Clinic not found" });
        }
        clinic.doctors = clinic.doctors || [];
        if (!clinic.doctors.some(id => id.toString() === doctorId)) {
            clinic.doctors.push(doctorId);
        }
        await clinic.save();
        res.json({ message: "Request accepted" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error accepting request" });
    }
};
export const rejectDoctorRequest = async (req, res) => {
    try {
        const { doctorId, notificationId } = req.body;
        const doctor = await doctorModel.findById(doctorId);
        if (!doctor)
            return res.status(404).json({ message: "Doctor not found" });
        const notif = doctor.notifications.find((n) => n._id.toString() === notificationId);
        if (!notif) {
            return res.status(404).json({ message: "Notification not found" });
        }
        notif.status = "rejected";
        await doctor.save();
        res.json({ message: "Request rejected" });
    }
    catch (error) {
        res.json({ message: "Error rejecting request" });
    }
};
export const addReview = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { userId, comment, rating } = req.body;
        if (!comment || !rating) {
            return res.status(400).json({ message: "Feedback is required" });
        }
        const doctor = await doctorModel.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        doctor.totalRating += rating;
        doctor.ratingCount += 1;
        doctor.feedback.push({ userId, comment, rating, createdAt: new Date() });
        await doctor.save();
        return res.status(200).json({
            message: "Feedback added successfully",
            data: doctor
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
// Controller: doctorController.ts
const addMedicineToList = async (req, res) => {
    try {
        const { doctorId, medicines } = req.body;
        if (!doctorId || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Doctor ID and medicines array are required"
            });
        }
        // Remove duplicates and empty strings
        const cleanedMedicines = [...new Set(medicines.filter(m => m.trim() !== ''))];
        const doctor = await doctorModel.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }
        // Add new medicines to existing list (avoid duplicates)
        const existingMedicines = doctor.listOfMedicine || [];
        const updatedMedicines = [...new Set([...existingMedicines, ...cleanedMedicines])];
        doctor.listOfMedicine = updatedMedicines;
        await doctor.save();
        res.status(200).json({
            success: true,
            message: "Medicines added successfully",
            listOfMedicine: doctor.listOfMedicine
        });
    }
    catch (error) {
        console.error("Error adding medicines:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add medicines"
        });
    }
};
const getMedicineList = async (req, res) => {
    try {
        const { doctorId } = req.params;
        if (!doctorId) {
            return res.status(400).json({
                success: false,
                message: "Doctor ID is required"
            });
        }
        const doctor = await doctorModel.findById(doctorId).select('listOfMedicine');
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }
        res.status(200).json({
            success: true,
            listOfMedicine: doctor.listOfMedicine || []
        });
    }
    catch (error) {
        console.error("Error fetching medicines:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch medicines"
        });
    }
};
const deleteMedicineFromList = async (req, res) => {
    try {
        const { doctorId, medicineName } = req.body;
        if (!doctorId || !medicineName) {
            return res.status(400).json({
                success: false,
                message: "Doctor ID and medicine name are required"
            });
        }
        const doctor = await doctorModel.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }
        doctor.listOfMedicine = (doctor.listOfMedicine || []).filter(m => m !== medicineName);
        await doctor.save();
        res.status(200).json({
            success: true,
            message: "Medicine deleted successfully",
            listOfMedicine: doctor.listOfMedicine
        });
    }
    catch (error) {
        console.error("Error deleting medicine:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete medicine"
        });
    }
};
const searchMasterMedicines = async (req, res) => {
    try {
        const q = req.query.q ? String(req.query.q).trim() : "";
        if (!q) {
            return res.status(200).json({ success: true, medicines: [] });
        }
        const results = await MasterMedicineModel.find({
            name: { $regex: q, $options: "i" }
        }).limit(30);
        return res.status(200).json({
            success: true,
            medicines: results
        });
    }
    catch (error) {
        console.error("searchMasterMedicines err", error);
        res.status(500).json({ success: false, message: "Search failed" });
    }
};
const createKit = async (req, res) => {
    try {
        const { doctorId, name, medicines } = req.body;
        if (!doctorId || !name || !medicines || !Array.isArray(medicines)) {
            return res.status(400).json({ success: false, message: "Invalid payload params" });
        }
        const kit = new KitModel({
            doctorId,
            name,
            medicines
        });
        const saved = await kit.save();
        return res.status(201).json({
            success: true,
            kit: saved
        });
    }
    catch (error) {
        console.error("createKit err", error);
        res.status(500).json({ success: false, message: "Failed to create kit" });
    }
};
const getKits = async (req, res) => {
    try {
        const { doctorId } = req.params;
        if (!doctorId) {
            return res.status(400).json({ success: false, message: "Doctor ID is required" });
        }
        const kits = await KitModel.find({ doctorId });
        return res.status(200).json({
            success: true,
            kits
        });
    }
    catch (error) {
        console.error("getKits err", error);
        res.status(500).json({ success: false, message: "Failed to fetch kits" });
    }
};
export default {
    getAllDoctors,
    doctorRegister,
    updateDoctorData,
    getDoctorById,
    deleteDoctor,
    updateDoctor,
    getClinicDoctors,
    doctorLogin,
    getTodaysBookedAppointments,
    getTotalPatients,
    searchDoctors,
    getDoctorNotifications,
    acceptDoctorRequest,
    rejectDoctorRequest,
    addMedicineToList,
    deleteMedicineFromList,
    getMedicineList,
    searchMasterMedicines,
    createKit,
    getKits,
};
