import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { X } from "lucide-react";
import api from "../../Services/mainApi";
import Swal from "sweetalert2";

// JSON Files
import medicineData from "../../assets/indian_medicine_data.json";
import diseaseData from "../../assets/Disease_symptom_dataset.json";
import symptomData from "../../assets/symptoms.json";

interface Medicine {
  name: string;
  dosage: string;
  quantity?: string;
}

const PrescriptionForm = () => {
  const { bookingId, patientAadhar } = useParams();
  const doctorId = localStorage.getItem("doctorId");
  const { state } = useLocation();
  const name = state?.name;
  const gender = state?.gender;

  // Diagnosis
  const [diagnosisInput, setDiagnosisInput] = useState("");
  const [allDiseases, setAllDiseases] = useState<string[]>([]);
  const [filteredDiseases, setFilteredDiseases] = useState<string[]>([]);
  const [showDiseaseSuggestions, setShowDiseaseSuggestions] = useState(false);

  // Symptoms
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState("");

  const [allSymptoms, setAllSymptoms] = useState<string[]>([]);

  const [filteredSymptoms, setFilteredSymptoms] = useState<string[]>([]);
  const [showSymptoms, setShowSymptoms] = useState(false);

  // Tests
  const [tests, setTests] = useState<string[]>([]);
  const [testInput, setTestInput] = useState("");

  // Medicine
  const [medicineName, setMedicineName] = useState("");
  const [medicineDosage, setMedicineDosage] = useState("");
  const [medicineQty, setMedicineQty] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [allMedicines, setAllMedicines] = useState<string[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Load all medicine names
  useEffect(() => {
    const meds = Array.isArray(medicineData) ? medicineData : [];
    const names = meds
      .map((m: any) => m?.name)
      .filter((n: any) => typeof n === "string" && n.trim() !== "");
    setAllMedicines(names);
  }, []);

  // Load all diseases
  useEffect(() => {
    if (!Array.isArray(diseaseData)) return;
    const diseaseSet = new Set<string>();

    diseaseData.forEach((item) => {
      if (item.Disease) diseaseSet.add(item.Disease);
    });

    setAllDiseases(Array.from(diseaseSet));
  }, []);

  //Load all symptoms
  useEffect(() => {
    if (!Array.isArray(symptomData)) return;

    
    const symptoms = Object.keys(symptomData[0]).filter(
      (key) => key !== "prognosis"
    );

    setAllSymptoms(symptoms);
  }, []);

  //Symptoms Search
  const handleSymptomSearch = (query: string) => {
    setSymptomInput(query);

    if (!query.trim()) {
      setFilteredSymptoms([]);
      return;
    }

    const filtered = allSymptoms.filter((symptom) =>
      symptom.toLowerCase().startsWith(query.toLowerCase())
    );

    setFilteredSymptoms(filtered.slice(0, 10));
    setShowSymptoms(true);
  };
  const formatSymptomLabel = (symptom: string) => {
    return symptom.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Medicine search
  const handleMedicineSearch = (query: string) => {
    setMedicineName(query);

    if (!query) {
      setFilteredMedicines([]);
      return;
    }

    const filtered = allMedicines
      .filter((m) => typeof m === "string")
      .filter((m) => m.toLowerCase().startsWith(query.toLowerCase()));

    setFilteredMedicines(filtered.slice(0, 10));
    setShowSuggestions(true);
  };

  // Select medicine
  const selectMedicine = (name: string) => {
    setMedicineName(name);
    setFilteredMedicines([]);
    setShowSuggestions(false);
  };

  // Diagnosis search
  const handleDiagnosisSearch = (query: string) => {
    setDiagnosisInput(query);

    if (!query) {
      setFilteredDiseases([]);
      return;
    }

    const filtered = allDiseases.filter((d) =>
      d.toLowerCase().startsWith(query.toLowerCase())
    );

    setFilteredDiseases(filtered.slice(0, 10));
    setShowDiseaseSuggestions(true);
  };

  // Add symptom
  const handleAddSymptom = () => {
    if (!symptomInput.trim()) return;
    setSymptoms([...symptoms, formatSymptomLabel(symptomInput.trim())]);
    setSymptomInput("");
  };

  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  // Add test
  const handleAddTest = () => {
    if (!testInput.trim()) return;
    setTests([...tests, testInput.trim()]);
    setTestInput("");
  };

  const removeTest = (index: number) => {
    setTests(tests.filter((_, i) => i !== index));
  };

  // Add medicine chip
  const addMedicineChip = () => {
    if (!medicineName.trim() || !medicineDosage.trim()) return;

    setMedicines([
      ...medicines,
      {
        name: medicineName.trim(),
        dosage: medicineDosage.trim(),
        quantity: medicineQty.trim(),
      },
    ]);

    setMedicineName("");
    setMedicineDosage("");
    setMedicineQty("");
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      doctorId,
      patientAadhar,
      diagnosis: diagnosisInput,
      symptoms,
      medicines,
      recommendedTests: tests,
      notes,
      name,
      gender,
    };

    try {
      await api.post(`/api/prescription/addPrescription/${bookingId}`, payload);

      Swal.fire({
        title: "Prescription Saved Successfully!",
        icon: "success",
        showConfirmButton: true,
      });

      // Reset all
      setDiagnosisInput("");
      setSymptoms([]);
      setTests([]);
      setMedicines([]);
      setNotes("");
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error Saving Prescription",
        icon: "error",
      });
    }

    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-blue-900">
          Create Prescription
        </h2>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Diagnosis */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Diagnosis
            </h3>

            <div className="relative w-full">
              <input
                className="border p-3 rounded-lg w-full"
                placeholder="Search diagnosis..."
                value={diagnosisInput}
                onChange={(e) => handleDiagnosisSearch(e.target.value)}
                onFocus={() =>
                  diagnosisInput && setShowDiseaseSuggestions(true)
                }
              />

              {showDiseaseSuggestions && filteredDiseases.length > 0 && (
                <div className="absolute bg-white border w-full rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                  {filteredDiseases.map((disease, i) => (
                    <div
                      key={i}
                      className="p-3 cursor-pointer hover:bg-blue-100"
                      onClick={() => {
                        setDiagnosisInput(disease);
                        setShowDiseaseSuggestions(false);
                      }}
                    >
                      {disease}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Symptoms
            </h3>

            <div className="relative flex gap-3">
              <input
                value={symptomInput}
                onChange={(e) => handleSymptomSearch(e.target.value)}
                onFocus={() => symptomInput && setShowSymptoms(true)}
                className="flex-1 border rounded-lg p-3"
                placeholder="Search symptom"
              />
              <button
                type="button"
                onClick={handleAddSymptom}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Add
              </button>

              {showSymptoms && filteredSymptoms.length > 0 && (
                <div className="absolute left-0 top-14 bg-white border w-full rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                  {filteredSymptoms.map((sym, idx) => (
                    <div
                      key={idx}
                      className="p-3 cursor-pointer hover:bg-blue-100"
                      onClick={() => {
                        setSymptomInput(formatSymptomLabel(sym));
                        setShowSymptoms(false);
                      }}
                    >
                      {formatSymptomLabel(sym)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {symptoms.map((s, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {formatSymptomLabel(s)}
                  <button
                    type="button"
                    onClick={() => removeSymptom(i)}
                    className="text-red-500"
                  >
                    <X size={16} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Medicines */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Medicines
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <input
                  value={medicineName}
                  onChange={(e) => handleMedicineSearch(e.target.value)}
                  onFocus={() => medicineName && setShowSuggestions(true)}
                  className="border rounded-lg p-3 w-full"
                  placeholder="Medicine name"
                />

                {showSuggestions && filteredMedicines.length > 0 && (
                  <div className="absolute z-20 bg-white border rounded-lg w-full max-h-60 overflow-y-auto shadow-lg">
                    {filteredMedicines.map((med, index) => (
                      <div
                        key={index}
                        onClick={() => selectMedicine(med)}
                        className="p-3 hover:bg-blue-100 cursor-pointer text-sm"
                      >
                        {med}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input
                value={medicineDosage}
                onChange={(e) => setMedicineDosage(e.target.value)}
                className="border rounded-lg p-3"
                placeholder="Dosage"
              />

              <input
                value={medicineQty}
                onChange={(e) => setMedicineQty(e.target.value)}
                className="border rounded-lg p-3"
                placeholder="Quantity"
              />
            </div>

            <button
              type="button"
              onClick={addMedicineChip}
              className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              + Add Medicine
            </button>

            <div className="flex flex-wrap gap-2 mt-4">
              {medicines.map((med, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {med.name} — {med.dosage}{" "}
                  {med.quantity && ` — ${med.quantity}`}
                  <button
                    type="button"
                    onClick={() => removeMedicine(i)}
                    className="text-red-500"
                  >
                    <X size={16} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Tests */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Recommended Tests
            </h3>

            <div className="flex gap-3">
              <input
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="flex-1 border rounded-lg p-3"
                placeholder="Add test"
              />
              <button
                type="button"
                onClick={handleAddTest}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {tests.map((t, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTest(i)}
                    className="text-red-500"
                  >
                    <X size={16} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full border rounded-lg p-3"
              placeholder="Additional notes"
            ></textarea>
          </div>

          {/* Submit */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-xl text-lg font-medium text-white ${
                loading ? "bg-gray-500" : "bg-blue-700 hover:bg-blue-800"
              }`}
            >
              {loading ? "Saving..." : "Save Prescription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionForm;
