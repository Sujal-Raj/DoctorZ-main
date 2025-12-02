import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "../models/adminModel.js"; // adjust the path as needed

dotenv.config(); // Load .env variables

async function seedAdmin(): Promise<void> {
  try {
    const mongoUri = process.env.MONGO_URI;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!mongoUri) throw new Error("MONGO_URI is not defined.");
    if (!adminEmail) throw new Error("ADMIN_EMAIL is not defined.");
    if (!adminPassword) throw new Error("ADMIN_PASSWORD is not defined.");

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    const existing = await Admin.findOne({ email: adminEmail });

    if (existing) {
      console.log("Admin already exists");
      process.exit(0);
    }

    await Admin.create({
      name: "Super Admin",
      email: adminEmail,
      password: adminPassword,
    });

    console.log("Admin seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin:", err);
    process.exit(1);
  }
}

seedAdmin();
