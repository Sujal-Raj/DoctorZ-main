import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function runMigration() {
  const uri = process.env.MONGO_ATLAS_URI + "DoctorZ";
  await mongoose.connect(uri);
  console.log("Connected to", uri);
  
  const enterprise = await mongoose.connection.collection("subscriptionplans").findOne({ name: "Enterprise" });
  if (!enterprise) {
    console.error("Enterprise plan not found");
    process.exit(1);
  }

  // Find clinics that are active or approved
  const clinics = await mongoose.connection.collection("clinics").find({ status: { $in: ["approved", "active"] } }).toArray();
  let fixedCount = 0;

  for (const c of clinics) {
    // If they have less features than the full Enterprise set, OR if they are marked as Enterprise but lack features
    if (!c.allowedFeatures || c.allowedFeatures.length < enterprise.features.length) {
      await mongoose.connection.collection("clinics").updateOne(
        { _id: c._id },
        { 
          $set: { 
            subscriptionPlan: enterprise._id,
            allowedFeatures: enterprise.features 
          } 
        }
      );
      console.log(`Hydrated Enterprise features for ${c.clinicName}`);
      fixedCount++;
    }
  }

  console.log(`Migration Complete. Fixed ${fixedCount} active clinics.`);
  process.exit(0);
}

runMigration();
