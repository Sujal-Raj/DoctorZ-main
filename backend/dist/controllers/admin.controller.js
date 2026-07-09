import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import doctorModel from "../models/doctor.model.js";
import patientModel from "../models/patient.model.js";
import nodemailer from "nodemailer";
import { LabModel, LabTestBookingModel, PackageBookingModel } from "../models/lab.model.js";
import clinicModel from "../models/clinic.model.js";
import bcrypt from "bcryptjs";
import AdminModel from "../models/adminModel.js";
import bookingModel from "../models/booking.model.js";
import offlineBookingModel from "../models/OfflineBookingModel.js";
import subscriptionPlanModel from "../models/subscriptionPlan.model.js";
import auditLogModel from "../models/auditLog.model.js";
dotenv.config();
// 🔹 Generate Token
const generateToken = (id, email, role) => {
    return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
};
const generateDoctorId = () => {
    return "DOC-" + Math.floor(100000 + Math.random() * 900000).toString();
};
//Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});
//send Email
const sendMail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to,
            subject,
            html,
        });
    }
    catch (error) {
        console.log("Error sending email:", error);
    }
};
// 🔹 Get all pending doctor requests
export const getPendingDoctors = async (req, res) => {
    try {
        const pendingDoctors = await doctorModel.find({ status: "pending" });
        return res.status(200).json(pendingDoctors);
    }
    catch (error) {
        console.error("Error fetching pending doctors:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};
// 🔹 Approve Doctor
export const approveDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const generatedId = generateDoctorId();
        const doctor = await doctorModel.findByIdAndUpdate(id, { status: "approved", doctorId: generatedId }, { new: true });
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        await sendMail(doctor.email, "Doctor Registration Approved ✅", `<p>Dear Dr. ${doctor.fullName},</p>
       <p>Your registration is <b>Approved</b>.</p>
       <p><b>Doctor ID:</b> ${generatedId}</p>`);
        return res
            .status(200)
            .json({ message: "Doctor approved ✅ & mail sent", doctor });
    }
    catch (error) {
        console.error("Error approving doctor:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};
//  Reject Doctor
export const rejectDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await doctorModel.findByIdAndUpdate(id, { status: "rejected" }, { new: true });
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        await sendMail(doctor.email, "Doctor Registration Rejected ❌", `<p>Dear Dr. ${doctor.fullName},</p>
       <p>Your registration is <b>Rejected</b>. Please contact admin for details.</p>`);
        return res.status(200).json({ message: "Doctor rejected ❌", doctor });
    }
    catch (error) {
        console.error("Error rejecting doctor:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};
//  Approve Lab
// ------------------ Generate Lab ID ------------------
const generateLabId = () => {
    return "LAB-" + Math.floor(100000 + Math.random() * 900000).toString();
};
// ------------------ Approve Lab ------------------
export const approveLab = async (req, res) => {
    try {
        const { id } = req.params;
        const generatedId = generateLabId();
        // ✅ Update lab to approved and assign labId
        const lab = await LabModel.findByIdAndUpdate(id, { status: "approved", labId: generatedId }, { new: true });
        if (!lab) {
            return res.status(404).json({ message: "Lab not found" });
        }
        // ✅ Send approval mail
        await sendMail(lab.email, "Lab Registration Approved ✅", `<p>Dear ${lab.name},</p>
       <p>Your registration has been <b>approved</b>.</p>
       <p><b>Lab ID:</b> ${generatedId}</p>
       <p>Welcome to our platform!</p>`).catch((err) => {
            console.error("Email sending failed:", err);
        });
        return res.status(200).json({
            message: "Lab approved ✅ & mail sent successfully",
            lab,
        });
    }
    catch (error) {
        console.error("Error approving lab:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};
// ------------------ Reject Lab ------------------
export const rejectLab = async (req, res) => {
    try {
        const { id } = req.params;
        const lab = await LabModel.findByIdAndUpdate(id, { status: "rejected" }, { new: true });
        if (!lab) {
            return res.status(404).json({ message: "Lab not found" });
        }
        await sendMail(lab.email, "Lab Registration Rejected ❌", `<p>Dear ${lab.name},</p>
       <p>Your registration has been <b>rejected</b>. Please contact admin for more details.</p>`).catch((err) => {
            console.error("Email sending failed:", err);
        });
        return res.status(200).json({
            message: "Lab rejected ❌ & mail sent successfully",
            lab,
        });
    }
    catch (error) {
        console.error("Error rejecting lab:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};
// ------------------ Get Pending Labs ------------------
export const getPendingLabs = async (req, res) => {
    try {
        // ✅ Fetch only pending labs
        const pendingLabs = await LabModel.find({ status: "pending" }).select("-password"); // exclude password
        return res.status(200).json(pendingLabs);
    }
    catch (error) {
        console.error("Error fetching pending labs:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};
// clinic
export const getPendingClinics = async (req, res) => {
    try {
        const pendingClinics = await clinicModel.find({ status: "pending" });
        return res.status(200).json({
            message: "Pending Clinics retrieved",
            Clinics: pendingClinics,
        });
    }
    catch (err) {
        return res.status(500).json({
            message: "server error",
        });
    }
};
// CLINIC
// ------------------ Generate Staff ID ------------------
const generateClinicStaffId = () => {
    return "STAFF-" + Math.floor(100000 + Math.random() * 900000).toString();
};
// ------------------ Approve Clinic ------------------
export const approveClinic = async (req, res) => {
    try {
        const { id } = req.params;
        // ✅ Generate Staff ID
        const staffId = generateClinicStaffId();
        // ✅ Fetch clinic to see if they requested a plan
        const clinicDoc = await clinicModel.findById(id);
        if (!clinicDoc) {
            return res.status(404).json({ message: "Clinic not found" });
        }
        let assignedPlanId = clinicDoc.subscriptionPlan;
        let allowedFeatures = [];
        if (assignedPlanId) {
            const planDoc = await subscriptionPlanModel.findById(assignedPlanId);
            if (planDoc)
                allowedFeatures = planDoc.features;
        }
        else {
            // Fallback to Enterprise if they didn't select one
            const enterprisePlan = await subscriptionPlanModel.findOne({ name: "Enterprise" });
            assignedPlanId = enterprisePlan?._id;
            allowedFeatures = enterprisePlan?.features || [];
        }
        // ✅ Update clinic status to approved and set staffId
        const clinic = await clinicModel.findByIdAndUpdate(id, {
            status: "approved",
            staffId,
            subscriptionPlan: assignedPlanId,
            allowedFeatures
        }, { new: true });
        if (!clinic) {
            return res.status(404).json({ message: "Clinic not found" });
        }
        // Log email before sending
        console.log("Clinic staffEmail before sending mail:", clinic.staffEmail);
        // Validate email existence before sending mail
        if (!clinic.staffEmail) {
            console.error("No staffEmail found for clinic:", clinic._id);
            return res.status(400).json({ message: "Clinic staff email not found" });
        }
        // ✅ Send approval email to staff with error handling
        try {
            await sendMail(clinic.staffEmail, "Clinic Registration Approved ✅", `<p>Dear ${clinic.staffName},</p>
         <p>Your clinic registration has been <b>approved</b>.</p>
         <p><b>Staff ID:</b> ${staffId}</p>
         <p>Welcome to our platform!</p>`);
            console.log("Clinic approval email sent successfully");
        }
        catch (emailError) {
            console.error("Error sending clinic approval email:", emailError);
            return res.status(500).json({ message: "Failed to send clinic approval email" });
        }
        return res.status(200).json({
            message: "Clinic approved ✅ & email sent successfully",
            clinic,
        });
    }
    catch (error) {
        console.error("Error approving clinic:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};
// ------------------ Reject Clinic ------------------
export const rejectClinic = async (req, res) => {
    try {
        const { id } = req.params;
        const clinic = await clinicModel.findByIdAndUpdate(id, { status: "rejected" }, { new: true });
        if (!clinic) {
            return res.status(404).json({ message: "Clinic not found" });
        }
        await sendMail(clinic.email, "Clinic Registration Rejected ❌", `<p> ${clinic.clinicName},</p>
       <p>Your registration has been <b>rejected</b>. Please contact admin for more details.</p>`).catch((err) => {
            console.error("Email sending failed:", err);
        });
        return res.status(200).json({
            message: "Clinic rejected ❌ & mail sent successfully",
            clinic,
        });
    }
    catch (error) {
        console.error("Error rejecting clinic:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};
// admin login controllers
export const adminLogin = async (req, res) => {
    try {
        const { email, adminId, password } = req.body;
        const identifier = email || adminId;
        if (!identifier || !password) {
            return res.status(400).json({ success: false, message: "Identifier (Email or Admin ID) and password are required" });
        }
        // Seed default admin if identifier is admin_96ced2 and no admin exists
        let admin = await AdminModel.findOne({
            $or: [{ email: identifier.toLowerCase() }, { adminId: identifier }],
        });
        if (!admin && identifier === "admin_96ced2") {
            const passwordHash = await bcrypt.hash("12345", 10);
            admin = new AdminModel({
                adminId: "admin_96ced2",
                email: "superadmin@doctorz.com",
                password: passwordHash,
                role: "super_admin",
                isActive: true,
            });
            await admin.save();
        }
        if (!admin) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        if (!admin.isActive) {
            return res.status(403).json({ success: false, message: "Account is suspended" });
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: admin._id, adminId: admin.adminId, role: admin.role, isSuperAdmin: admin.role === "super_admin" }, process.env.JWT_SECRET, { expiresIn: "1d" });
        // Optional: Log to audit system
        try {
            const audit = new auditLogModel({
                userId: admin._id,
                userName: admin.adminId,
                userRole: admin.role,
                action: "ADMIN_LOGIN",
                details: `Logged in successfully via ${email ? 'email' : 'adminId'}`,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            });
            await audit.save();
        }
        catch (e) {
            console.error("Audit log failed during login:", e);
        }
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            admin: {
                id: admin._id,
                username: admin.adminId,
                email: admin.email,
                role: admin.role,
            },
        });
    }
    catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
// ==========================================
// SAAS PLATFORM ANALYTICS DASHBOARD
// ==========================================
export const getDashboardStats = async (req, res) => {
    try {
        const totalClinics = await clinicModel.countDocuments({ clinicType: "Private" });
        const totalHospitals = await clinicModel.countDocuments({ clinicType: "Government" });
        const totalDoctors = await doctorModel.countDocuments();
        const totalPatients = await patientModel.countDocuments();
        // Total appointments counts (online + offline)
        const onlineAppointmentsCount = await bookingModel.countDocuments();
        const offlineAppointmentsCount = await offlineBookingModel.countDocuments();
        const totalAppointments = onlineAppointmentsCount + offlineAppointmentsCount;
        // Monthly platform revenue (sum of all paid bookings in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const paidOnline = await bookingModel.find({
            paymentStatus: "paid",
            createdAt: { $gte: thirtyDaysAgo }
        }).select("fees");
        const paidOffline = await offlineBookingModel.find({
            paymentStatus: "paid",
            createdAt: { $gte: thirtyDaysAgo }
        }).select("fees");
        const paidLabTests = await LabTestBookingModel.find({
            paymentStatus: "paid",
            createdAt: { $gte: thirtyDaysAgo }
        }).select("price");
        const paidLabPkgs = await PackageBookingModel.find({
            paymentStatus: "paid",
            createdAt: { $gte: thirtyDaysAgo }
        }).populate("packageId", "totalPrice").lean();
        let monthlyRevenue = 0;
        paidOnline.forEach(b => monthlyRevenue += (b.fees || 0));
        paidOffline.forEach(b => monthlyRevenue += (b.fees || 0));
        paidLabTests.forEach(b => monthlyRevenue += (b.price || 0));
        paidLabPkgs.forEach((b) => monthlyRevenue += (b.packageId?.totalPrice || 0));
        // Platform new registrations (Clinics added in past 30 days)
        const newRegistrations = await clinicModel.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });
        return res.status(200).json({
            success: true,
            stats: {
                totalClinics,
                totalHospitals,
                totalDoctors,
                totalPatients,
                totalAppointments,
                monthlyRevenue,
                newRegistrations,
            }
        });
    }
    catch (err) {
        console.error("Error fetching SaaS dashboard stats:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
// ==========================================
// TENANT / HOSPITAL MANAGEMENT
// ==========================================
export const getAllHospitals = async (req, res) => {
    try {
        const list = await clinicModel.find()
            .populate("subscriptionPlan", "name priceMonthly")
            .select("-staffPassword")
            .sort({ createdAt: -1 });
        return res.status(200).json({ success: true, count: list.length, hospitals: list });
    }
    catch (err) {
        console.error("Error fetching hospitals list:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
export const addHospital = async (req, res) => {
    try {
        const { clinicName, clinicType, specialities, address, state, district, pincode, phone, email, staffName, staffEmail, staffPassword, staffId, panNumber, operatingHours, aadharNumber, subdomain, subscriptionPlan, storageLimitGb } = req.body;
        // Check duplicate staffId
        const existing = await clinicModel.findOne({ staffId });
        if (existing) {
            return res.status(400).json({ success: false, message: "Staff ID already registered" });
        }
        const passwordHash = await bcrypt.hash(staffPassword, 10);
        const hospital = new clinicModel({
            clinicName,
            clinicType,
            specialities: specialities || ["General Medicine"],
            address,
            state,
            district,
            pincode,
            phone,
            email,
            staffName,
            staffEmail,
            staffPassword: passwordHash,
            staffId,
            panNumber,
            operatingHours: operatingHours || "9 AM - 6 PM",
            aadharNumber,
            subdomain: subdomain || undefined,
            subscriptionPlan: subscriptionPlan || undefined,
            storageLimitGb: storageLimitGb || 5,
            status: "active"
        });
        await hospital.save();
        return res.status(201).json({ success: true, message: "Hospital registered successfully", hospital });
    }
    catch (err) {
        console.error("Error adding hospital:", err);
        return res.status(500).json({ success: false, message: err.message || "Failed to create hospital" });
    }
};
export const updateHospitalStatus = async (req, res) => {
    try {
        const { hospitalId } = req.params;
        const { status } = req.body;
        if (!["active", "suspended", "pending"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }
        const hospital = await clinicModel.findByIdAndUpdate(hospitalId, { status }, { new: true });
        if (!hospital) {
            return res.status(404).json({ success: false, message: "Hospital not found" });
        }
        return res.status(200).json({ success: true, message: `Hospital status updated to ${status}`, hospital });
    }
    catch (err) {
        console.error("Error updating hospital status:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
// ==========================================
// SUBSCRIPTION PLANS CONFIGURATION
// ==========================================
export const addSubscriptionPlan = async (req, res) => {
    try {
        const { name, priceMonthly, priceYearly, trialDays, features } = req.body;
        const existing = await subscriptionPlanModel.findOne({ name });
        if (existing) {
            return res.status(400).json({ success: false, message: "Plan name already exists" });
        }
        const plan = new subscriptionPlanModel({
            name,
            priceMonthly,
            priceYearly,
            trialDays,
            features
        });
        await plan.save();
        return res.status(201).json({ success: true, message: "Subscription plan created", plan });
    }
    catch (err) {
        console.error("Error adding plan:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
export const getSubscriptionPlans = async (req, res) => {
    try {
        const plans = await subscriptionPlanModel.find({ isActive: true });
        return res.status(200).json({ success: true, plans });
    }
    catch (err) {
        console.error("Error fetching plans:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
