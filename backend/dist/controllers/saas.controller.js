import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import platformAdminModel from "../models/platformAdmin.model.js";
import clinicModel from "../models/clinic.model.js";
import doctorModel from "../models/doctor.model.js";
import patientModel from "../models/patient.model.js";
import bookingModel from "../models/booking.model.js";
import offlineBookingModel from "../models/OfflineBookingModel.js";
import { LabTestBookingModel, PackageBookingModel } from "../models/lab.model.js";
import subscriptionPlanModel from "../models/subscriptionPlan.model.js";
import auditLogModel from "../models/auditLog.model.js";
// ==========================================
// SUPER ADMIN AUTHENTICATION
// ==========================================
export const superAdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }
        // Check if any admin exists. If not, create a default seed admin to allow login!
        let admin = await platformAdminModel.findOne({ email });
        if (!admin && email === "admin@doctorz.com") {
            const passwordHash = await bcrypt.hash("Admin@123", 10);
            admin = new platformAdminModel({
                username: "superadmin",
                email: "admin@doctorz.com",
                passwordHash,
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
        const isMatch = await bcrypt.compare(password, admin.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: admin._id, role: admin.role, isSuperAdmin: true }, process.env.JWT_SECRET, { expiresIn: "1d" });
        // Audit Log
        const audit = new auditLogModel({
            userId: admin._id,
            userName: admin.username,
            userRole: admin.role,
            action: "SUPER_ADMIN_LOGIN",
            details: "Logged into the SaaS Super Admin panel successfully",
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        await audit.save();
        return res.status(200).json({
            success: true,
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
            },
        });
    }
    catch (err) {
        console.error("Super admin login error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
// ==========================================
// SAAS PLATFORM ANALYTICS DASHBOARD
// ==========================================
export const getDashboardStats = async (req, res) => {
    try {
        const totalClinics = await clinicModel.countDocuments({ clinicType: "Private" });
        const totalHospitals = await clinicModel.countDocuments({ clinicType: "Government" }); // or general count
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
        const { status } = req.body; // e.g. "active", "suspended", "pending"
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
