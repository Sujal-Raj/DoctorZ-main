import EMRModel from "../models/emr.model.js";
import patientModel from "../models/patient.model.js";
export const createEMR = async (req, res) => {
    try {
        const body = req.body;
        const files = req.files;
        console.log("📩 Received EMR body:", body);
        const { patientId, doctorId } = body;
        const patient = await patientModel.findById(patientId);
        if (!patient) {
            return res.status(400).json({ message: "Patient ID is required" });
        }
        // ✅ Safely parse arrays
        const safeParse = (value) => {
            try {
                if (!value)
                    return [];
                if (Array.isArray(value))
                    return value; // already array
                return JSON.parse(value);
            }
            catch {
                return []; // fallback if JSON.parse fails
            }
        };
        // Arrays
        const allergies = safeParse(body.allergies || "[]");
        const diseases = safeParse(body.diseases || "[]");
        const pastSurgeries = safeParse(body.pastSurgeries || "[]");
        const currentMedications = safeParse(body.currentMedications || "[]");
        const reportUrls = files?.length > 0
            ? files.map((f) => `/uploads/${f.filename}`)
            : [];
        // ✅ Create new EMR
        const emr = await EMRModel.create({
            aadhar: Number(body.aadhar),
            doctorId,
            allergies,
            diseases,
            pastSurgeries,
            currentMedications,
            reports: reportUrls,
        });
        return res.status(201).json({
            message: "EMR created successfully",
            emr,
        });
    }
    catch (error) {
        console.log("Create EMR Error:", error);
        return res.status(500).json({ message: "Error creating EMR" });
    }
};
// export const getEMRByPatientId = async (req: Request, res: Response) => {
//   try {
//     const { patientId } = req.params;
//     if (!patientId) {
//       return res.status(400).json({ message: "Patient ID is required" });
//     }
//     const emrs = await EMRModel.find({ patientId }).sort({ createdAt: -1 });
//     if (!emrs || emrs.length === 0) {
//       return res.status(404).json({ message: "No EMR records found" });
//     }
//     return res.status(200).json({
//       message: "EMR records fetched successfully",
//       data: emrs,
//     });
//   } catch (error) {
//     console.log("Error fetching EMR:", error);
//     return res.status(500).json({ message: "Error fetching EMR data" });
//   }
// };
// // ✅ Get EMR by emrId
// export const getEMRById = async (req: Request, res: Response) => {
//   try {
//     const { emrId } = req.params;
//     if (!emrId) {
//       return res.status(400).json({ message: "EMR ID is required" });
//     }
//     const emr = await EMRModel.findById(emrId);
//     if (!emr) {
//       return res.status(404).json({ message: "EMR not found" });
//     }
//     return res.status(200).json({
//       message: "EMR fetched successfully",
//       data: emr,
//     });
//   } catch (error) {
//     console.error("Error fetching EMR by ID:", error);
//     return res.status(500).json({ message: "Error fetching EMR" });
//   }
// };
export const getEMRByAadhar = async (req, res) => {
    try {
        const { aadhar } = req.params;
        if (!aadhar) {
            return res.status(400).json({ message: "Aadhar number is required" });
        }
        // find all EMRs that match this Aadhar number
        const emrRecords = await EMRModel.find({ aadhar }).sort({ createdAt: -1 });
        if (!emrRecords || emrRecords.length === 0) {
            return res.status(404).json({ message: "No EMR found for this Aadhar number" });
        }
        return res.status(200).json({
            message: "EMR records fetched successfully",
            emr: emrRecords,
        });
    }
    catch (error) {
        console.error("Error fetching EMR by Aadhar:", error);
        return res.status(500).json({ message: "Error fetching EMR by Aadhar" });
    }
};
//# sourceMappingURL=emr.controller.js.map