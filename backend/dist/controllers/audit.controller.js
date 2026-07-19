import auditLogModel from "../models/auditLog.model.js";
export const getAuditLogs = async (req, res) => {
    try {
        const { startDate, endDate, module, action, userId, recordId } = req.query;
        // Build query
        const query = {};
        // Only fetch logs for the current hospital/clinic/lab
        const user = req.user;
        if (user.role === "lab") {
            query.hospitalId = user.id;
        }
        else if (user.clinicId || user.id) {
            // Clinic/Doctor/Staff
            query.hospitalId = user.clinicId || user.id;
        }
        else if (user.role === "superadmin") {
            // superadmin can see all
        }
        else {
            return res.status(403).json({ success: false, message: "No context for audit logs" });
        }
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate)
                query.createdAt.$gte = new Date(startDate);
            if (endDate)
                query.createdAt.$lte = new Date(endDate);
        }
        if (module)
            query.module = module;
        if (action)
            query.action = { $regex: action, $options: "i" };
        if (userId)
            query.userId = userId;
        if (recordId)
            query.recordId = recordId;
        const logs = await auditLogModel.find(query).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, count: logs.length, logs });
    }
    catch (error) {
        console.error("Get Audit Logs Error:", error);
        return res.status(500).json({ success: false, message: "Server error fetching logs" });
    }
};
