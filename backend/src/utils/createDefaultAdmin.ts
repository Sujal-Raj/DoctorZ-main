import bcrypt from "bcryptjs";
import AdminModel from "../models/adminModel.js";
import { randomBytes } from "crypto";

export const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await AdminModel.findOne();
    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const adminId = `admin_${randomBytes(3).toString("hex")}`;
    const password = "123456";

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await AdminModel.create({
      adminId,
      password: hashedPassword,
    });

    console.log(
      `Default admin created:\n` +
      `  ID: ${adminId}\n` +
      `  Password: ${password}`
    );
  } catch (err) {
    console.error("Error creating default admin:", err);
  }
};
