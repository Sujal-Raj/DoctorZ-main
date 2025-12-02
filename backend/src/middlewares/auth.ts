import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import doctorModel from '../models/doctor.model.js';
import patientModel from '../models/patient.model.js';
import clinicModel from '../models/clinic.model.js';


/// Doctor token verification
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    // Check if token is actually present
    if (!token) {
      return res.status(401).json({ message: 'Token is undefined or missing' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT secret is not configured' });
    }

    const decoded = jwt.verify(token, secret) as { id: string };
    const doctor = await doctorModel.findById(decoded.id).select('-password');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    req.body.doctor = doctor;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};




// Extend Request type to allow custom property


// patient verificatuion 
export const verifyPatientToken = async (req: Request, res: Response, next: NextFunction) => {
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
    if (!secret) {
      return res.status(500).json({ message: 'JWT secret is not configured' });
    }

    const decoded = jwt.verify(token, secret) as { id: string };
    const patient = await patientModel.findById(decoded.id).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    req.body.patient = patient;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};


export const verifyClinicToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization header missing or malformed" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token is undefined or missing" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "JWT secret is not configured" });
    }

    const decoded = jwt.verify(token, secret) as { id: string };

    const clinic = await clinicModel.findById(decoded.id).select("-staffPassword");

    if (!clinic) {
      return res.status(404).json({ message: "Clinic not found" });
    }

    // Attach clinic info to request object for downstream handlers
    req.body.clinic = clinic;
    next();
  } catch (error) {
    console.error("Clinic token verification error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


export const AdminVerifyToken=async(req:Request,res:Response,next:NextFunction)=>{

    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}