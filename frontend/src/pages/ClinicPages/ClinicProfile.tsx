import React, { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../Services/mainApi";
import { Helmet } from "react-helmet";
import { FileText } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const PRIMARY = "#0C213E";

interface Clinic {
  _id: string;
  clinicName: string;
  clinicType: "Private" | "Government";
  operatingHours: string;
  specialities: string[];
  phone: string;
  email: string;
  address: string;
  state: string;
  district: string;
  pincode: number;
  clinicLicenseNumber: string;
  registrationCertificate?: string;
  aadharNumber: number;
  panNumber: string;
  staffName: string;
  staffEmail: string;
  staffId: string;
  staffPassword?: string;
  doctors: string[];
}

interface OutletContext {
  clinicId: string;
}

export default function ClinicProfile() {
  const { clinicId } = useOutletContext<OutletContext>();
  const navigate = useNavigate();

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [formData, setFormData] = useState<Partial<Clinic>>({});
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchClinicData = async () => {
    if (!clinicId) return;
    try {
      const res = await axios.get<{ clinic: Clinic }>(
        `http://localhost:3000/api/clinic/getClinicById/${clinicId}`
      );
      const clinicData = res.data.clinic;
      setClinic(clinicData);
      setFormData(clinicData);
    } catch (error) {
      console.error("Error fetching clinic data:", error);
      toast.error("Failed to load clinic profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinicData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    if (!formData) return;

    if (name === "staffPassword") {
      setPasswordInput(value);
      return;
    }

    const updatedValue =
      name === "specialities" ? value.split(",").map((s) => s.trim()) : value;

    setFormData({ ...formData, [name as keyof Clinic]: updatedValue } as Partial<Clinic>);
  };

  const handleUpdate = async () => {
    if (!formData || !formData._id) return;

    try {
      setSaving(true);
      const payload = { ...formData, ...(passwordInput ? { staffPassword: passwordInput } : {}) };

      await api.put(`/api/clinic/update/${formData._id}`, payload);

      toast.success("Clinic profile updated successfully");
      setEditMode(false);
      setSaving(false);
      setPasswordInput("");
      fetchClinicData();
    } catch (error) {
      console.error("Error updating clinic:", error);
      toast.error("Failed to update profile");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!clinic) return;
    try {
      await api.delete(`/api/clinic/delete/${clinic._id}`);
      toast.success("Clinic deleted successfully");
      localStorage.removeItem("clinicId");
      navigate("/");
    } catch (error) {
      console.error("Error deleting clinic:", error);
      toast.error("Failed to delete clinic");
    }
  };

  if (loading) return <p className="text-center p-8">Loading...</p>;

  const labelClass = "text-sm font-semibold text-gray-700";
  const inputClass =
    "w-full rounded-xl border border-gray-300 p-3 focus:border-[#0C213E] focus:ring-2 focus:ring-blue-200 transition";

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3400,
          style: { borderRadius: "10px", background: "#333", color: "#fff" },
        }}
      />

      <Helmet>
        <title>{clinic?.clinicName || "Clinic Profile"} | Profile</title>
      </Helmet>

      <div className="min-h-screen bg-gray-100 px-4 py-6 md:px-10">
        <div className="mx-auto max-w-20xl">
          {/* PROFILE HEADER */}
          <div className="rounded-2xl p-5 shadow-lg" style={{ backgroundColor: PRIMARY }}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-28 w-28 rounded-xl border-4 border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center text-white">
                {clinic?.registrationCertificate ? (
                  // attempt to show a thumbnail when it's an image; otherwise show "REG"
                  clinic.registrationCertificate.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                    <img src={clinic.registrationCertificate} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-white font-bold">REG</div>
                  )
                ) : (
                  <div className="text-white">No Logo</div>
                )}
              </div>

              <div className="text-white flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold">{clinic?.clinicName}</h3>
                <p className="mt-1 text-gray-300">{clinic?.clinicType} Clinic</p>
                <p className="text-gray-300 text-sm">{clinic?.email}</p>
                <p className="text-gray-300 mt-1 text-sm">License: {clinic?.clinicLicenseNumber}</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-5">
              <button
                onClick={() => setEditMode(!editMode)}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg shadow text-sm"
              >
                {editMode ? "Cancel" : "Edit"}
              </button>

              <button
                onClick={() => setShowConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow text-sm"
              >
                Delete
              </button>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-8">
              {/* CLINIC DETAILS */}
              <div className="rounded-2xl bg-white p-6 shadow-md">
                <h3 className="text-xl font-bold mb-4" style={{ color: PRIMARY }}>
                  Clinic Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    ["clinicName", "Clinic Name"],
                    ["clinicType", "Clinic Type"],
                    ["operatingHours", "Operating Hours"],
                    ["specialities", "Specialities"],
                    ["clinicLicenseNumber", "License Number"],
                    ["registrationCertificate", "Registration Certificate"],
                  ].map(([field, label]) => (
                    <div key={field as string}>
                      <label className={labelClass}>{label}</label>

                      {editMode ? (
                        field === "registrationCertificate" ? (
                          <div className="flex flex-col gap-2">
                            {formData?.registrationCertificate ? (
                              <a href={formData.registrationCertificate} target="_blank" rel="noreferrer" className="inline-block">
                                <div className="w-32 h-32 border border-gray-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
                                  {formData.registrationCertificate.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                                    <img src={formData.registrationCertificate} alt="Registration" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                      <FileText size={18} className="mr-2" /> View File
                                    </div>
                                  )}
                                </div>
                              </a>
                            ) : (
                              <p className="text-gray-500 text-sm italic">No certificate uploaded</p>
                            )}

                            <input
                              type="file"
                              name="registrationCertificate"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = URL.createObjectURL(file);
                                  setFormData({ ...formData, registrationCertificate: url });
                                }
                              }}
                              className="text-sm text-gray-700 border border-gray-300 rounded-lg p-2 cursor-pointer focus:ring-2 focus:ring-[#0C213E]"
                            />
                          </div>
                        ) : field === "specialities" ? (
                          <input
                            name="specialities"
                            value={Array.isArray(formData?.specialities) ? (formData!.specialities!.join(", ") as any) : (formData as any)[field] || ""}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        ) : (
                          <input
                            name={field}
                            value={(formData as any)[field] || ""}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        )
                      ) : field === "registrationCertificate" ? (
                        formData?.registrationCertificate ? (
                          <a href={formData.registrationCertificate} target="_blank" rel="noreferrer" className="inline-block px-3 py-2 rounded-xl shadow-md text-white text-sm" style={{ backgroundColor: PRIMARY }}>
                            View Registration Certificate
                          </a>
                        ) : (
                          <p className="p-2 text-gray-700">-</p>
                        )
                      ) : (
                        <p className="p-2 text-gray-700">
                          {field === "specialities"
                            ? Array.isArray(formData?.specialities)
                              ? formData!.specialities!.join(", ")
                              : (formData as any)[field]
                            : (formData as any)[field] || "-"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {editMode && (
                  <button
                    onClick={handleUpdate}
                    className="mt-6 w-full text-white py-3 rounded-xl shadow-md"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    Save Clinic Changes
                  </button>
                )}
              </div>

              {/* CONTACT & ADDRESS */}
              <div className="rounded-2xl bg-white p-6 shadow-md">
                <h3 className="text-xl font-bold mb-4" style={{ color: PRIMARY }}>
                  Contact & Address
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    ["phone", "Phone"],
                    ["email", "Email"],
                    ["address", "Address"],
                    ["state", "State"],
                    ["district", "District"],
                    ["pincode", "Pincode"],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <label className={labelClass}>{label}</label>

                      {editMode ? (
                        <input
                          name={field}
                          value={(formData as any)[field] || ""}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      ) : (
                        <p className="p-2 text-gray-700">{(formData as any)[field] || "-"}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-8">
              {/* STAFF & CREDENTIALS */}
              <div className="rounded-2xl bg-white p-6 shadow-md">
                <h3 className="text-xl font-bold mb-4" style={{ color: PRIMARY }}>
                  Staff & Credentials
                </h3>

                <label className={labelClass}>Staff Name</label>
                {editMode ? (
                  <input name="staffName" value={(formData as any).staffName || ""} onChange={handleChange} className={inputClass} />
                ) : (
                  <p className="mt-1 text-gray-700">{formData?.staffName || "-"}</p>
                )}

                <label className={`${labelClass} mt-4 block`}>Staff Email</label>
                {editMode ? (
                  <input name="staffEmail" value={(formData as any).staffEmail || ""} onChange={handleChange} className={inputClass} />
                ) : (
                  <p className="mt-1 text-gray-700">{formData?.staffEmail || "-"}</p>
                )}

                <label className={`${labelClass} mt-4 block`}>Staff ID</label>
                {editMode ? (
                  <input name="staffId" value={(formData as any).staffId || ""} onChange={handleChange} className={inputClass} />
                ) : (
                  <p className="mt-1 text-gray-700">{formData?.staffId || "-"}</p>
                )}

                <label className={`${labelClass} mt-4 block`}>Staff Password</label>
                {editMode ? (
                  <input name="staffPassword" type="password" value={passwordInput} onChange={handleChange as any} className={inputClass} placeholder="Enter new password" />
                ) : (
                  <p className="mt-1 text-gray-700">••••••••</p>
                )}

                {editMode && (
                  <button onClick={handleUpdate} className="mt-6 w-full text-white py-3 rounded-xl shadow-md" style={{ backgroundColor: PRIMARY }}>
                    Save Staff Changes
                  </button>
                )}
              </div>

              {/* LOGIN CREDENTIALS (similar to doctor design) */}
              <div className="rounded-2xl bg-white p-6 shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold" style={{ color: PRIMARY }}>
                    Update Login Credentials
                  </h3>

                  <button
                    type="button"
                    onClick={() => setEditMode(!editMode)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded-lg shadow text-sm"
                  >
                    {editMode ? "Cancel" : "Edit"}
                  </button>
                </div>

                {!editMode && (
                  <p className="text-gray-500 text-sm">Click Edit to update staff credentials</p>
                )}

                {editMode && (
                  <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="space-y-5">
                    <div className="flex flex-col">
                      <label className="font-semibold mb-2 text-gray-700">New Staff ID</label>
                      <input type="text" className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" value={(formData as any).staffId || ""} onChange={(e) => setFormData({ ...formData, staffId: e.target.value })} placeholder="Enter new Staff ID" required />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-semibold mb-2 text-gray-700">New Password</label>
                      <input type="password" className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Enter new password" required />
                    </div>

                    <button type="submit" disabled={saving} className="w-full text-white py-2.5 rounded-lg font-medium transition flex justify-center items-center gap-2" style={{ backgroundColor: PRIMARY }}>
                      {saving ? "Updating..." : "Update Credentials"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* DELETE CONFIRMATION */}
          {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
                <p className="text-lg font-semibold mb-4">Delete this clinic permanently?</p>

                <div className="flex justify-between">
                  <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg shadow">Yes</button>
                  <button onClick={() => setShowConfirm(false)} className="bg-gray-400 text-white px-4 py-2 rounded-lg shadow">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
