

///////////////////// Manish Works (Fixed Version) ///////////////////////
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import {
  LabModel,
  LabTestBookingModel,
  TestModel,
  LabPackageModel,
  PackageBookingModel,
} from "../models/lab.model.js";

// ------------------ LAB REGISTER ------------------
const labRegister = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      state,
      address,
      city,
      pincode,
      timings,
      certificateNumber,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !state ||
      !address ||
      !city ||
      !pincode ||
      !timings ||
      !certificateNumber
    ) {
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
      email:trimmedEmail,
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
  } catch (err: unknown) {
    console.error("Lab Register Error:", err);
    const errorMessage = err instanceof Error ? err.message : "Lab Register Failed";
    return res.status(500).json({ message: errorMessage });
  }
};

// ------------------ LAB LOGIN ------------------
const labLogin = async (req: Request, res: Response) => {
  try {
    const { labId, password } = req.body;
    const lab = await LabModel.findOne({ labId });

    if (!lab) return res.status(400).json({ message: "Lab not found" });
    if (lab.status !== "approved")
      return res.status(403).json({ message: "Lab not approved yet" });

    const isMatch = await bcrypt.compare(password, lab.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: lab._id, labId: lab.labId, email: lab.email, role: "lab" },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login Successful",
      token,
      lab: { _id: lab._id, labId: lab.labId, name: lab.name, email: lab.email },
    });
  } catch (err: unknown) {
    console.error("Error logging in lab:", err);
    const errorMessage = err instanceof Error ? err.message : "Server error";
    return res.status(500).json({ message: errorMessage });
  }
};

// ------------------ GET ALL LAB TESTS ------------------
const getAllLabTests = async (req: Request, res: Response) => {
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
      labName: (test.labId as any)?.name || "Unknown Lab",
      labId: (test.labId as any)?._id,
    }));

    return res.status(200).json(formattedTests);
  } catch (err: unknown) {
    console.error("Error fetching all lab tests:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch tests";
    return res.status(500).json({ message: errorMessage });
  }
};

// ------------------ BOOK A TEST ------------------
const addTestBooking = async (req: Request, res: Response) => {
  try {
    const { test, patientId } = req.body;

    if (!test || !patientId) {
      return res.status(400).json({ message: "Missing test or patientId" });
    }

    if (!test.labId || !test.name) {
      return res.status(400).json({ message: "Invalid test data" });
    }

    const lab = await LabModel.findById(test.labId);
    if (!lab) return res.status(404).json({ message: "Lab not found" });

    const booking = await LabTestBookingModel.create({
      labId: lab._id,
      userId: new mongoose.Types.ObjectId(patientId),
      testName: test.name,
      category: test.category || "General",
      price: test.price || 0,
      status: "pending",
      bookedAt: new Date(),
    });

    return res.status(200).json({ message: "Test booked successfully", booking });
  } catch (err: unknown) {
    console.error("Error booking test:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to book test";
    return res.status(500).json({ message: errorMessage });
  }
};

// ------------------ ADD LAB TEST ------------------
const addTest = async (req: Request, res: Response) => {
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
  } catch (err: unknown) {
    console.error("Error Adding Tests:", err);
    const errorMessage = err instanceof Error ? err.message : "Error Adding Tests";
    return res.status(500).json({ message: errorMessage });
  }
};

// ------------------ GET LAB BY ID ------------------
const getLabById = async (req: Request, res: Response) => {
  try {
    const { labId } = req.params;
    const labDetails = await LabModel.findById(labId);

    if (!labDetails) return res.status(404).json({ message: "Lab not found" });
    return res.status(200).json({ labDetails });
  } catch (err: unknown) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : "Server Error";
    return res.status(500).json({ message: errorMessage });
  }
};

// ------------------ UPDATE LAB PROFILE ------------------
const updateLabProfile = async (req: Request, res: Response) => {
  try {
    const { labId } = req.params;
    const updateData = req.body;

    const updatedLab = await LabModel.findByIdAndUpdate(labId, { $set: updateData }, { new: true });
    if (!updatedLab) return res.status(404).json({ message: "Lab not found" });

    return res
      .status(200)
      .json({ message: "Lab profile updated successfully", lab: updatedLab });
  } catch (err: unknown) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : "Server Error";
    return res.status(500).json({ message: errorMessage });
  }
};

// ------------------ GET ALL TESTS BY LABID ------------------
const getAllTestByLabId = async (req: Request, res: Response) => {
  try {
    const { labId } = req.params;
    const tests = await TestModel.find({ labId });

    if (!tests || tests.length === 0)
      return res.status(404).json({ message: "No tests found" });
    return res.status(200).json({ tests });
  } catch (err: unknown) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : "Server Error";
    return res.status(500).json({ message: errorMessage });
  }
};

// ------------------ UPDATE TEST ------------------
const updateLabTest = async (req: Request, res: Response) => {
  try {
    const { testId } = req.params;
    const updateData = req.body;

    const updatedTest = await TestModel.findByIdAndUpdate(testId, updateData, { new: true });
    if (!updatedTest) return res.status(404).json({ message: "Test not found" });

    return res.status(200).json({ message: "Test updated successfully", updatedTest });
  } catch (err: unknown) {
    console.error("Error updating test:", err);
    const errorMessage = err instanceof Error ? err.message : "Server Error";
    return res.status(500).json({ message: errorMessage });
  }
};

// ------------------ DELETE TEST ------------------
const deleteLabTest = async (req: Request, res: Response) => {
  try {
    const { testId } = req.params;
    const deletedTest = await TestModel.findByIdAndDelete(testId);

    if (!deletedTest) return res.status(404).json({ message: "Test not found" });
    return res.status(200).json({ message: "Test deleted successfully", deletedTest });
  } catch (err: unknown) {
    console.error("Error deleting test:", err);
    const errorMessage = err instanceof Error ? err.message : "Server Error";
    return res.status(500).json({ message: errorMessage });
  }
};

// ------------------ GET LAB PATIENTS ------------------
const getLabPatients = async (req: Request, res: Response) => {
  try {
    const { labId } = req.params;
    const bookings = await LabTestBookingModel.find({ labId })
      .populate("userId", "fullName email")
      .lean();

    return res.status(200).json({ labPatients: bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// ------------------ PACKAGE MANAGEMENT ------------------

const addLabPackage = async (req: Request, res: Response) => {
  try {
    const { labId, packageName, description, testIds, totalPrice } = req.body;

    if (!labId || !packageName || !Array.isArray(testIds) || testIds.length === 0 || !totalPrice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const lab = await LabModel.findById(labId);
    if (!lab) return res.status(404).json({ message: "Lab not found" });

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
  } catch (err: unknown) {
    console.error("Error adding package:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to add package";
    return res.status(500).json({ message: errorMessage });
  }
};

const getAllPackagesByLabId = async (req: Request, res: Response) => {
  try {
    const { labId } = req.params;
    const packages = await LabPackageModel.find({ labId })
      .populate("tests", "testName price category")
      .lean();

    return res.status(200).json({ message: "Packages retrieved", packages });
  } catch (err: unknown) {
    console.error("Error fetching packages:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch packages";
    return res.status(500).json({ message: errorMessage });
  }
};

const updateLabPackage = async (req: Request, res: Response) => {
  try {
    const { packageId } = req.params;
    const { packageName, description, testIds, totalPrice } = req.body;

    const updatedPackage = await LabPackageModel.findByIdAndUpdate(
      packageId,
      { packageName, description, tests: testIds, totalPrice },
      { new: true }
    );

    if (!updatedPackage) return res.status(404).json({ message: "Package not found" });
    return res.status(200).json({ message: "Package updated successfully", package: updatedPackage });
  } catch (err: unknown) {
    console.error("Error updating package:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to update package";
    return res.status(500).json({ message: errorMessage });
  }
};

const deleteLabPackage = async (req: Request, res: Response) => {
  try {
    const { packageId } = req.params;
    const deletedPackage = await LabPackageModel.findByIdAndDelete(packageId);

    if (!deletedPackage) return res.status(404).json({ message: "Package not found" });
    return res.status(200).json({ message: "Package deleted successfully" });
  } catch (err: unknown) {
    console.error("Error deleting package:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to delete package";
    return res.status(500).json({ message: errorMessage });
  }
};

// ✅ Get all available packages (from approved labs)
const getAllPackages = async (req: Request, res: Response) => {
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
            name: (pkg.labId as any).name,
            city: (pkg.labId as any).city,
            state: (pkg.labId as any).state,
          }
        : null,
    }));

    return res.status(200).json({
      message: "All available packages retrieved successfully",
      packages: formattedPackages,
    });
  } catch (err: unknown) {
    console.error("Error fetching all packages:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch packages";
    return res.status(500).json({ message: errorMessage });
  }
};

// ------------------ PACKAGE DETAILS ------------------
const getPackageDetailsById = async (req: Request, res: Response) => {
  try {
    const { packageId } = req.params;
    const packageDetails = await LabPackageModel.findById(packageId)
      .populate("tests", "testName price category description")
      .populate("labId", "name city state");

    if (!packageDetails) return res.status(404).json({ message: "Package not found" });
    return res.status(200).json({ message: "Package details fetched successfully", packageDetails });
  } catch (err) {
    console.error("Error fetching package details:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch package details";
    return res.status(500).json({ message: errorMessage });
  }
};

// ------------------ BOOK PACKAGE ------------------
const bookPackage = async (req: Request, res: Response) => {
  try {
    const { packageId, labId, patientId } = req.body;

    if (!packageId || !labId || !patientId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const labPackage = await LabPackageModel.findById(packageId);
    if (!labPackage) return res.status(404).json({ message: "Package not found" });

    const booking = new PackageBookingModel({
      packageId,
      labId,
      tests: labPackage.tests,
      userId: patientId,
      bookingDate: new Date(),
      status: "pending",
    });
    await booking.save();

    return res.status(200).json({ message: "Package booked successfully", booking });
  } catch (err) {
    console.error("Error booking package:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to book package";
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
};
