import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet";
import { useOutletContext } from "react-router-dom";

import { registerDoctor } from "../../Services/doctorApi";
import { FileText, Upload } from "lucide-react";

// ✅ Toastify
import { toast, Toaster } from "react-hot-toast";

type DoctorFormInputs = {
  fullName: string;
  email: string;
  gender: string;
  dob: string;
  regNumber: string;
  mobileNo: string;
  qualification: string;
  experience: string;
  fees: string;
  languages: string;
  aadhar: string;
  pan: string;
  specialization: string;
  password: string;
  address: string;
  state: string;
  city: string;
};

interface ClinicContext {
  clinicId?: string;
}


const RegisterDoctor: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DoctorFormInputs>();


  const context = useOutletContext<ClinicContext | null>();
  const clinicId = context?.clinicId || null;

  const [degreeFile, setDegreeFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  const [degreePreview, setDegreePreview] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [sigPreview, setSigPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: DoctorFormInputs) => {
    setLoading(true);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));
    if (clinicId) formData.append("clinicId", clinicId);
    if (degreeFile) formData.append("degreeCert", degreeFile);
    if (photoFile) formData.append("photo", photoFile);
    if (signatureFile) formData.append("signature", signatureFile);

    try {
      await registerDoctor(formData);

      toast.success("Your details have been submitted for verification !", {
        duration: 3500,
      });

      reset();
      setDegreeFile(null);
      setPhotoFile(null);
      setSignatureFile(null);
      setDegreePreview(null);
      setPhotoPreview(null);
      setSigPreview(null);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Registration failed. Try again!",
        { duration: 3500 }
      );
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    id,
    label,
    type = "text",
    placeholder,
    registerField,
    error,
  }: {
    id: string;
    label: string;
    type?: string;
    placeholder?: string;
    registerField: any;
    error?: string;
  }) => (
    <div className="relative">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...registerField}
        className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-800 shadow-sm focus:ring-2 focus:ring-[#0c213e] focus:border-[#0c213e] transition-all"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFile(file);

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
  }

  return (
    <>
      {/* ✅ Toastify Toaster Added Here */}
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

      <Helmet>
        <title>Doctor Registration | Clinic Portal</title>
        <meta
          name="description"
          content="Register qualified doctors with verified credentials and complete profile details for your clinic."
        />
      </Helmet>

      <main className="min-h-screen bg-white flex items-center justify-center p-4 overflow-y-auto">
        <section className="w-full max-w-5xl bg-white rounded-2xl shadow-lg border border-gray-300 p-6 md:p-8 my-10 md:my-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-[#0c213e]">
              🩺 Doctor Registration
            </h1>
            <p className="mt-2 text-gray-600 text-sm md:text-base">
              Fill in the details below to register a doctor under your clinic.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800"
            encType="multipart/form-data"
          >
            {/* --- Doctor Info Title --- */}
            <h2 className="md:col-span-2 text-lg font-semibold text-[#0c213e] border-b border-[#0c213e]/20 pb-2">
              Doctor Information
            </h2>

            <InputField
              id="fullName"
              label="Full Name"
              placeholder="Dr. John Doe"
              registerField={register("fullName", {
                required: "Full name is required",
              })}
              error={errors.fullName?.message}
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Gender
              </label>
              <select
                {...register("gender", { required: "Gender is required" })}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-800 shadow-sm focus:ring-2 focus:ring-[#0c213e]"
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.gender.message}
                </p>
              )}
            </div>

            <InputField id="dob" label="Date of Birth" type="date" registerField={register("dob")} />
            <InputField id="email" label="Email" type="email" placeholder="doctor@example.com" registerField={register("email")} />

            <InputField
              id="mobileNo"
              label="Mobile Number"
              placeholder="9876543210"
              registerField={register("mobileNo", {
                required: "Mobile number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Mobile number must be 10 digits",
                },
              })}
              error={errors.mobileNo?.message}
            />

            <InputField id="regNumber" label="Medical Registration Number" placeholder="MED123456" registerField={register("regNumber")} />
            <InputField id="qualification" label="Qualification" placeholder="MBBS, MD" registerField={register("qualification")} />
            <InputField id="specialization" label="Specialization" placeholder="Dermatology" registerField={register("specialization")} />
            <InputField id="experience" label="Experience (Years)" placeholder="5" type="number" registerField={register("experience")} />
            <InputField id="fees" label="Consultation Fees" placeholder="500" type="number" registerField={register("fees")} />
            <InputField id="languages" label="Languages Known" placeholder="English, Hindi" registerField={register("languages")} />

            {/* --- Personal Details Title --- */}
            <h2 className="md:col-span-2 text-lg font-semibold text-[#0c213e] border-b border-[#0c213e]/20 pt-4 pb-2">
              Personal Details
            </h2>

            <InputField
              id="aadhar"
              label="Aadhar Number"
              placeholder="123456789012"
              type="number"
              registerField={register("aadhar", {
                required: "Aadhar number is required",
                pattern: {
                  value: /^[0-9]{12}$/,
                  message: "Aadhar must be exactly 12 digits",
                },
              })}
              error={errors.aadhar?.message}
            />

            <InputField
              id="pan"
              label="PAN Number"
              placeholder="ABCDE1234F"
              registerField={register("pan", {
                required: "PAN number is required",
                pattern: {
                  value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                  message: "Enter valid PAN (ABCDE1234F)",
                },
              })}
              error={errors.pan?.message}
            />

            <InputField id="address" label="Address" placeholder="123 Main Street" registerField={register("address")} />
            <InputField id="city" label="City" placeholder="Bhilai" registerField={register("city")} />
            <InputField id="state" label="State" placeholder="Chhattisgarh" registerField={register("state")} />

            <InputField
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              registerField={register("password", {
                required: "Password is required",
              })}
              error={errors.password?.message}
            />

            {/* --- Upload Documents --- */}
            <h2 className="md:col-span-2 text-lg font-semibold text-[#0c213e] border-b border-[#0c213e]/20 pt-4 pb-2">
              Upload Documents
            </h2>

            {[
              {
                label: "Degree Certificate",
                file: degreeFile,
                setFile: setDegreeFile,
                preview: degreePreview,
                setPreview: setDegreePreview,
                accept: "image/*,application/pdf",
              },
              {
                label: "Recent Photo",
                file: photoFile,
                setFile: setPhotoFile,
                preview: photoPreview,
                setPreview: setPhotoPreview,
                accept: "image/*",
              },
              {
                label: "Signature",
                file: signatureFile,
                setFile: setSignatureFile,
                preview: sigPreview,
                setPreview: setSigPreview,
                accept: "image/*",
              },
            ].map((fileInput, idx) => (
              <div key={idx} className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {fileInput.label}
                </label>

                <div className="flex items-center gap-4">
                  <label className="flex items-center justify-center w-full h-28 border-2 border-dashed border-[#0c213e]/40 rounded-lg cursor-pointer hover:bg-[#0c213e]/5 transition">
                    <Upload className="text-[#0c213e] mr-2" size={20} />
                    <span className="text-gray-600 text-sm">
                      {fileInput.file ? "Change File" : "Upload"}
                    </span>
                    <input
                      type="file"
                      accept={fileInput.accept}
                      className="hidden"
                      onChange={(e) =>
                        handleFileChange(e, fileInput.setFile, fileInput.setPreview)
                      }
                    />
                  </label>

                  {fileInput.file && (
                    <div className="border border-[#0c213e]/30 rounded-lg p-2 bg-gray-50 shadow-sm flex items-center justify-center w-28 h-28">
                      {fileInput.preview ? (
                        <img
                          src={fileInput.preview}
                          alt="Preview"
                          className="object-cover w-full h-full rounded-md"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-gray-600 text-xs text-center">
                          <FileText size={20} />
                          <p className="mt-1 truncate">{fileInput.file.name}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* --- Submit Button --- */}
            <div className="md:col-span-2 text-center mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-2.5 text-white text-base font-semibold rounded-lg shadow-md transition-all duration-300 ${
                  loading
                    ? "bg-[#3a49c9] cursor-not-allowed"
                    : "bg-[#0c213e] hover:bg-[#1f2775] hover:scale-[1.02]"
                }`}
              >
                {loading ? "Submitting..." : "Register Doctor"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
};

export default RegisterDoctor;
