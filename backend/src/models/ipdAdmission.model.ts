import mongoose, { Document, Schema } from "mongoose";

export interface INursingNote {
  date: Date;
  note: string;
  recordedBy: string;
}

export interface IVitalRecord {
  date: Date;
  bp: string; // e.g. "120/80"
  temp: number; // e.g. 98.6
  heartRate: number; // e.g. 72
  spo2: number; // e.g. 98
  recordedBy: string;
}

export interface IMARRecord {
  date: Date;
  medicineName: string;
  dosage: string; // e.g. "500mg"
  status: "Given" | "Missed";
  administeredBy: string;
}

export interface IIPDAdmission extends Document {
  clinicId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId; // References Patient
  doctorId: mongoose.Types.ObjectId;   // Admitting doctor, references Doctor
  wardId: mongoose.Types.ObjectId;     // References Ward
  bedNumber: string;
  admissionDate: Date;
  dischargeDate?: Date;
  reasonForAdmission: string;
  emergencyContact: {
    name: string;
    relation: string;
    contact: string;
  };
  initialDeposit: number;
  status: "Admitted" | "Discharged";

  // Clinical records during stay
  nursingNotes?: INursingNote[];
  vitals?: IVitalRecord[];
  mar?: IMARRecord[];
  
  dischargeSummary?: {
    date: Date;
    conditionAtDischarge: string;
    advice: string;
    followUpDate?: Date;
  };
}

const nursingNoteSchema = new Schema<INursingNote>({
  date: { type: Date, default: Date.now },
  note: { type: String, required: true },
  recordedBy: { type: String, required: true },
});

const vitalRecordSchema = new Schema<IVitalRecord>({
  date: { type: Date, default: Date.now },
  bp: { type: String, required: true },
  temp: { type: Number, required: true },
  heartRate: { type: Number, required: true },
  spo2: { type: Number, required: true },
  recordedBy: { type: String, required: true },
});

const marRecordSchema = new Schema<IMARRecord>({
  date: { type: Date, default: Date.now },
  medicineName: { type: String, required: true },
  dosage: { type: String, required: true },
  status: { type: String, enum: ["Given", "Missed"], default: "Given", required: true },
  administeredBy: { type: String, required: true },
});

const ipdAdmissionSchema = new Schema<IIPDAdmission>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    wardId: { type: Schema.Types.ObjectId, ref: "Ward", required: true },
    bedNumber: { type: String, required: true },
    admissionDate: { type: Date, default: Date.now },
    dischargeDate: { type: Date },
    reasonForAdmission: { type: String, required: true },
    emergencyContact: {
      name: { type: String, required: true },
      relation: { type: String, required: true },
      contact: { type: String, required: true },
    },
    initialDeposit: { type: Number, default: 0 },
    status: { type: String, enum: ["Admitted", "Discharged"], default: "Admitted", required: true },
    
    nursingNotes: [nursingNoteSchema],
    vitals: [vitalRecordSchema],
    mar: [marRecordSchema],
    
    dischargeSummary: {
      date: { type: Date },
      conditionAtDischarge: { type: String },
      advice: { type: String },
      followUpDate: { type: Date },
    },
  },
  { timestamps: true }
);

const ipdAdmissionModel = mongoose.model<IIPDAdmission>("IPDAdmission", ipdAdmissionSchema);
export default ipdAdmissionModel;
