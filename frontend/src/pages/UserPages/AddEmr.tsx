import React, { useState, useEffect, useContext } from "react";
import { FileText, Pill, Stethoscope, AlertCircle, Calendar, User, Plus, Eye } from "lucide-react";
import { createEMR } from "../../Services/emrApi";
import { AuthContext } from "../../Context/AuthContext";
import api from "../../Services/mainApi";
import toast from "react-hot-toast";

type EMRInputs = {
  allergies: string;
  diseases: string;
  pastSurgeries: string;
  currentMedications: string;
  reports: File[];
};

type EMRRecord = {
  _id: string;
  aadhar: string;
  allergies: string[];
  diseases: string[];
  pastSurgeries: string[];
  currentMedications: string[];
  reports: string[];
  createdAt: string;
  updatedAt: string;
};

const AddEmr: React.FC = () => {
  const { user } = useContext(AuthContext);
  const aadhar = Number(user?.aadhar);
  const patientId = user?.id || "patient123"; // Adjust based on your user object structure

  const [formData, setFormData] = useState<EMRInputs>({
    allergies: "",
    diseases: "",
    pastSurgeries: "",
    currentMedications: "",
    reports: []
  });
  
  const [emrRecords, setEmrRecords] = useState<EMRRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"add" | "view">("view");

  // Fetch EMR records on mount
  useEffect(() => {
    if (aadhar) {
      fetchEMRRecords();
    }
  }, [aadhar]);

  const fetchEMRRecords = async () => {
    if (!aadhar) return;
    
    setLoading(true);
    try {
      const response = await api.get<{ emr: EMRRecord[] }>(`/api/emr/${aadhar}`);
      
      if (response.data) {
        setEmrRecords(response.data.emr || []);
      }
    } catch (error) {
      console.error("Error fetching EMR:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EMRInputs, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData(prev => ({ ...prev, reports: Array.from(files) }));
    }
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!patientId) {
     toast.error("Session expired. Please login again.");
      return;
    }
    
    const formDataToSend = new FormData();
    formDataToSend.append("patientId", patientId);
    formDataToSend.append("aadhar", aadhar.toString());
    
    formDataToSend.append(
      "allergies",
      JSON.stringify(formData.allergies.split(",").map((s) => s.trim()).filter(Boolean))
    );
    formDataToSend.append(
      "diseases",
      JSON.stringify(formData.diseases.split(",").map((s) => s.trim()).filter(Boolean))
    );
    formDataToSend.append(
      "pastSurgeries",
      JSON.stringify(formData.pastSurgeries.split(",").map((s) => s.trim()).filter(Boolean))
    );
    formDataToSend.append(
      "currentMedications",
      JSON.stringify(formData.currentMedications.split(",").map((s) => s.trim()).filter(Boolean))
    );

    formData.reports.forEach((file) => {
      formDataToSend.append("reports", file);
    });

    try {
      await createEMR(formDataToSend);
      toast.success("EMR added successfully");
      
      // Reset form
      setFormData({
        allergies: "",
        diseases: "",
        pastSurgeries: "",
        currentMedications: "",
        reports: []
      });
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Refresh records
      fetchEMRRecords();
    } catch (error) {
      console.error("Error adding EMR:", error);
      alert("❌ Failed to add EMR");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("view")}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "view"
                ? "bg-[#0c213e] text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Eye className="w-5 h-5" />
            View EMR Records ({emrRecords.length})
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "add"
                ? "bg-[#0c213e] text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Plus className="w-5 h-5" />
            Add New EMR
          </button>
        </div>

        {/* Add EMR Form */}
        {activeTab === "add" && (
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8">
            <h2 className="text-3xl font-bold text-[#0c213e] mb-6 flex items-center gap-3">
              <FileText className="w-8 h-8" />
              Add Medical Record (EMR)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Allergies
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#0c213e] focus:outline-none transition"
                  placeholder="Dust, Pollen"
                  value={formData.allergies}
                  onChange={(e:React.ChangeEvent<HTMLInputElement>) => handleInputChange("allergies", e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple items with commas</p>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Diseases
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#0c213e] focus:outline-none transition"
                  placeholder="Diabetes, BP"
                  value={formData.diseases}
                  onChange={(e:React.ChangeEvent<HTMLInputElement>) => {
                    const target = e.target as HTMLInputElement;
                    handleInputChange("diseases", target.value)}}
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple items with commas</p>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Past Surgeries
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#0c213e] focus:outline-none transition"
                  placeholder="Knee Surgery"
                  value={formData.pastSurgeries}
                  onChange={(e:React.ChangeEvent<HTMLInputElement>) => {
                    const target = e.target as HTMLInputElement;
                    handleInputChange("pastSurgeries", target.value)}}
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple items with commas</p>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Current Medications
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#0c213e] focus:outline-none transition"
                  placeholder="Paracetamol"
                  value={formData.currentMedications}
                  onChange={(e:React.ChangeEvent<HTMLInputElement>) =>{ 
                    const target = e.target as HTMLInputElement;
                    handleInputChange("currentMedications", target.value)}}
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple items with commas</p>
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium text-gray-700 mb-2">
                  Upload Reports (Multiple)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#0c213e] focus:outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#0c213e] file:text-white file:cursor-pointer hover:file:bg-[#164066]"
                />
                {formData.reports.length > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    {formData.reports.length} file(s) selected
                  </p>
                )}
              </div>

              <div className="md:col-span-2 text-center">
                <button 
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-[#0c213e] text-white rounded-lg hover:bg-[#164066] transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  Add EMR
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View EMR Records */}
        {activeTab === "view" && (
          <div className="space-y-6">
            {loading ? (
              <div className="bg-white rounded-xl shadow-2xl p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0c213e] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading EMR records...</p>
              </div>
            ) : emrRecords.length === 0 ? (
              <div className="bg-white rounded-xl shadow-2xl p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No EMR Records Found
                </h3>
                <p className="text-gray-500">
                  Start by adding your first medical record.
                </p>
              </div>
            ) : (
              emrRecords.map((record) => (
                <div
                  key={record._id}
                  className="bg-white rounded-xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#0c213e] to-[#164066] p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <User className="w-6 h-6" />
                        <div>
                          <h3 className="text-xl font-bold">
                            Medical Record
                          </h3>
                          <p className="text-blue-200 text-sm">
                            Aadhar: {record.aadhar}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(record.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Allergies */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[#0c213e] font-semibold mb-3">
                        <AlertCircle className="w-5 h-5" />
                        <h4 className="text-lg">Allergies</h4>
                      </div>
                      {record.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {record.allergies.map((allergy, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200"
                            >
                              {allergy}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">None reported</p>
                      )}
                    </div>

                    {/* Diseases */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[#0c213e] font-semibold mb-3">
                        <Stethoscope className="w-5 h-5" />
                        <h4 className="text-lg">Diseases</h4>
                      </div>
                      {record.diseases.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {record.diseases.map((disease, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium border border-orange-200"
                            >
                              {disease}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">None reported</p>
                      )}
                    </div>

                    {/* Past Surgeries */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[#0c213e] font-semibold mb-3">
                        <FileText className="w-5 h-5" />
                        <h4 className="text-lg">Past Surgeries</h4>
                      </div>
                      {record.pastSurgeries.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {record.pastSurgeries.map((surgery, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-200"
                            >
                              {surgery}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">None reported</p>
                      )}
                    </div>

                    {/* Current Medications */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[#0c213e] font-semibold mb-3">
                        <Pill className="w-5 h-5" />
                        <h4 className="text-lg">Current Medications</h4>
                      </div>
                      {record.currentMedications.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {record.currentMedications.map((med, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200"
                            >
                              {med}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">None reported</p>
                      )}
                    </div>
                  </div>

                  {/* Reports Section */}
                  {record.reports.length > 0 && (
                    <div className="px-6 pb-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-[#0c213e] mb-3">
                          Attached Reports ({record.reports.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {record.reports.map((report, idx) => (
                            <a
                              key={idx}
                              href={report}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-white border-2 border-[#0c213e] text-[#0c213e] rounded-lg hover:bg-[#0c213e] hover:text-white transition-all text-sm font-medium"
                            >
                              Report {idx + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddEmr;