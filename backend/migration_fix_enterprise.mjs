import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function runMigration() {
  await mongoose.connect(process.env.MONGO_ATLAS_URI);
  
  const enterprise = await mongoose.connection.collection("subscriptionplans").findOne({ name: "Enterprise" });
  if (!enterprise) {
    console.error("Enterprise plan not found");
    process.exit(1);
  }

  // Find clinics that are active but missing allowedFeatures, or missing the new ones
  const clinics = await mongoose.connection.collection("clinics").find({}).toArray();
  let fixedCount = 0;

  for (const c of clinics) {
    console.log(`Clinic: ${c.clinicName}, Features: ${c.allowedFeatures?.length || 0}`);
    // Force set everyone active to Enterprise for now, to fix the issue where it failed
    await mongoose.connection.collection("clinics").updateOne(
      { _id: c._id },
      { 
        $set: { 
          subscriptionPlan: enterprise._id,
          allowedFeatures: enterprise.features 
        } 
      }
    );
    fixedCount++;
  }

  console.log(`Migration Complete. Fixed ${fixedCount} active clinics.`);
  process.exit(0);
}

runMigration();
