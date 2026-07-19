import jwt from 'jsonwebtoken';
import doctorModel from '../models/doctor.model.js';
import clinicModel from '../models/clinic.model.js';
import patientModel from '../models/patient.model.js';
import { LabModel } from '../models/lab.model.js';
import staffModel from '../models/staff.model.js';
export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization header missing or malformed' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token is undefined or missing' });
        }
        const secret = process.env.JWT_SECRET;
        if (!secret)
            return res.status(500).json({ message: 'JWT secret is not configured' });
        const decoded = jwt.verify(token, secret);
        const id = decoded.id;
        // Try finding the user across models
        let user = null;
        let role = "";
        const doctor = await doctorModel.findById(id);
        if (doctor) {
            user = doctor;
            role = "doctor";
        }
        if (!user) {
            const clinic = await clinicModel.findById(id);
            if (clinic) {
                user = clinic;
                role = "clinic";
            }
        }
        if (!user) {
            const lab = await LabModel.findById(id);
            if (lab) {
                user = lab;
                role = "lab";
            }
        }
        if (!user) {
            const staff = await staffModel.findById(id);
            if (staff) {
                user = staff;
                role = "staff"; // or staff.role
            }
        }
        if (!user) {
            const patient = await patientModel.findById(id);
            if (patient) {
                user = patient;
                role = "patient";
            }
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found in any domain' });
        }
        req.user = {
            id: user._id.toString(),
            role: role,
            name: user.fullName || user.clinicName || user.name || "User",
            clinicId: user.clinic || user.clinicId || null
        };
        next();
    }
    catch (error) {
        console.error('Unified Token verification error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
