import bcrypt from "bcryptjs";
import AdminModel from "../models/adminModel.js";
import { randomBytes } from "crypto";
export const createDefaultAdmin = async () => {
    const existingAdmin = await AdminModel.findOne();
    if (existingAdmin) {
        console.log("Admin already exists");
        return;
    }
    const adminId = "admin" + Math.floor(Math.random() * 1000);
    const password = "123456";
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new AdminModel({
        adminId,
        password: hashedPassword,
    });
    await newAdmin.save();
    console.log(`Default admin created with ID: ${adminId} and Password: ${password}`);
};
//# sourceMappingURL=createDefaultAdmin.js.map