import mongoose, { Schema } from "mongoose";

export interface IMedicine extends Document{
  name:string;
  dosage:string;
  quantity?:string;
}
export interface IPrescription extends Document{
  doctorId:mongoose.Schema.Types.ObjectId | string;
  patientAadhar:string;
  bookingId:mongoose.Types.ObjectId | string;
  diagnosis:string;
  symptoms:string[];
  medicines:IMedicine[];
  recommendedTests?:string[];
  pdfUrl?:string;
   notes?:string;

}

const MedicineSchema = new Schema<IMedicine>(
  {
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    
    quantity: { type: String },
  }
);
const PrescriptionSchema=new Schema<IPrescription>({
  doctorId:{
    type:Schema.Types.ObjectId,
    ref:"Doctor",
    required:true
  },
  patientAadhar:{
    type:String,
    required:true

  },
  bookingId:{
    type:Schema.Types.ObjectId,
    ref:"Booking",
  },

diagnosis: { type: String, required: true },
    symptoms: { type: [String], default: [] },

    medicines: { type: [MedicineSchema], required: true },

    recommendedTests: { type: [String], default: [] },
    notes:{type:String},
    pdfUrl:{type:String}


})
const PrescriptionModel=mongoose.model<IPrescription>(
  "Prescription",
  PrescriptionSchema
)
export default PrescriptionModel;