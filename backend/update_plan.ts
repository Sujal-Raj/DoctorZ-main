import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import subscriptionPlanModel from "./src/models/subscriptionPlan.model.js";

const updatePlan = async () => {
  try {
    await mongoose.connect(process.env.MONGO_ATLAS_URI as string);
    console.log("Connected to DB");

    const plan = await subscriptionPlanModel.findOne({ name: { $regex: /Enterprise/i } });
    if (!plan) {
      console.log("Enterprise plan not found!");
      process.exit(1);
    }

    let modified = false;
    if (!plan.features.includes("Audit Logs")) {
      plan.features.push("Audit Logs");
      modified = true;
    }
    if (!plan.features.includes("Referrals")) {
      plan.features.push("Referrals");
      modified = true;
    }

    if (modified) {
      await plan.save();
      console.log("Updated Enterprise plan features:", plan.features);
    } else {
      console.log("Plan already has the features:", plan.features);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

updatePlan();
