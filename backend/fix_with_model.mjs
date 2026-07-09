import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
dotenv.config();

import clinicModel from "./src/models/clinic.model.js";
import subscriptionPlanModel from "./src/models/subscriptionPlan.model.js";

async function run() {
  await mongoose.connect(process.env.MONGO_ATLAS_URI);
  
  const enterprise = await subscriptionPlanModel.findOne({ name: "Enterprise" });
  if (!enterprise) {
    console.log("Enterprise plan not found");
    process.exit(1);
  }

  const clinics = await clinicModel.find({ status: { $in: ["approved", "active"] } });
  let count = 0;
  for (const c of clinics) {
    if (!c.allowedFeatures || c.allowedFeatures.length < enterprise.features.length) {
      c.subscriptionPlan = enterprise._id;
      c.allowedFeatures = enterprise.features;
      await c.save();
      console.log(`Updated clinic: ${c.clinicName}`);
      count++;
    }
  }
  
  console.log(`Fixed ${count} clinics`);
  process.exit(0);
}

run();
