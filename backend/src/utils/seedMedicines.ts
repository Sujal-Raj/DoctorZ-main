import MasterMedicineModel from "../models/masterMedicine.model.js";

const drugs = [
  "Paracetamol", "Dolo", "Amoxicillin", "Azithromycin", "Pantocid", "Pantoprazole", "Cetirizine", 
  "Levocetirizine", "Metformin", "Atorvastatin", "Amlodipine", "Ibuprofen", "Diclofenac", "Ondansetron", 
  "Domperidone", "Rabeprazole", "Telmisartan", "Losartan", "Ciprofloxacin", "Ofloxacin", "Norfloxacin", 
  "Montelukast", "Fexofenadine", "Ranitidine", "Famotidine", "Omeprazole", "Esomeprazole", "Clopidogrel", 
  "Aspirin", "Rosuvastatin", "Glimepiride", "Pioglitazone", "Sitagliptin", "Vildagliptin", "Salbutamol", 
  "Levosalbutamol", "Ipratropium", "Budesonide", "Fluticasone", "Prednisolone", "Methylprednisolone", 
  "Dexamethasone", "Hydrocortisone", "Fluconazole", "Itraconazole", "Ketoconazole", "Terbinafine", 
  "Griseofulvin", "Aciclovir", "Valaciclovir", "Oseltamivir", "Albendazole", "Ivermectin", "Metronidazole", 
  "Ornidazole", "Tinidazole", "Doxycycline", "Minocycline", "Ceftriaxone", "Cefotaxime", "Cefixime", 
  "Cefpodoxime", "Cefuroxime", "Cephalexin", "Cefadroxil", "Amikacin", "Gentamicin", "Neomycin", 
  "Polymyxin B", "Bacitracin", "Mupirocin", "Clindamycin", "Erythromycin", "Roxithromycin", "Clarithromycin", 
  "Linezolid", "Vancomycin", "Teicoplanin", "Meropenem", "Imipenem", "Ertapenem", "Piperacillin", 
  "Tazobactam", "Ampicillin", "Cloxacillin", "Penicillin", "Streptomycin", "Kanamycin", "Tobramycin", 
  "Netilmicin", "Framycetin", "Silver Sulfadiazine", "Povidone Iodine", "Chlorhexidine", "Multivitamin",
  "B-Complex", "Calcium Carbonate", "Vitamin D3", "Vitamin C", "Zinc Sulphate", "Iron & Folic Acid"
];

const formulations = [
  { name: "Tablet", strengths: ["5mg", "10mg", "20mg", "50mg", "100mg", "250mg", "500mg", "650mg", "800mg"] },
  { name: "Capsule", strengths: ["100mg", "250mg", "400mg", "500mg"] },
  { name: "Syrup", strengths: ["60ml", "100ml", "200ml"] },
  { name: "Suspension", strengths: ["60ml", "100ml"] },
  { name: "Injection", strengths: ["1ml", "2ml", "5ml", "10ml"] },
  { name: "Drops", strengths: ["10ml", "15ml"] },
  { name: "Cream", strengths: ["10g", "20g", "30g"] },
  { name: "Ointment", strengths: ["10g", "20g"] },
  { name: "Inhaler", strengths: ["120 MDI", "200 MDI"] }
];

export default async function seedMasterMedicines() {
  try {
    const count = await MasterMedicineModel.countDocuments();
    if (count > 0) {
      console.log(`Master medicines already seeded (${count} records). Skipping seeding.`);
      return;
    }

    console.log("Seeding Master Medicines...");
    const masterList: any[] = [];

    // Generate ~1500 unique records systematically
    for (const drug of drugs) {
      for (const form of formulations) {
        for (const str of form.strengths) {
          const medName = `${drug} ${str} ${form.name}`;
          // Generate composition description
          const composition = `${drug} active ingredient.`;
          
          masterList.push({
            name: medName,
            type: form.name,
            composition: composition,
            dosage: form.name === "Tablet" || form.name === "Capsule" ? "1-0-1" : "5ml twice daily"
          });

          // Break early if we exceed 1600 records to keep list bounded
          if (masterList.length >= 1550) break;
        }
        if (masterList.length >= 1550) break;
      }
      if (masterList.length >= 1550) break;
    }

    await MasterMedicineModel.insertMany(masterList, { ordered: false });
    console.log(`Successfully seeded ${masterList.length} Master Medicines into database!`);
  } catch (error) {
    console.error("Error seeding master medicines:", error);
  }
}
