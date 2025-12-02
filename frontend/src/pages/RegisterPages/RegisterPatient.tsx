import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet";
import toast, { Toaster } from "react-hot-toast";   // ✅ added toastify
import { Upload } from "lucide-react";

import "../../index.css";
import { registerPatient } from "../../Services/patientApi";

type PatientFormInputs = {
  fullName: string;
  gender: string;
  dob: string;
  email: string;
  password: string;
  mobileNumber: string;
  aadhar: string;
  city: string;
  pincode: string;
  abhaId: string;

  emergencyName: string;
  emergencyNumber: string;

  allergies: string;
  diseases: string;
  pastSurgeries: string;
  currentMedications: string;
  medicalReports?: FileList;
};

const RegisterPatient: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormInputs>();

  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedImage = e.target.files?.[0];
    setPhotoFile(selectedImage || null);
    if (selectedImage) {
      setPhotoPreview(URL.createObjectURL(selectedImage));
    }
  };

  const onSubmit = async (data: PatientFormInputs) => {
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("fullName", data.fullName);
      formData.append("gender", data.gender);
      formData.append("dob", data.dob);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("mobileNumber", data.mobileNumber);
      formData.append("aadhar", data.aadhar);
      formData.append("city", data.city);
      formData.append("pincode", data.pincode);
      formData.append("abhaId", data.abhaId);

      formData.append("name", data.emergencyName);
      formData.append("number", data.emergencyNumber);

      formData.append(
        "allergies",
        JSON.stringify(data.allergies?.split(",").map((s) => s.trim()) || [])
      );
      formData.append(
        "diseases",
        JSON.stringify(data.diseases?.split(",").map((s) => s.trim()) || [])
      );
      formData.append(
        "pastSurgeries",
        JSON.stringify(data.pastSurgeries?.split(",").map((s) => s.trim()) || [])
      );
      formData.append(
        "currentMedications",
        JSON.stringify(
          data.currentMedications?.split(",").map((s) => s.trim()) || []
        )
      );

      if (photoFile) {
        formData.append("photo", photoFile);
      }

      selectedFiles.forEach((file) => {
        formData.append("medicalReports", file);
      });

      await registerPatient(formData);

      toast.success("Patient registered successfully!");  // ✅ replaced Swal
    } catch (error) {
      toast.error("Registration failed");                 // ✅ replaced Swal
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ id, label, type = "text", placeholder, registerField }: any) => (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...registerField}
        className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-800 shadow-sm focus:ring-2 focus:ring-[#0c213e] focus:border-[#0c213e] transition-all"
      />
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Patient Registration</title>
      </Helmet>

      {/* ✅ TOASTIFY */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3400,
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }}
      />

      <main className="min-h-screen bg-white flex items-center justify-center p-4">
        <section className="w-full max-w-5xl bg-white rounded-2xl shadow-lg border border-gray-300 p-6 md:p-8 my-10 md:my-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-[#0c213e]">
              🏥 Patient Registration
            </h1>
            <p className="mt-2 text-gray-600 text-sm md:text-base">
              Fill the details below to register.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800"
          >
            {/* PERSONAL INFO */}
            <h2 className="md:col-span-2 text-lg font-semibold text-[#0c213e] border-b border-[#0c213e]/20 pb-2">
              Personal Information
            </h2>

            <InputField
              id="fullName"
              label="Full Name"
              placeholder="Ritika Sharma"
              registerField={register("fullName")}
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Gender
              </label>
              <select
                {...register("gender")}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 shadow-sm focus:ring-2 focus:ring-[#0c213e]"
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <InputField
              id="dob"
              label="Date of Birth"
              type="date"
              registerField={register("dob")}
            />

            <InputField
              id="email"
              label="Email"
              type="email"
              placeholder="example@gmail.com"
              registerField={register("email")}
            />

            <InputField
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              registerField={register("password")}
            />

            <div>
              <InputField
                id="mobileNumber"
                label="Mobile Number"
                placeholder="9876543210"
                registerField={register("mobileNumber", {
                  required: "Mobile number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Mobile no must be exactly 10 digits",
                  },
                })}
              />
              {errors.mobileNumber && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.mobileNumber.message}
                </p>
              )}
            </div>

            <div>
              <InputField
                id="aadhar"
                label="Aadhar"
                placeholder="123456789012"
                registerField={register("aadhar", {
                  required: "Aadhar number is required",
                  pattern: {
                    value: /^[0-9]{12}$/,
                    message: "Aadhar must be exactly 12 digits",
                  },
                })}
              />
              {errors.aadhar && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.aadhar.message}
                </p>
              )}
            </div>

            <InputField
              id="city"
              label="City"
              placeholder="Bhilai"
              registerField={register("city")}
            />

            <div>
              <InputField
                id="pincode"
                label="Pincode"
                placeholder="490001"
                registerField={register("pincode", {
                  required: "Pincode is required",
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: "Pincode must be exactly 6 digits",
                  },
                })}
              />
              {errors.pincode && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.pincode.message}
                </p>
              )}
            </div>

            <div>
              <InputField
                id="abhaId"
                label="ABHA ID"
                placeholder="ABHA123456"
                registerField={register("abhaId", {
                  required: "ABHA ID is required",
                  pattern: {
                    value: /^[0-9]{14}$/,
                    message: "ABHA ID must be exactly 14 digits",
                  },
                })}
              />
              {errors.abhaId && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.abhaId.message}
                </p>
              )}
            </div>

            {/* EMERGENCY */}
            <h2 className="md:col-span-2 text-lg font-semibold text-[#0c213e]  pt-4 border-b border-[#0c213e]/20 pb-2">
              Emergency Contact
            </h2>

            <InputField
              id="emergencyName"
              label="Emergency Name"
              placeholder="Rahul Sharma"
              registerField={register("emergencyName")}
            />

            <div>
              <InputField
                id="emergencyNumber"
                label="Emergency Number"
                placeholder="9876541230"
                registerField={register("emergencyNumber", {
                  required: "Emergency number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Emergency number must be exactly 10 digits",
                  },
                })}
              />
              {errors.emergencyNumber && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.emergencyNumber.message}
                </p>
              )}
            </div>

            {/* PROFILE PHOTO */}
            <h2 className="md:col-span-2 text-lg font-semibold text-[#0c213e] border-b border-[#0c213e]/20 pb-2">
              Profile Photo
            </h2>

            <div className="md:col-span-2 flex items-center gap-6">
              <label className="w-40 h-40 border-2 border-dashed border-[#0c213e]/40 rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#0c213e]/5 transition">
                <Upload className="text-[#0c213e]" size={22} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>

              {photoPreview && (
                <img
                  src={photoPreview}
                  className="w-40 h-40 object-cover rounded-xl shadow-md border"
                />
              )}
            </div>

            {/* MEDICAL */}
            <h2 className="md:col-span-2 text-lg font-semibold text-[#0c213e] border-b border-[#0c213e]/20 pb-2 pt-4 ">
              Medical Records
            </h2>

            <InputField
              id="allergies"
              label="Allergies"
              placeholder="Dust, Peanuts"
              registerField={register("allergies")}
            />

            <InputField
              id="diseases"
              label="Diseases"
              placeholder="Diabetes, Asthma"
              registerField={register("diseases")}
            />

            <InputField
              id="pastSurgeries"
              label="Past Surgeries"
              placeholder="Appendix Removal"
              registerField={register("pastSurgeries")}
            />

            <InputField
              id="currentMedications"
              label="Current Medications"
              placeholder="Vitamin D, Paracetamol"
              registerField={register("currentMedications")}
            />

            {/* MEDICAL REPORTS */}
            <div className="md:col-span-2">
              <label className="font-medium text-gray-700">
                Upload Medical Reports
              </label>

              <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 bg-blue-50/30 hover:bg-blue-50 transition cursor-pointer flex flex-col items-center text-center relative">
                <Upload className="h-10 w-10 text-blue-600 mb-2" />

                <p className="text-gray-600 font-medium">
                  Drag & Drop files here
                </p>
                <p className="text-gray-400 text-sm">or click to browse</p>

                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  {...register("medicalReports")}
                  onChange={(e:React.ChangeEvent<HTMLInputElement>) => {
                    const files = Array.from(e.target.files || []);
                    setSelectedFiles(files);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {selectedFiles.length > 0 && (
                <ul className="mt-3 text-sm text-gray-700">
                  {selectedFiles.map((file, index) => (
                    <li key={index}>📄 {file.name}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* SUBMIT */}
            <div className="md:col-span-2 text-center mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`cursor-pointer px-8 py-2.5 text-white text-lg font-semibold rounded-lg 
                  bg-[#0c213e] hover:bg-[#1f2775] shadow-md transition 
                  ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {loading ? "Submitting..." : "Register Patient"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
};

export default RegisterPatient;
