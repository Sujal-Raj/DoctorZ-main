import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import api from "../../Services/mainApi";
import { toast, Toaster } from "react-hot-toast";

const PRIMARY = "#0C213E";

interface Doctor {
  _id: string;
  fullName: string;
  specialization: string;
  qualification: string;
  experience: number;
  dob: string;
  consultationFee: number;
  language: string;
  MobileNo: string;
  email: string;
  MedicalRegistrationNumber: string;
  Aadhar: number;
  photo?: string;
  signature?: string;
  DegreeCertificate?: string;
}

const DoctorProfile: React.FC = () => {
  const navigate = useNavigate();
  const storedDoctorId = localStorage.getItem("doctorId");
  console.log("Stored Doctor ID:", storedDoctorId);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Doctor>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  // LOGIN CREDENTIALS
  const [editCreds, setEditCreds] = useState(false);
  const [newDoctorId, setNewDoctorId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updatingCreds, setUpdatingCreds] = useState(false);

  // FETCH DOCTOR DATA
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await api.get<{ doctor: Doctor }>(
          `/api/doctor/${storedDoctorId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Fetched Doctor Data:", res.data.doctor);
        setDoctor(res.data.doctor);
        setFormData(res.data.doctor);
      } catch {
        toast.error("Failed to load doctor data");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, []);
  const handlePhotoChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewPhoto(file);

    // show preview immediately
    setDoctor((prev) =>
      prev ? { ...prev, photo: URL.createObjectURL(file) } : prev
    );
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "dob") {
      setFormData({ ...formData, dob: value });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  //UPDATE PROFILE
  const handleProfileUpdate = async () => {
    try {
      const form = new FormData();

      // append text fields safely
      Object.entries(formData).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0)
        ) {
          form.append(key, String(value));
        }
      });

      // append new photo only if selected
      if (newPhoto) {
        form.append("photo", newPhoto);
      }

      const res = await api.put(
        `/api/doctor/updateDoctor/${doctor?._id}`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Profile updated successfully!");

      // update UI without reload
      setDoctor(res.data.doctor);

      setEditMode(false);
      setNewPhoto(null);
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  // DELETE PROFILE
  const handleDelete = async () => {
    try {
      await api.delete(`/api/doctor/delete/${doctor?._id}`);

      localStorage.removeItem("doctorId");
      localStorage.removeItem("token");
      navigate("/");
    } catch {
      toast.error("Delete failed");
    }
  };

  // UPDATE LOGIN CREDENTIALS (CORRECTED)
  const handleCredUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingCreds(true);

    try {
      // FIX: use storedDoctorId (actual doctorId)
      await api.put(`/api/doctor/updateCreds/${storedDoctorId}`, {
        doctorId: newDoctorId,
        password: newPassword,
      });

      toast.success("Login credentials updated successfully!");

      setNewDoctorId("");
      setNewPassword("");
      setEditCreds(false);

      navigate(`/doctordashboard/${storedDoctorId}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setUpdatingCreds(false);
    }
  };

  const formatDMY = (dateString: string | undefined) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB");
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
          duration: 2400,
          style: { borderRadius: "10px", background: "#333", color: "#fff" },
        }}
      />

      <Helmet>
        <title>Dr. {doctor?.fullName} | Profile</title>
      </Helmet>

      <div className="min-h-screen bg-gray-100 px-4 py-6 md:px-10">
        <div className="mx-auto max-w-20xl">
          {/* PROFILE HEADER */}
          <div
            className="rounded-2xl p-5 shadow-lg"
            style={{ backgroundColor: PRIMARY }}
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative h-28 w-28 rounded-xl border-4 border-white shadow-md overflow-hidden bg-gray-100">
                {newPhoto ? (
                  <img
                    src={URL.createObjectURL(newPhoto)}
                    className="w-full h-full object-cover"
                  />
                ) : doctor?.photo ? (
                  <img
                    src={`http://localhost:3000/uploads/${
                      doctor.photo
                    }?t=${Date.now()}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No Photo
                  </div>
                )}

                {editMode && (
                  <label className="absolute bottom-2 right-2 z-20 bg-white p-2 rounded-full shadow cursor-pointer hover:bg-gray-200 transition">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                    <svg
                      className="w-5 h-5 text-black"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 7h4l2-3h6l2 3h4v12H3V7z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </label>
                )}
              </div>

              <div className="text-white flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold">{doctor?.fullName}</h3>
                <p className="mt-1 text-gray-300">{doctor?.specialization}</p>
                <p className="text-gray-300 text-sm">{doctor?.email}</p>
                <p className="text-gray-300 mt-1 text-sm">
                  Reg No: {doctor?.MedicalRegistrationNumber}
                </p>
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
              {/* DETAILS */}
              <div className="rounded-2xl bg-white p-6 shadow-md">
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: PRIMARY }}
                >
                  Professional Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* LIST OF FIELDS */}
                  {[
                    ["qualification", "Qualification"],
                    ["experience", "Experience (Years)"],
                    ["language", "Languages"],
                    ["consultationFee", "Consultation Fee"],
                    ["dob", "Date of Birth"],
                    ["Aadhar", "Aadhar Number"],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <label className={labelClass}>{label}</label>

                      {editMode ? (
                        <input
                          name={field}
                          type={field === "dob" ? "date" : "text"}
                          value={
                            field === "dob"
                              ? formData.dob?.slice(0, 10)
                              : (formData as any)[field]
                          }
                          onChange={handleChange}
                          className={inputClass}
                        />
                      ) : field === "dob" ? (
                        <p className="p-2 text-gray-700">
                          {formatDMY(formData.dob)}
                        </p>
                      ) : (
                        <p className="p-2 text-gray-700">
                          {(formData as any)[field]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {editMode && (
                  <button
                    onClick={handleProfileUpdate}
                    className="mt-6 w-full text-white py-3 rounded-xl shadow-md"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    Save Profile Changes
                  </button>
                )}
              </div>

              {/* Certificates */}
              <div className="rounded-2xl bg-white p-6 shadow-md">
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: PRIMARY }}
                >
                  Certificates & Signature
                </h3>

                <div className="flex flex-wrap gap-10 items-end">
                  {doctor?.signature && (
                    <div>
                      <p className="font-semibold mb-2">Digital Signature</p>
                      <img
                        src={`http://localhost:3000/uploads/${doctor.signature}`}
                        className="w-40 border shadow"
                      />
                    </div>
                  )}

                  {doctor?.DegreeCertificate && (
                    <a
                      href={`http://localhost:3000/uploads/${doctor.DegreeCertificate}`}
                      target="_blank"
                      className="inline-block px-3 py-3 rounded-xl shadow-md text-white text-sm"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      View Degree Certificate
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-8">
              {/* Contact */}
              <div className="rounded-2xl bg-white p-2 shadow-md">
                <h3
                  className="text-xl font-bold mb-5"
                  style={{ color: PRIMARY }}
                >
                  Contact Information
                </h3>

                <label className={labelClass}>Phone Number</label>
                {editMode ? (
                  <input
                    name="MobileNo"
                    value={formData.MobileNo}
                    onChange={handleChange}
                    className={inputClass}
                  />
                ) : (
                  <p className="mt-1 text-gray-700">{doctor?.MobileNo}</p>
                )}

                <label className={`${labelClass} mt-4 block`}>Email</label>
                {editMode ? (
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                ) : (
                  <p className="mt-1 text-gray-700">{doctor?.email}</p>
                )}
              </div>

              {/* LOGIN CREDENTIALS */}
              <div className="rounded-2xl bg-white p-6 shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold" style={{ color: PRIMARY }}>
                    Update Login Credentials
                  </h3>

                  <button
                    type="button"
                    onClick={() => setEditCreds(!editCreds)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded-lg shadow text-sm"
                  >
                    {editCreds ? "Cancel" : "Edit"}
                  </button>
                </div>

                <form onSubmit={handleCredUpdate} className="space-y-5">
                  {!editCreds && (
                    <p className="text-gray-500 text-sm">
                      Click Edit to update login credentials
                    </p>
                  )}

                  {editCreds && (
                    <>
                      {/* Doctor ID */}
                      <div className="flex flex-col">
                        <label className="font-semibold mb-2 text-gray-700">
                          New Doctor ID
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 px-4 py-2 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                          value={newDoctorId}
                          onChange={(e) => setNewDoctorId(e.target.value)}
                          placeholder="Enter new Doctor ID"
                          required
                        />
                      </div>

                      {/* Password */}
                      <div className="flex flex-col">
                        <label className="font-semibold mb-2 text-gray-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full border border-gray-300 px-4 py-2 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          required
                        />
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={updatingCreds}
                        className="w-full text-white py-2.5 rounded-lg font-medium transition flex justify-center items-center gap-2"
                        style={{ backgroundColor: PRIMARY }}
                      >
                        {updatingCreds ? "Updating..." : "Update Credentials"}
                      </button>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* DELETE CONFIRMATION */}
          {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
                <p className="text-lg font-semibold mb-4">
                  Delete your profile permanently?
                </p>

                <div className="flex justify-between">
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg shadow"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg shadow"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DoctorProfile;
