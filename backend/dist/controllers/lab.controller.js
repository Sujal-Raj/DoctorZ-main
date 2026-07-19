import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { LabModel, LabTestBookingModel, TestModel, LabPackageModel, PackageBookingModel, } from "../models/lab.model.js";
import patientModel from "../models/patient.model.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { logAudit } from "../utils/audit.util.js";
// ------------------ LAB REGISTER ------------------
const labRegister = async (req, res) => {
    try {
        const { name, email, password, state, address, city, pincode, timings, certificateNumber, } = req.body;
        if (!name ||
            !email ||
            !password ||
            !state ||
            !address ||
            !city ||
            !pincode ||
            !timings ||
            !certificateNumber) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const trimmedEmail = email.trim().toLowerCase();
        const existingLab = await LabModel.findOne({ trimmedEmail });
        if (existingLab) {
            return res.status(400).json({ message: "Lab already registered with this email" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const labId = `LAB-${Date.now().toString().slice(-6)}`;
        const lab = new LabModel({
            labId,
            name,
            email: trimmedEmail,
            password: hashedPassword,
            state,
            address,
            city,
            pincode,
            timings,
            certificateNumber,
            status: "pending",
        });
        await lab.save();
        return res.status(201).json({
            message: "Lab Registered Successfully",
            lab: {
                id: lab._id,
                labId: lab.labId,
                name: lab.name,
                email: lab.email,
                status: lab.status,
            },
        });
    }
    catch (err) {
        console.error("Lab Register Error:", err);
        const errorMessage = err instanceof Error ? err.message : "Lab Register Failed";
        return res.status(500).json({ message: errorMessage });
    }
};
// ------------------ LAB LOGIN ------------------
const labLogin = async (req, res) => {
    try {
        const { labId, password } = req.body;
        const lab = await LabModel.findOne({ labId });
        if (!lab)
            return res.status(400).json({ message: "Lab not found" });
        if (lab.status !== "approved")
            return res.status(403).json({ message: "Lab not approved yet" });
        const isMatch = await bcrypt.compare(password, lab.password);
        if (!isMatch)
            return res.status(401).json({ message: "Invalid credentials" });
        const token = jwt.sign({ id: lab._id, labId: lab.labId, email: lab.email, role: "lab" }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.status(200).json({
            message: "Login Successful",
            token,
            lab: { _id: lab._id, labId: lab.labId, name: lab.name, email: lab.email },
        });
    }
    catch (err) {
        console.error("Error logging in lab:", err);
        const errorMessage = err instanceof Error ? err.message : "Server error";
        return res.status(500).json({ message: errorMessage });
    }
};
// ------------------ GET ALL LAB TESTS ------------------
const getAllLabTests = async (req, res) => {
    try {
        const approvedLabs = await LabModel.find({ status: "approved" }).select("_id name");
        const approvedLabIds = approvedLabs.map((lab) => lab._id);
        const tests = await TestModel.find({ labId: { $in: approvedLabIds } })
            .populate("labId", "name")
            .lean();
        const formattedTests = tests.map((test) => ({
            _id: test._id,
            testName: test.testName,
            description: test.description,
            price: test.price,
            precaution: test.precaution,
            category: test.category,
            customCategory: test.customCategory || "",
            labName: test.labId?.name || "Unknown Lab",
            labId: test.labId?._id,
        }));
        return res.status(200).json(formattedTests);
    }
    catch (err) {
        console.error("Error fetching all lab tests:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch tests";
        return res.status(500).json({ message: errorMessage });
    }
};
// ------------------ BOOK A TEST ------------------
const addTestBooking = async (req, res) => {
    try {
        const { test, patientId, bookingDate } = req.body;
        if (!test || !patientId) {
            return res.status(400).json({ message: "Missing test or patientId" });
        }
        if (!test.labId || !test.name) {
            return res.status(400).json({ message: "Invalid test data" });
        }
        // bookingDate validation: must be provided (if bookingDate required)
        if (!bookingDate) {
            return res.status(400).json({ message: "Please provide a bookingDate" });
        }
        const bookingDateObj = new Date(bookingDate);
        if (isNaN(bookingDateObj.getTime())) {
            return res.status(400).json({ message: "Invalid bookingDate format" });
        }
        // Optional: disallow past dates (server-side)
        const today = new Date();
        const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const b = new Date(bookingDateObj.getFullYear(), bookingDateObj.getMonth(), bookingDateObj.getDate());
        if (b < t) {
            return res.status(400).json({ message: "bookingDate cannot be in the past" });
        }
        const lab = await LabModel.findById(test.labId);
        if (!lab)
            return res.status(404).json({ message: "Lab not found" });
        const booking = await LabTestBookingModel.create({
            labId: lab._id,
            userId: new mongoose.Types.ObjectId(patientId),
            testName: test.name,
            category: test.category || "General",
            price: test.price || 0,
            status: "pending",
            bookingDate: bookingDateObj,
            // bookedAt will default to Date.now via schema
        });
        await logAudit({
            req,
            module: "Lab",
            action: "Test Ordered",
            details: `Lab test ${test.name} booked`,
            recordId: booking.id,
            newValue: {
                "Test Name": booking.testName,
                "Category": booking.category,
                "Price": `₹${booking.price}`,
                "Status": booking.status,
                "Booking Date": booking.bookingDate
            },
        });
        return res
            .status(200)
            .json({ message: "Test booked successfully", booking });
    }
    catch (err) {
        console.error("Error booking test:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to book test";
        return res.status(500).json({ message: errorMessage });
    }
};
// ------------------ ADD LAB TEST ------------------
const addTest = async (req, res) => {
    try {
        const tests = req.body;
        if (!Array.isArray(tests) || tests.length === 0)
            return res.status(400).json({ message: "No tests provided" });
        const testsToInsert = tests.map((test) => ({
            testName: test.testName,
            description: test.description,
            category: test.category === "Other" ? test.customCategory : test.category,
            precaution: test.precaution,
            price: test.price,
            labId: test.labId,
        }));
        const savedTests = await TestModel.insertMany(testsToInsert);
        return res.status(200).json({ message: "Tests Added Successfully", tests: savedTests });
    }
    catch (err) {
        console.error("Error Adding Tests:", err);
        const errorMessage = err instanceof Error ? err.message : "Error Adding Tests";
        return res.status(500).json({ message: errorMessage });
    }
};
// ------------------ GET LAB BY ID ------------------
const getLabById = async (req, res) => {
    try {
        const { labId } = req.params;
        const labDetails = await LabModel.findById(labId);
        if (!labDetails)
            return res.status(404).json({ message: "Lab not found" });
        return res.status(200).json({ labDetails });
    }
    catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : "Server Error";
        return res.status(500).json({ message: errorMessage });
    }
};
// ------------------ UPDATE LAB PROFILE ------------------
const updateLabProfile = async (req, res) => {
    try {
        const { labId } = req.params;
        const updateData = req.body;
        const updatedLab = await LabModel.findByIdAndUpdate(labId, { $set: updateData }, { new: true });
        if (!updatedLab)
            return res.status(404).json({ message: "Lab not found" });
        return res
            .status(200)
            .json({ message: "Lab profile updated successfully", lab: updatedLab });
    }
    catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : "Server Error";
        return res.status(500).json({ message: errorMessage });
    }
};
// ------------------ GET ALL TESTS BY LABID ------------------
const getAllTestByLabId = async (req, res) => {
    try {
        const { labId } = req.params;
        const tests = await TestModel.find({ labId });
        if (!tests || tests.length === 0)
            return res.status(404).json({ message: "No tests found" });
        return res.status(200).json({ tests });
    }
    catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : "Server Error";
        return res.status(500).json({ message: errorMessage });
    }
};
// ------------------ UPDATE TEST ------------------
const updateLabTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const updateData = req.body;
        const updatedTest = await TestModel.findByIdAndUpdate(testId, updateData, { new: true });
        if (!updatedTest)
            return res.status(404).json({ message: "Test not found" });
        return res.status(200).json({ message: "Test updated successfully", updatedTest });
    }
    catch (err) {
        console.error("Error updating test:", err);
        const errorMessage = err instanceof Error ? err.message : "Server Error";
        return res.status(500).json({ message: errorMessage });
    }
};
// ------------------ DELETE TEST ------------------
const deleteLabTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const deletedTest = await TestModel.findByIdAndDelete(testId);
        if (!deletedTest)
            return res.status(404).json({ message: "Test not found" });
        return res.status(200).json({ message: "Test deleted successfully", deletedTest });
    }
    catch (err) {
        console.error("Error deleting test:", err);
        const errorMessage = err instanceof Error ? err.message : "Server Error";
        return res.status(500).json({ message: errorMessage });
    }
};
// ------------------ GET LAB PATIENTS ------------------
const getLabPatients = async (req, res) => {
    try {
        const { labId } = req.params;
        const testBookings = await LabTestBookingModel.find({ labId })
            .populate("userId", "fullName email mobileNumber")
            .lean();
        const packageBookings = await PackageBookingModel.find({ labId })
            .populate("userId", "fullName email mobileNumber")
            .populate("packageId", "packageName totalPrice")
            .lean();
        const formattedTestBookings = testBookings.map((b) => ({
            ...b,
            bookingType: "test",
        }));
        const formattedPackageBookings = packageBookings.map((b) => ({
            ...b,
            bookingType: "package",
            testName: b.packageId?.packageName || "Package Booking",
        }));
        const allBookings = [...formattedTestBookings, ...formattedPackageBookings].sort((a, b) => {
            const dateA = a.bookingDate ? new Date(a.bookingDate).getTime() : 0;
            const dateB = b.bookingDate ? new Date(b.bookingDate).getTime() : 0;
            return dateB - dateA; // latest first
        });
        return res.status(200).json({ labPatients: allBookings });
    }
    catch (err) {
        console.error("Error in getLabPatients:", err);
        return res.status(500).json({ message: "Server Error" });
    }
};
// ------------------ PACKAGE MANAGEMENT ------------------
const addLabPackage = async (req, res) => {
    try {
        const { labId, packageName, description, testIds, totalPrice } = req.body;
        if (!labId || !packageName || !Array.isArray(testIds) || testIds.length === 0 || !totalPrice) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const lab = await LabModel.findById(labId);
        if (!lab)
            return res.status(404).json({ message: "Lab not found" });
        const validTests = await TestModel.find({ _id: { $in: testIds }, labId });
        if (validTests.length !== testIds.length)
            return res.status(400).json({ message: "Some tests are invalid or not owned by this lab" });
        const newPackage = new LabPackageModel({
            packageName,
            description,
            labId,
            tests: testIds,
            totalPrice,
        });
        await newPackage.save();
        return res.status(200).json({ message: "Package created successfully", package: newPackage });
    }
    catch (err) {
        console.error("Error adding package:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to add package";
        return res.status(500).json({ message: errorMessage });
    }
};
const getAllPackagesByLabId = async (req, res) => {
    try {
        const { labId } = req.params;
        const packages = await LabPackageModel.find({ labId })
            .populate("tests", "testName price category")
            .lean();
        return res.status(200).json({ message: "Packages retrieved", packages });
    }
    catch (err) {
        console.error("Error fetching packages:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch packages";
        return res.status(500).json({ message: errorMessage });
    }
};
const updateLabPackage = async (req, res) => {
    try {
        const { packageId } = req.params;
        const { packageName, description, testIds, totalPrice } = req.body;
        const updatedPackage = await LabPackageModel.findByIdAndUpdate(packageId, { packageName, description, tests: testIds, totalPrice }, { new: true });
        if (!updatedPackage)
            return res.status(404).json({ message: "Package not found" });
        return res.status(200).json({ message: "Package updated successfully", package: updatedPackage });
    }
    catch (err) {
        console.error("Error updating package:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to update package";
        return res.status(500).json({ message: errorMessage });
    }
};
const deleteLabPackage = async (req, res) => {
    try {
        const { packageId } = req.params;
        const deletedPackage = await LabPackageModel.findByIdAndDelete(packageId);
        if (!deletedPackage)
            return res.status(404).json({ message: "Package not found" });
        return res.status(200).json({ message: "Package deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting package:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to delete package";
        return res.status(500).json({ message: errorMessage });
    }
};
// ✅ Get all available packages (from approved labs)
const getAllPackages = async (req, res) => {
    try {
        const approvedLabs = await LabModel.find({ status: "approved" }).select("_id name city state");
        const approvedLabIds = approvedLabs.map((lab) => lab._id);
        const packages = await LabPackageModel.find({ labId: { $in: approvedLabIds } })
            .populate("labId", "name city state")
            .populate("tests", "testName price category")
            .lean();
        const formattedPackages = packages.map((pkg) => ({
            _id: pkg._id,
            packageName: pkg.packageName,
            description: pkg.description,
            totalPrice: pkg.totalPrice,
            tests: pkg.tests,
            lab: pkg.labId
                ? {
                    name: pkg.labId.name,
                    city: pkg.labId.city,
                    state: pkg.labId.state,
                }
                : null,
        }));
        return res.status(200).json({
            message: "All available packages retrieved successfully",
            packages: formattedPackages,
        });
    }
    catch (err) {
        console.error("Error fetching all packages:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch packages";
        return res.status(500).json({ message: errorMessage });
    }
};
// ------------------ PACKAGE DETAILS ------------------
const getPackageDetailsById = async (req, res) => {
    try {
        const { packageId } = req.params;
        const packageDetails = await LabPackageModel.findById(packageId)
            .populate("tests", "testName price category description")
            .populate("labId", "name city state");
        if (!packageDetails)
            return res.status(404).json({ message: "Package not found" });
        return res.status(200).json({ message: "Package details fetched successfully", packageDetails });
    }
    catch (err) {
        console.error("Error fetching package details:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch package details";
        return res.status(500).json({ message: errorMessage });
    }
};
// ------------------ BOOK PACKAGE ------------------
const bookPackage = async (req, res) => {
    try {
        const { packageId, labId, patientId, bookingDate } = req.body;
        if (!packageId || !labId || !patientId || !bookingDate) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const labPackage = await LabPackageModel.findById(packageId);
        if (!labPackage)
            return res.status(404).json({ message: "Package not found" });
        const booking = new PackageBookingModel({
            packageId,
            labId,
            tests: labPackage.tests,
            userId: patientId,
            bookingDate: bookingDate,
            status: "pending",
        });
        await booking.save();
        return res.status(200).json({ message: "Package booked successfully", booking });
    }
    catch (err) {
        console.error("Error booking package:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to book package";
        return res.status(500).json({ message: errorMessage });
    }
};
const getPatientPackageBookings = async (req, res) => {
    try {
        const { patientId } = req.params;
        if (!patientId) {
            return res.status(400).json({ message: "Patient ID is required" });
        }
        const bookings = await PackageBookingModel.find({ userId: patientId })
            .populate("packageId")
            .populate("labId")
            .sort({ bookingDate: -1 }); // latest first
        if (!bookings.length) {
            return res.status(404).json({ message: "No bookings found for this patient" });
        }
        return res.status(200).json({
            message: "Bookings fetched successfully",
            count: bookings.length,
            bookings,
        });
    }
    catch (err) {
        console.error("Error fetching patient bookings:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch bookings";
        return res.status(500).json({ message: errorMessage });
    }
};
// ------------------ LAB AGENCY TEST BOOKING ------------------
const labBookTest = async (req, res) => {
    try {
        const { testId, patientId, fullName, gender, dob, mobileNumber, aadhar, bookingDate } = req.body;
        const labId = req.user?.id;
        if (!labId) {
            return res.status(401).json({ message: "Unauthorized. Lab ID not found in token." });
        }
        if (!testId || !bookingDate) {
            return res.status(400).json({ message: "Missing testId or bookingDate" });
        }
        const bookingDateObj = new Date(bookingDate);
        if (isNaN(bookingDateObj.getTime())) {
            return res.status(400).json({ message: "Invalid bookingDate format" });
        }
        const test = await TestModel.findById(testId);
        if (!test) {
            return res.status(404).json({ message: "Test not found" });
        }
        if (test.labId.toString() !== labId.toString()) {
            return res.status(403).json({ message: "Test does not belong to your lab" });
        }
        let patient;
        if (patientId) {
            patient = await patientModel.findById(patientId);
            if (!patient) {
                return res.status(404).json({ message: "Patient not found" });
            }
        }
        else {
            if (!fullName || !gender || !dob || !mobileNumber) {
                return res.status(400).json({ message: "Missing required patient details for new registration" });
            }
            patient = await patientModel.findOne({ mobileNumber, fullName });
            if (!patient && aadhar) {
                const aadharExists = await patientModel.findOne({ aadhar: String(aadhar) });
                if (aadharExists) {
                    patient = aadharExists;
                }
            }
            if (!patient) {
                patient = await patientModel.create({
                    fullName,
                    gender,
                    dob: new Date(dob),
                    mobileNumber,
                    ...(aadhar ? { aadhar: String(aadhar) } : {}),
                });
            }
        }
        const booking = await LabTestBookingModel.create({
            labId: new mongoose.Types.ObjectId(labId),
            userId: patient._id,
            testName: test.testName,
            category: test.category || "General",
            price: test.price || 0,
            status: "pending",
            bookingDate: bookingDateObj,
            bookedBy: "lab",
        });
        return res.status(201).json({
            message: "Test booked successfully by Lab Agency",
            booking,
            patient
        });
    }
    catch (err) {
        console.error("Error in labBookTest:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to book test by Lab Agency";
        return res.status(500).json({ message: errorMessage });
    }
};
// ------------------ LAB AGENCY PACKAGE BOOKING ------------------
const labBookPackage = async (req, res) => {
    try {
        const { packageId, patientId, fullName, gender, dob, mobileNumber, aadhar, bookingDate } = req.body;
        const labId = req.user?.id;
        if (!labId) {
            return res.status(401).json({ message: "Unauthorized. Lab ID not found in token." });
        }
        if (!packageId || !bookingDate) {
            return res.status(400).json({ message: "Missing packageId or bookingDate" });
        }
        const bookingDateObj = new Date(bookingDate);
        if (isNaN(bookingDateObj.getTime())) {
            return res.status(400).json({ message: "Invalid bookingDate format" });
        }
        const labPackage = await LabPackageModel.findById(packageId);
        if (!labPackage) {
            return res.status(404).json({ message: "Package not found" });
        }
        if (labPackage.labId.toString() !== labId.toString()) {
            return res.status(403).json({ message: "Package does not belong to your lab" });
        }
        let patient;
        if (patientId) {
            patient = await patientModel.findById(patientId);
            if (!patient) {
                return res.status(404).json({ message: "Patient not found" });
            }
        }
        else {
            if (!fullName || !gender || !dob || !mobileNumber) {
                return res.status(400).json({ message: "Missing required patient details for new registration" });
            }
            patient = await patientModel.findOne({ mobileNumber, fullName });
            if (!patient && aadhar) {
                const aadharExists = await patientModel.findOne({ aadhar: String(aadhar) });
                if (aadharExists) {
                    patient = aadharExists;
                }
            }
            if (!patient) {
                patient = await patientModel.create({
                    fullName,
                    gender,
                    dob: new Date(dob),
                    mobileNumber,
                    ...(aadhar ? { aadhar: String(aadhar) } : {}),
                });
            }
        }
        const booking = new PackageBookingModel({
            packageId,
            labId: new mongoose.Types.ObjectId(labId),
            tests: labPackage.tests,
            userId: patient._id,
            bookingDate: bookingDateObj,
            status: "pending",
            bookedBy: "lab",
        });
        await booking.save();
        return res.status(201).json({
            message: "Package booked successfully by Lab Agency",
            booking,
            patient
        });
    }
    catch (err) {
        console.error("Error in labBookPackage:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to book package by Lab Agency";
        return res.status(500).json({ message: errorMessage });
    }
};
// ------------------ LAB AGENCY TEST COMPLETION ------------------
const completeTestBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const file = req.file;
        const labId = req.user?.id;
        if (!labId) {
            return res.status(401).json({ message: "Unauthorized. Lab ID not found in token." });
        }
        const booking = await LabTestBookingModel.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (booking.labId.toString() !== labId.toString()) {
            return res.status(403).json({ message: "Access denied. Booking belongs to another lab." });
        }
        let reportUrl = booking.reportUrl;
        if (file) {
            reportUrl = await uploadToCloudinary(file.buffer, "lab/reports", file.mimetype === "application/pdf" ? "raw" : "image");
        }
        booking.status = "Delivered";
        if (reportUrl) {
            booking.reportUrl = reportUrl;
        }
        await booking.save();
        return res.status(200).json({
            message: "Test booking completed successfully",
            booking,
        });
    }
    catch (err) {
        console.error("Error completing test booking:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to complete test booking";
        return res.status(500).json({ message: errorMessage });
    }
};
// ------------------ LAB AGENCY PACKAGE COMPLETION ------------------
const completePackageBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const file = req.file;
        const labId = req.user?.id;
        if (!labId) {
            return res.status(401).json({ message: "Unauthorized. Lab ID not found in token." });
        }
        const booking = await PackageBookingModel.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (booking.labId.toString() !== labId.toString()) {
            return res.status(403).json({ message: "Access denied. Booking belongs to another lab." });
        }
        let reportUrl = booking.reportUrl;
        if (file) {
            reportUrl = await uploadToCloudinary(file.buffer, "lab/reports", file.mimetype === "application/pdf" ? "raw" : "image");
        }
        booking.status = "Delivered";
        if (reportUrl) {
            booking.reportUrl = reportUrl;
        }
        await booking.save();
        return res.status(200).json({
            message: "Package booking completed successfully",
            booking,
        });
    }
    catch (err) {
        console.error("Error completing package booking:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to complete package booking";
        return res.status(500).json({ message: errorMessage });
    }
};
// ------------------ EXPORTS ------------------
export default {
    labRegister,
    labLogin,
    getAllLabTests,
    addTest,
    addTestBooking,
    getLabById,
    updateLabProfile,
    getAllTestByLabId,
    updateLabTest,
    deleteLabTest,
    getLabPatients,
    addLabPackage,
    getAllPackagesByLabId,
    getAllPackages,
    updateLabPackage,
    deleteLabPackage,
    getPackageDetailsById,
    bookPackage,
    getPatientPackageBookings,
    labBookTest,
    labBookPackage,
    completeTestBooking,
    completePackageBooking
};
