import { useEffect, useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { Helmet } from "react-helmet";
import toast, { Toaster } from "react-hot-toast";

import {
  Building2,
  Mail,
  MapPin,
  Save,
  Edit3,
  Lock,
} from "lucide-react";
import api from "../../Services/mainApi";

interface Lab {
  labId: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  password?: string;
}

interface LabDashboardContext {
  labId: string | null;
}

interface GetLabResponse {
  labDetails: Lab;
}

interface UpdateLabResponse {
  lab: Lab;
}

const PRIMARY = "#0C213E";

const LabProfile = () => {
  const { labId: contextLabId } = useOutletContext<LabDashboardContext>();

  const [lab, setLab] = useState<Lab>({
    labId: "",
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    password: "",
  });

  // Removed unused loading state
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  // Fetch lab details
  useEffect(() => {
    if (!contextLabId) return;

    const fetchLab = async () => {
      try {
        const res = await api.get<GetLabResponse>(
          `/api/lab/getLabById/${contextLabId}`
        );
        setLab(res.data.labDetails);
      } catch {
        toast.error("Failed to load lab profile");
      }
    };

    fetchLab();
  }, [contextLabId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLab({ ...lab, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contextLabId) return;

    setSaving(true);

    try {
      const res = await api.put<UpdateLabResponse>(
        `/api/lab/updateLabProfile/${contextLabId}`,
        { ...lab, ...(passwordInput ? { password: passwordInput } : {}) }
      );

      setLab(res.data.lab);
      toast.success("Lab profile updated successfully!");
      setIsEditing(false);
      setPasswordInput("");
    } catch {
      toast.error("Failed to update profile");
    }

    setSaving(false);
  };

  // if (loading) {
  //   return <p className="text-center p-10 font-medium">Loading...</p>;
  // }

  const inputClass =
    "w-full rounded-xl border border-gray-300 p-3 focus:border-[#0C213E] focus:ring-2 focus:ring-blue-200 bg-white transition";
  const inputDisabled =
    "w-full rounded-xl p-3 bg-gray-100 border border-gray-200 cursor-not-allowed";

  return (
    <>
      {/* Toaster Settings */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3400,
          style: { borderRadius: "10px", background: "#333", color: "#fff" },
        }}
      />

      {/* SEO */}
      <Helmet>
        <title>Lab Profile | Dashboard</title>
      </Helmet>

      <div className="min-h-screen bg-gray-100 px-4 py-6 md:px-10">
        <div className="mx-auto max-w-6xl">

          {/* HEADER */}
          <div
            className="rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6"
            style={{ backgroundColor: PRIMARY }}
          >
            <div className="flex items-center gap-5 text-white">
              <div className="bg-white/20 p-4 rounded-xl">
                <Building2 className="w-9 h-9 text-white" />
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Laboratory Profile
                </h1>
                <p className="text-gray-300 text-sm">
                  Manage your laboratory information
                </p>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2.5 rounded-lg shadow font-semibold transition flex items-center gap-2"
              >
                <Edit3 className="w-5 h-5" />
                Edit
              </button>
            )}
          </div>

          {/* MAIN FORM CARD */}
          <form
            onSubmit={handleSubmit}
            className="bg-white mt-10 rounded-2xl shadow-md p-6 border border-gray-200"
          >
            {/* BASIC DETAILS */}
            <h3
              className="text-xl font-bold mb-5"
              style={{ color: PRIMARY }}
            >
              Laboratory Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NAME */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Lab Name
                </label>
                <div className="relative mt-1">
                  <Building2 className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                  <input
                    name="name"
                    value={lab.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={isEditing ? "pl-10 " + inputClass : "pl-10 " + inputDisabled}
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Email
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    value={lab.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={isEditing ? "pl-10 " + inputClass : "pl-10 " + inputDisabled}
                  />
                </div>
              </div>

              {/* ADDRESS */}
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">
                  Address
                </label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                  <input
                    name="address"
                    value={lab.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={isEditing ? "pl-10 " + inputClass : "pl-10 " + inputDisabled}
                  />
                </div>
              </div>

              {/* CITY */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  City
                </label>
                <input
                  name="city"
                  value={lab.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={isEditing ? inputClass : inputDisabled}
                />
              </div>

              {/* STATE */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  State
                </label>
                <input
                  name="state"
                  value={lab.state}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={isEditing ? inputClass : inputDisabled}
                />
              </div>

              {/* PINCODE */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Pincode
                </label>
                <input
                  name="pincode"
                  value={lab.pincode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={isEditing ? inputClass : inputDisabled}
                />
              </div>
            </div>

            {/* BUTTONS */}
            {isEditing && (
              <div className="mt-8 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#0C213E] text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 hover:opacity-90"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default LabProfile;
