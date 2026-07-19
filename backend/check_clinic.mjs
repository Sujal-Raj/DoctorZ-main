import mongoose from 'mongoose';

(async () => {
  try {
    await mongoose.connect('mongodb+srv://developersujal4_db_user:SqHHBWi1wGZMk8QO@cluster0.7ahj462.mongodb.net/?appName=Cluster0');
    console.log('DB Connected');
    
    // dynamically import the model to avoid ts issues
    const { default: clinicModel } = await import('file:///c:/Users/kumar/Desktop/zager/DocterZ/DoctorZ-main/backend/dist/models/clinic.model.js');
    const { default: subscriptionPlanModel } = await import('file:///c:/Users/kumar/Desktop/zager/DocterZ/DoctorZ-main/backend/dist/models/subscriptionPlan.model.js');

    const clinic = await clinicModel.findById('6a350f0f22efb1e2b7567b66').populate('subscriptionPlan');
    if (!clinic) {
      console.log('Clinic not found!');
      process.exit(1);
    }
    
    console.log('Clinic Name:', clinic.clinicName);
    console.log('Plan:', clinic.subscriptionPlan);
    if(clinic.subscriptionPlan) {
      console.log('Features:', clinic.subscriptionPlan.features);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
