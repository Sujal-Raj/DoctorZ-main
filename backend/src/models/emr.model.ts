import mongoose, { Document, Schema } from "mongoose";

export interface IEMR extends Document {

  doctorId: mongoose.Types.ObjectId;
  aadhar?: number;
  allergies?: string[];
  diseases?: string[];
  pastSurgeries?: string[];
  currentMedications?: string[];

  reports?: string[];               // file URLs / paths
  prescriptionId?: mongoose.Types.ObjectId[];

 
}

const emrSchema = new mongoose.Schema<IEMR>(
  {
   

    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
      
    },
    aadhar: {
      type: Number,
      default: null,
    },

    allergies: {
      type: [String],
      default: [],
      
    },

    diseases: {
      type: [String],
      default: [],
    },

    pastSurgeries: {
      type: [String],
      default: [],
    },

    currentMedications: {
      type: [String],
      default: [],
    },

    reports: {
      type: [String],       // stored as file URL path
      default: [],
    },

    prescriptionId: {
      type: [Schema.Types.ObjectId],
      ref: "Prescription",
      default: [],
    },

  
  },
  { timestamps: true }
);

const EMRModel = mongoose.model<IEMR>("EMR", emrSchema, "EMR");

export default EMRModel;
