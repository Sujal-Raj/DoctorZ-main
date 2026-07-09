import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import staffModel from "../models/staff.model.js";
import departmentModel from "../models/department.model.js";
import clinicModel from "../models/clinic.model.js";
// ==========================================
// STAFF AUTHENTICATION (RBAC LOGINS)
// ==========================================
export const staffLogin = async (req, res) => {
    try {
        const { staffId, password } = req.body;
        if (!staffId || !password) {
            return res.status(400).json({ success: false, message: "Staff ID and password are required" });
        }
        const staff = await staffModel.findOne({ staffId });
        if (!staff) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        if (!staff.isActive) {
            return res.status(403).json({ success: false, message: "Your account is deactivated. Contact Admin." });
        }
        const isMatch = await bcrypt.compare(password, staff.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: staff._id, clinicId: staff.clinicId, role: staff.role, permissions: staff.permissions }, process.env.JWT_SECRET, { expiresIn: "1d" });
        const clinic = await clinicModel.findById(staff.clinicId);
        return res.status(200).json({
            success: true,
            message: `Login successful as ${staff.role}`,
            token,
            staff: {
                id: staff._id,
                clinicId: staff.clinicId,
                staffId: staff.staffId,
                fullName: staff.fullName,
                role: staff.role,
                permissions: staff.permissions,
                allowedFeatures: clinic?.allowedFeatures || [],
            },
        });
    }
    catch (err) {
        console.error("Staff login error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
// ==========================================
// USER & ROLE MANAGEMENT (STAFF CRUD)
// ==========================================
export const createStaff = async (req, res) => {
    try {
        const { clinicId, fullName, email, mobileNo, role, password, permissions, department, salary, shiftStart, shiftEnd } = req.body;
        if (!clinicId || !fullName || !role || !password) {
            return res.status(400).json({ success: false, message: "Name, role, clinic ID, and password are required" });
        }
        // Generate unique staffId
        const roleCode = role.substring(0, 3).toUpperCase();
        const randNum = Math.floor(1000 + Math.random() * 9000).toString();
        const staffId = `STF-${roleCode}-${randNum}`;
        const passwordHash = await bcrypt.hash(password, 10);
        const newStaff = new staffModel({
            clinicId,
            staffId,
            passwordHash,
            fullName,
            email,
            mobileNo,
            role,
            permissions: permissions || [],
            department,
            salary: salary || 0,
            shiftStart: shiftStart || "09:00",
            shiftEnd: shiftEnd || "17:00",
        });
        await newStaff.save();
        return res.status(201).json({
            success: true,
            message: "Staff member onboarded successfully",
            staff: {
                id: newStaff._id,
                staffId: newStaff.staffId,
                fullName: newStaff.fullName,
                role: newStaff.role,
                permissions: newStaff.permissions,
            },
        });
    }
    catch (err) {
        console.error("Error creating staff:", err);
        return res.status(500).json({ success: false, message: err.message || "Failed to onboard staff" });
    }
};
export const getStaffList = async (req, res) => {
    try {
        const { clinicId } = req.params;
        const list = await staffModel.find({ clinicId }).select("-passwordHash");
        return res.status(200).json({ success: true, count: list.length, staff: list });
    }
    catch (err) {
        console.error("Error fetching staff list:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
export const updateStaff = async (req, res) => {
    try {
        const { staffId } = req.params;
        const updateData = { ...req.body };
        if (updateData.password) {
            updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
            delete updateData.password;
        }
        const staff = await staffModel.findByIdAndUpdate(staffId, updateData, { new: true }).select("-passwordHash");
        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }
        return res.status(200).json({ success: true, message: "Staff details updated", staff });
    }
    catch (err) {
        console.error("Error updating staff:", err);
        return res.status(500).json({ success: false, message: err.message || "Failed to update staff" });
    }
};
export const deleteStaff = async (req, res) => {
    try {
        const { staffId } = req.params;
        const staff = await staffModel.findByIdAndDelete(staffId);
        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff member not found" });
        }
        return res.status(200).json({ success: true, message: "Staff member removed from register" });
    }
    catch (err) {
        console.error("Error deleting staff:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
// ==========================================
// DEPARTMENT MANAGEMENT
// ==========================================
export const createDepartment = async (req, res) => {
    try {
        const { clinicId, name, description, headDoctorId, doctors } = req.body;
        if (!clinicId || !name) {
            return res.status(400).json({ success: false, message: "Clinic ID and department name are required" });
        }
        const dept = new departmentModel({
            clinicId,
            name,
            description,
            headDoctorId: headDoctorId || undefined,
            doctors: doctors || [],
        });
        await dept.save();
        return res.status(201).json({ success: true, message: "Department created successfully", department: dept });
    }
    catch (err) {
        console.error("Error creating department:", err);
        return res.status(500).json({ success: false, message: err.message || "Failed to create department" });
    }
};
export const getDepartments = async (req, res) => {
    try {
        const { clinicId } = req.params;
        const list = await departmentModel.find({ clinicId })
            .populate("headDoctorId", "fullName email specialities")
            .populate("doctors", "fullName email specialities");
        return res.status(200).json({ success: true, departments: list });
    }
    catch (err) {
        console.error("Error fetching departments:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
export const updateDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const dept = await departmentModel.findByIdAndUpdate(departmentId, req.body, { new: true });
        if (!dept) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }
        return res.status(200).json({ success: true, message: "Department updated successfully", department: dept });
    }
    catch (err) {
        console.error("Error updating department:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
export const deleteDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;
        await departmentModel.findByIdAndDelete(departmentId);
        return res.status(200).json({ success: true, message: "Department deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting department:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
// ==========================================
// HR MODULE (ATTENDANCE & LEAVES)
// ==========================================
export const logAttendance = async (req, res) => {
    try {
        const { staffId } = req.params;
        const { date, status } = req.body; // status: "Present" | "Absent" | "On Leave"
        const staff = await staffModel.findById(staffId);
        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }
        staff.attendance = staff.attendance || [];
        // Check if date already logged
        const day = new Date(date).toDateString();
        const existingIndex = staff.attendance.findIndex(a => new Date(a.date).toDateString() === day);
        if (existingIndex > -1) {
            staff.attendance[existingIndex].status = status;
        }
        else {
            staff.attendance.push({ date: new Date(date), status });
        }
        await staff.save();
        return res.status(200).json({ success: true, message: "Attendance registered", attendance: staff.attendance });
    }
    catch (err) {
        console.error("Error logging attendance:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
export const applyLeave = async (req, res) => {
    try {
        const { staffId } = req.params;
        const { date, reason } = req.body;
        const staff = await staffModel.findById(staffId);
        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }
        staff.leaves = staff.leaves || [];
        staff.leaves.push({ date: new Date(date), reason, status: "Pending" });
        await staff.save();
        return res.status(200).json({ success: true, message: "Leave application submitted" });
    }
    catch (err) {
        console.error("Error applying leave:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
export const getLeavesList = async (req, res) => {
    try {
        const { clinicId } = req.params;
        // Get leaves from all staff members of this clinic
        const staffWithLeaves = await staffModel.find({
            clinicId,
            "leaves.0": { $exists: true }
        }).select("fullName role leaves");
        const flatLeaves = staffWithLeaves.flatMap(s => s.leaves ? s.leaves.map(l => ({
            staffId: s._id,
            fullName: s.fullName,
            role: s.role,
            leaveId: l._id,
            date: l.date,
            reason: l.reason,
            status: l.status
        })) : []);
        return res.status(200).json({ success: true, leaves: flatLeaves });
    }
    catch (err) {
        console.error("Error fetching leaves list:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
export const approveRejectLeave = async (req, res) => {
    try {
        const { staffId, leaveId } = req.params;
        const { status } = req.body; // "Approved" | "Rejected"
        const staff = await staffModel.findById(staffId);
        if (!staff || !staff.leaves) {
            return res.status(404).json({ success: false, message: "Staff or leaves not found" });
        }
        const leave = staff.leaves.find(l => String(l._id) === leaveId);
        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave item not found" });
        }
        leave.status = status;
        await staff.save();
        return res.status(200).json({ success: true, message: `Leave application status set to ${status}` });
    }
    catch (err) {
        console.error("Error setting leave status:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
