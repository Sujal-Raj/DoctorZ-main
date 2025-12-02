import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import patientModel from "../models/patient.model.js";
import path from "path";


console.log(process.env.NODE_ENV);
console.log(process.env.MONGO_DEVELOPMENT_URI, process.env.MONGO_ATLAS_URI)
let MONGO_URI;

if(process.env.NODE_ENV == "development"){
  MONGO_URI = process.env.MONGO_DEVELOPMENT_URI;
}
else{
  MONGO_URI = process.env.MONGO_ATLAS_URI;
};

console.log(MONGO_URI)
const dbConnect = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }
    await mongoose.connect(MONGO_URI);
    console.log("Database Connected");
  } catch (error) {
    console.log(error);
    console.log("Database not connected");
  }
};


console.log("Loaded ENV PATH:", path.resolve(process.cwd(), ".env"));
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MONGO_ATLAS_URI:", process.env.MONGO_ATLAS_URI);

//------This is just to test-----
const testPatientModel = async () => {
  try {
    const testPatient = new patientModel({
      fullName: "Test User",
      gender: "Male",
      dob: new Date("1990-01-01"),
      mobileNumber: 9876543210,
      Aadhar: 123456789012,
      address: {
        city: "Mumbai",
        pincode: 400001,
      },
      abhaId: "ABHA123456",
      emergencyContact: {
        name: "John Doe",
        number: 9123456789,
      },
    });

    const savedPatient = await testPatient.save();
    console.log("🧪 Test patient saved:", savedPatient.fullName);
  } catch (error) {
    console.error("⚠️ Error saving test patient:", error);
  }
};

export default dbConnect;


// import dotenv from "dotenv";
// import mongoose from "mongoose";

// dotenv.config();

// let MONGO_URI: string | undefined;

// if (process.env.NODE_ENV === "development") {
//   MONGO_URI = process.env.MONGO_DEVELOPMENT_URI;
// } else {
//   MONGO_URI = process.env.MONGO_ATLAS_URI;
// }

// // fallback
// if (!MONGO_URI) {
//   MONGO_URI = "mongodb://127.0.0.1:27017/DoctorZ";
// }

// const dbConnect = async (): Promise<void> => {
//   try {
//     console.log("🧩 Connecting to MongoDB...");

//     await mongoose.connect(MONGO_URI);

//     console.log("✅ Database Connected Successfully");
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       console.error("❌ Database Connection Failed:", error.message);
//     } else {
//       console.error("❌ Unknown Database Error:", error);
//     }
//   }
// };

// export default dbConnect;
