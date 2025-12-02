import bcrypt from "bcryptjs";
import clinicModel from "../models/clinic.model.js";
import doctorModel from "../models/doctor.model.js";
import nodemailer from "nodemailer";
import bookingModel from "../models/booking.model.js";
import patientModel from "../models/patient.model.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
console.log("MAIL_USER:", process.env.MAIL_USER);
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});
// ---------------- Clinic Registration ----------------
export const clinicRegister = async (req, res) => {
    try {
        console.log("🟡 Incoming registration request...");
        console.log("➡️ Body:", req.body);
        console.log("➡️ Files:", req.files); // 👈 this will tell you if multer is working
        const { clinicName, clinicType, specialities, operatingHours, licenseNo, ownerAadhar, ownerPan, address, state, district, pincode, contact, email, staffEmail, staffName, staffPassword, staffId, } = req.body;
        if (!clinicName || !clinicType || !specialities || !licenseNo || !ownerAadhar) {
            return res.status(400).json({ message: "All required fields must be filled." });
        }
        // Multer provides the uploaded file here
        const registrationCertPath = req.files &&
            'registrationCert' in req.files &&
            Array.isArray(req.files['registrationCert']) &&
            req.files['registrationCert'].length > 0
            ? `http://localhost:3000/uploads/${(req.files['registrationCert'][0])?.filename}`
            : undefined;
        const clinicImagePath = req.files &&
            'clinicImage' in req.files &&
            Array.isArray(req.files['clinicImage']) &&
            req.files['clinicImage'].length > 0
            ? `http://localhost:3000/uploads/${(req.files['clinicImage'][0])?.filename}`
            : undefined;
        const clinic = new clinicModel({
            clinicName,
            clinicType,
            specialities,
            operatingHours,
            clinicLicenseNumber: licenseNo,
            aadharNumber: Number(ownerAadhar),
            panNumber: ownerPan,
            address,
            state,
            district,
            pincode: Number(pincode),
            phone: contact,
            email,
            staffEmail,
            staffName,
            staffId,
            staffPassword: await bcrypt.hash(staffPassword, 10),
            registrationCertificate: registrationCertPath,
            clinicImage: clinicImagePath,
        });
        await clinic.save();
        // 📧 Send staff ID via email after saving
        try {
            await transporter.sendMail({
                from: process.env.MAIL_USER,
                to: staffEmail,
                subject: "Your Staff ID for Clinic Registration",
                html: `
          <p>Hi <b>${staffName}</b>,</p>
          <p>Your staff account has been created successfully!</p>
          <p><strong>Staff ID:</strong> ${staffId}</p>
          <p>Please use this ID along with your password to login.</p>
          <br/>
          <p>Thanks,<br/>Clinic Management Team</p>
        `,
            });
            console.log(" Staff ID email sent to:", staffEmail);
        }
        catch (mailErr) {
            console.error(" Failed to send email:", mailErr);
        }
        return res.status(201).json({ message: "Clinic Registered", clinic });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong", error });
    }
};
// ---------------- Clinic Login ----------------
export const clinicLogin = async (req, res) => {
    try {
        const { staffId, staffPassword } = req.body;
        if (!staffId || !staffPassword) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        const clinic = await clinicModel.findOne({ staffId: staffId });
        if (!clinic) {
            return res.status(404).json({
                message: "Clinic not found"
            });
        }
        const isMatch = await bcrypt.compare(staffPassword, clinic.staffPassword);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }
        const token = jwt.sign({ id: clinic._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        // ✅ Set cookie
        res.cookie("authToken", token, {
            httpOnly: false, // allow frontend JS to read
            secure: false, // because localhost is not HTTPS
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({
            message: "Login successful",
            clinic: {
                id: clinic._id,
                staffId: clinic.staffId,
                staffName: clinic.staffName,
                staffEmail: clinic.staffEmail,
                clinicName: clinic.clinicName,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};
// // ---------------- Update Clinic ----------------
export const updateClinic = async (req, res) => {
    try {
        const { id } = req.params;
        const { clinicName, clinicType, specialities, operatingHours, clinicLicenseNumber, aadharNumber, panNumber, address, district, pincode, state, phone, email, staffEmail, staffPassword, staffName, staffId, doctors, } = req.body;
        const updateData = {
            clinicName,
            clinicType,
            specialities: Array.isArray(specialities)
                ? specialities
                : typeof specialities === "string"
                    ? specialities.split(",").map((s) => s.trim())
                    : [],
            operatingHours,
            clinicLicenseNumber,
            aadharNumber: Number(aadharNumber),
            panNumber,
            address,
            district,
            state,
            pincode: Number(pincode),
            phone,
            email,
            staffEmail,
            staffName,
            staffId,
            doctors,
        };
        // 🔒 Hash new password if provided
        if (staffPassword && staffPassword.trim() !== "") {
            const hashedPassword = await bcrypt.hash(staffPassword, 10);
            updateData.staffPassword = hashedPassword;
        }
        // Optional file upload handling
        if (req.file) {
            updateData.registrationCertificate = `http://localhost:3000/uploads/${req.file.filename}`;
            ;
        }
        const updatedClinic = await clinicModel.findByIdAndUpdate(id, updateData, {
            new: true,
        });
        if (!updatedClinic) {
            return res.status(404).json({ message: "Clinic not found" });
        }
        return res
            .status(200)
            .json({ message: "Clinic updated", clinic: updatedClinic });
    }
    catch (error) {
        console.error("Error updating clinic:", error);
        return res.status(500).json({ message: "Something went wrong", error });
    }
};
// ---------------- Delete Clinic ----------------
export const deleteClinic = async (req, res) => {
    try {
        const { id } = req.params;
        await clinicModel.findByIdAndDelete(id);
        return res.status(200).json({
            message: "Clinic deleted successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};
// ---------------- Search Clinic and Doctor ----------------
export const searchClinicAndDoctor = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== "string") {
            return res.status(400).json({ message: "Search query is required" });
        }
        const query = q.trim();
        if (!query) {
            return res.status(400).json({ message: "Search query is empty" });
        }
        // Try doctor first
        const doctors = await doctorModel.find({
            $or: [
                { fullName: { $regex: query, $options: "i" } },
                { specialization: { $regex: query, $options: "i" } },
            ],
        });
        if (doctors.length > 0) {
            // If any doctors found, return doctors only
            return res.status(200).json({ type: "doctor", results: doctors });
        }
        // Otherwise, try clinics
        const clinics = await clinicModel.find({
            $or: [
                { clinicName: { $regex: query, $options: "i" } }
            ],
        });
        if (clinics.length > 0) {
            return res.status(200).json({ type: "clinic", results: clinics });
        }
        return res.status(404).json({ message: "No doctors or clinics found" });
    }
    catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
// ---------------- Get All Clinics ----------------
// export const getAllClinic = async (req: Request, res: Response) => {
//   try {
//     const clinics = await clinicModel.find();
//     res.status(200).json(clinics); // ✅ return array directly
//   } catch (error: any) {
//     res.status(500).json({ message: "Something went wrong", error: error.message });
//   }
// };
export const getAllClinic = async (req, res) => {
    try {
        const { patientId } = req.params;
        // Fetch all approved clinics only
        const clinics = await clinicModel.find({ status: "approved" });
        // If patient not logged in, return clinics normally
        if (!patientId || patientId === "null" || patientId === "undefined") {
            res.status(200).json({
                message: "Approved clinics fetched successfully",
                clinics,
            });
            return;
        }
        // Get patient's favourite clinics
        const patient = await patientModel
            .findById(patientId)
            .select("favouriteClinics");
        const favouriteIds = new Set((patient?.favouriteClinics || []).map((id) => id.toString()));
        // Add isFavourite flag
        const clinicsWithFav = clinics.map((clinic) => ({
            ...clinic.toObject(),
            isFavourite: favouriteIds.has(clinic._id.toString()),
        }));
        // Sort favourites first
        const sortedClinics = clinicsWithFav.sort((a, b) => a.isFavourite === b.isFavourite ? 0 : a.isFavourite ? -1 : 1);
        res.status(200).json({
            message: "Approved clinics fetched successfully",
            clinics: sortedClinics,
        });
    }
    catch (error) {
        console.error("Error fetching clinics:", error);
        res.status(500).json({
            message: "Failed to fetch clinics",
            error: error.message,
        });
    }
};
export const getClinicById = async (req, res) => {
    try {
        const { id } = req.params;
        const clinic = await clinicModel.findById(id);
        if (!clinic) {
            return res.status(404).json({
                message: "Clinic not found"
            });
        }
        return res.status(200).json({
            message: "Clinic found", clinic
        });
    }
    catch (error) {
        console.error("error in getClinicById", error);
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};
// ---------------- Get All Clinic Patients ----------------
export const getAllClinicPatients = async (req, res) => {
    try {
        const { clinicId } = req.params;
        if (!clinicId) {
            return res.status(400).json({ message: "Clinic ID is required" });
        }
        // ✅ Step 1: Find all doctors linked to this clinic
        const doctors = await doctorModel
            .find({ clinic: clinicId })
            .select("_id fullName specialization");
        if (doctors.length === 0) {
            return res.status(404).json({ message: "No doctors found for this clinic" });
        }
        const doctorIds = doctors.map((d) => d._id);
        // ✅ Step 2: Fetch all bookings for those doctors
        const bookings = await bookingModel
            .find({ doctorId: { $in: doctorIds } })
            .populate("doctorId", "fullName specialization");
        if (bookings.length === 0) {
            return res.status(404).json({ message: "No patients found for this clinic" });
        }
        // ✅ Step 3: Build patient list using the `patient` object
        const patients = bookings.map((b) => {
            const doctor = b.doctorId;
            const patient = b.patient; // 👈 comes from embedded field
            return {
                patientName: patient?.name,
                age: patient?.age,
                gender: patient?.gender,
                contact: patient?.contact,
                aadhar: patient?.aadhar,
                appointedTo: `Dr. ${doctor?.fullName}`,
                specialization: doctor?.specialization,
                datetime: b.dateTime,
                mode: b.mode,
                fees: b.fees,
            };
        });
        return res.status(200).json({
            message: "All clinic patients fetched successfully",
            clinicId,
            totalPatients: patients.length,
            patients,
        });
    }
    catch (error) {
        console.error("Error fetching clinic patients:", error);
        return res.status(500).json({ message: "Something went wrong", error });
    }
};
// ---------------- Get Clinic Stats ----------------
export const getClinicStatus = async (req, res) => {
    try {
        const { clinicId } = req.params;
        if (!clinicId) {
            return res.status(400).json({ message: "Clinic ID is required" });
        }
        // ✅ Fetch doctors linked to this clinic with approved status
        const doctors = await doctorModel.find({
            clinic: clinicId,
            status: "approved",
        });
        const totalDoctors = doctors.length;
        const totalDepartments = new Set(doctors.map((d) => d.specialization)).size;
        return res.status(200).json({
            message: "Clinic stats fetched successfully",
            stats: {
                totalDoctors,
                totalDepartments,
            },
        });
    }
    catch (error) {
        console.error("Error fetching clinic stats:", error);
        return res.status(500).json({ message: "Something went wrong", error });
    }
};
export const sendDoctorRequest = async (req, res) => {
    try {
        const { doctorId, clinicId } = req.body;
        const doctor = await doctorModel.findById(doctorId);
        const clinic = await clinicModel.findById(clinicId);
        if (!doctor || !clinic) {
            return res.status(400).json({
                message: "Invalid doctor or clinic"
            });
        }
        doctor.notifications.push({
            type: "request",
            clinicId,
            clinicName: clinic.clinicName,
            message: `You have been invited to join this ${clinic.clinicName}  clinic. Please accept or reject the invitation.`,
            status: "pending",
            createdAt: new Date(),
        });
        await doctor.save();
        res.json({ message: " Request sent successfully" });
    }
    catch (error) {
        console.log(error);
        res.json({ message: "Something went wrong" });
    }
};
export const getClinicDoctorStatus = async (req, res) => {
    try {
        const { clinicId } = req.params;
        const doctors = await doctorModel.find();
        const addedDoctors = [];
        const pendingRequests = [];
        doctors.forEach((doctor) => {
            const notif = doctor.notifications.find((n) => n.clinicId?.toString() === clinicId);
            if (notif) {
                if (notif.status === "accepted") {
                    addedDoctors.push(doctor._id.toString());
                }
                if (notif.status === "pending") {
                    pendingRequests.push(doctor._id.toString());
                }
            }
        });
        return res.json({
            addedDoctors,
            pendingRequests,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
//# sourceMappingURL=clinic.controller.js.map