






import { useEffect, useState, useCallback, memo } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import {
  Building2,
  Mail,
  MapPin,
  Edit3,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

interface Lab {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface LabDashboardContext {
  labId: string | null;
}

interface GetLabResponse {
  labDetails: Lab;
  message: string;
}

interface UpdateLabResponse {
  lab: Lab;
  message: string;
}

const LabProfile = memo(() => {
  const { labId } = useOutletContext<LabDashboardContext>();
  const [lab, setLab] = useState<Lab>({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const fetchLab = useCallback(async () => {
    if (!labId) return;
    try {
      const { data } = await axios.get<GetLabResponse>(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/lab/getLabById/${labId}`
      );
      if (data.labDetails) setLab(data.labDetails);
    } catch {
      showNotification("error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [labId, showNotification]);

  useEffect(() => {
    fetchLab();
  }, [fetchLab]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLab((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labId) return showNotification("error", "Lab ID not found");
    setSaving(true);

    try {
      const { data } = await axios.put<UpdateLabResponse>(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/lab/updateLabProfile/${labId}`,
        lab
      );
      setLab(data.lab);
      setIsEditing(false);
      showNotification("success", "Profile updated successfully!");
    } catch {
      showNotification("error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => setIsEditing(false);

  useEffect(() => {
    document.title = "Lab Profile | DoctorZ";
  }, []);

  if (loading)
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#070738] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-700 font-medium text-base sm:text-lg">Loading Profile...</p>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 md:px-10 py-6 md:py-10">
      {/* ✅ Toast Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-4 sm:right-6 z-50 flex flex-wrap sm:flex-nowrap items-center gap-3 px-5 sm:px-6 py-3 rounded-2xl shadow-2xl transition-all duration-500 text-sm sm:text-base ${
            notification.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="font-semibold break-words">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-auto sm:ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ✅ Header Section */}
      <header className="bg-gradient-to-r from-[#070738] to-[#0a0a4a] rounded-3xl shadow-2xl mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-10 py-8 gap-5 md:gap-0 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-white/10 p-4 rounded-2xl border border-white/20 shadow-xl">
              <Building2 className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-snug">
                Laboratory Profile
              </h1>
              <p className="text-blue-200 text-sm sm:text-base mt-1">
                Manage your laboratory information
              </p>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-white text-[#070738] hover:bg-gray-100 font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:scale-105 text-sm sm:text-base"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </header>

      {/* ✅ Profile Form */}
      <section>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-lg p-5 sm:p-8 md:p-10 border border-gray-200 space-y-6 max-w-6xl mx-auto"
        >
          {[
            { label: "Laboratory Name", name: "name", icon: <Building2 /> },
            { label: "Email Address", name: "email", icon: <Mail />, type: "email" },
            { label: "Street Address", name: "address", icon: <MapPin /> },
          ].map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="block text-xs sm:text-sm font-bold text-gray-600 mb-2 uppercase tracking-widest"
              >
                {field.label}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {field.icon}
                </div>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type || "text"}
                  value={lab[field.name as keyof Lab]}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl text-sm sm:text-base transition-all outline-none text-gray-900 font-medium ${
                    isEditing
                      ? "border-gray-300 bg-white focus:border-[#070738] focus:ring-4 focus:ring-[#070738]/10"
                      : "border-gray-200 bg-gray-50 cursor-default"
                  }`}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  required
                />
              </div>
            </div>
          ))}

          {/* Responsive grid for city/state/pincode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {["city", "state", "pincode"].map((field) => (
              <div key={field}>
                <label
                  htmlFor={field}
                  className="block text-xs sm:text-sm font-bold text-gray-600 mb-2 uppercase tracking-widest"
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  id={field}
                  name={field}
                  value={lab[field as keyof Lab]}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border-2 rounded-xl text-sm sm:text-base transition-all outline-none text-gray-900 font-medium ${
                    isEditing
                      ? "border-gray-300 bg-white focus:border-[#070738] focus:ring-4 focus:ring-[#070738]/10"
                      : "border-gray-200 bg-gray-50 cursor-default"
                  }`}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  required
                />
              </div>
            ))}
          </div>

          {/* ✅ Buttons */}
          {isEditing && (
            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4 sm:gap-6">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-[#070738] to-[#0a0a4a] hover:from-[#050520] hover:to-[#070738] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </section>
    </main>
  );
});

export default LabProfile;