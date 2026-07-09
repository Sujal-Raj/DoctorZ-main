import express from "express";
import { staffLogin, createStaff, getStaffList, updateStaff, deleteStaff, createDepartment, getDepartments, updateDepartment, deleteDepartment, logAttendance, applyLeave, getLeavesList, approveRejectLeave, } from "../controllers/staff.controller.js";
const staffRouter = express.Router();
// Staff authentication
staffRouter.post("/login", staffLogin);
// Staff management
staffRouter.post("/add", createStaff);
staffRouter.get("/list/:clinicId", getStaffList);
staffRouter.put("/update/:staffId", updateStaff);
staffRouter.delete("/delete/:staffId", deleteStaff);
// Department management
staffRouter.post("/departments/add", createDepartment);
staffRouter.get("/departments/:clinicId", getDepartments);
staffRouter.put("/departments/update/:departmentId", updateDepartment);
staffRouter.delete("/departments/delete/:departmentId", deleteDepartment);
// HR - Attendance & Leaves
staffRouter.put("/attendance/:staffId", logAttendance);
staffRouter.post("/leaves/apply/:staffId", applyLeave);
staffRouter.get("/leaves/list/:clinicId", getLeavesList);
staffRouter.put("/leaves/status/:staffId/:leaveId", approveRejectLeave);
export default staffRouter;
