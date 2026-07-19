const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://developersujal4_db_user:SqHHBWi1wGZMk8QO@cluster0.7ahj462.mongodb.net/?appName=Cluster0')
  .then(async () => {
    try {
      const db = mongoose.connection.db;
      
      // Update the Enterprise plan in case my previous Mongoose model script missed something
      await db.collection('subscriptionplans').updateOne(
        { name: 'Enterprise' },
        { $addToSet: { features: { $each: ["Audit Logs", "Referrals"] } } }
      );

      const plan = await db.collection('subscriptionplans').findOne({ name: 'Enterprise' });
      console.log('Enterprise Plan Features:', plan.features);

      // Now sync this feature list to ALL clinics that have this plan (or just the specific one)
      const res = await db.collection('Clinic').updateMany(
        { subscriptionPlan: plan._id },
        { $set: { allowedFeatures: plan.features } }
      );
      
      console.log('Updated Clinics Count:', res.modifiedCount);

      // specifically update the user's clinic just in case
      const res2 = await db.collection('Clinic').updateOne(
        { _id: new mongoose.Types.ObjectId('6a350f0f22efb1e2b7567b66') },
        { $set: { allowedFeatures: plan.features } }
      );
      console.log('User Clinic Updated:', res2.modifiedCount);

      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
