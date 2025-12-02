import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Eye, EyeOff, Upload, FileText } from "lucide-react";
import { registerClinic } from "../../Services/mainClinicApi";
import { toast, Toaster } from "react-hot-toast";

type ClinicFormInputs = {
  clinicName: string;
  clinicType: string;
  specialities: string;
  address: string;
  state: string;
  district: string;
  pincode: string;
  contact: string;
  email: string;
  operatingHours: string;
  licenseNo: string;
  ownerAadhar: string;
  ownerPan: string;
  staffName: string;
  staffEmail: string;
  staffPassword: string;
};

const RegisterClinic: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClinicFormInputs>();

  const [certFile, setCertFile] = useState<File | null>(null);
  const [certPreview, setCertPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const generateStaffID = (length = 8) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertFile(file);
      if (file.type.startsWith("image/")) {
        setCertPreview(URL.createObjectURL(file));
      } else {
        setCertPreview(null);
      }
    }
  };

  const onSubmit = async (data: ClinicFormInputs) => {
    setLoading(true);
    const staffId = generateStaffID();

    try {
      await registerClinic({
        ...data,
        specialities: data.specialities
          ? data.specialities.split(",").map((s) => s.trim())
          : [],
        staffId,
        registrationCert: certFile || undefined,
      });

      toast.success("Clinic submitted for verification!");

      reset();
      setCertFile(null);
      setCertPreview(null);
    } catch (err: any) {
      console.error("❌ Error submitting form:", err);
      toast.error(
        err?.response?.data?.message ||
          "Registration failed. Please try again."
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

  return (
    <>
      {/* ✅ Toastify Component */}
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
        <title>Clinic Registration | Health Connect Portal</title>
        <meta
          name="description"
          content="Register your clinic with Health Connect Portal to manage patients, appointments, and staff efficiently."
        />
      </Helmet>

      <main className="min-h-screen bg-white flex items-center justify-center p-4">
        {/* ✅ Smaller card */}
        <section className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-300 p-6 md:p-8 my-10 md:my-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-[#0c213e]">
              🏥 Register Your Clinic
            </h1>
            <p className="mt-2 text-gray-600 text-sm md:text-base">
              Submit your details for verification and onboarding.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800"
            encType="multipart/form-data"
          >
            {/* --- Clinic Info --- */}
            <h2 className="md:col-span-2 text-lg font-semibold text-[#0c213e] border-b border-[#0c213e]/20 pb-2">
              Clinic Information
            </h2>

            <InputField
              id="clinicName"
              label="Clinic Name"
              placeholder="ABC Health Clinic"
              registerField={register("clinicName", {
                required: "Clinic name is required",
              })}
              error={errors.clinicName?.message}
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Clinic Type
              </label>
              <select
                {...register("clinicType", {
                  required: "Clinic type is required",
                })}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-800 shadow-sm focus:ring-2 focus:ring-[#0c213e] transition-all"
              >
                <option value="">Select Clinic Type</option>
                <option value="Private">Private</option>
                <option value="Government">Government</option>
              </select>
              {errors.clinicType && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.clinicType.message}
                </p>
              )}
            </div>

            <InputField
              id="specialities"
              label="Specialities"
              placeholder="Cardiology, Pediatrics"
              registerField={register("specialities")}
            />
            <InputField
              id="address"
              label="Address"
              placeholder="123 Street, City"
              registerField={register("address")}
            />
            <InputField
              id="state"
              label="State"
              placeholder="Maharashtra"
              registerField={register("state")}
            />
            <InputField
              id="district"
              label="District"
              placeholder="Mumbai"
              registerField={register("district")}
            />
            <InputField
              id="pincode"
              label="Pincode"
              placeholder="400001"
              type="number"
              registerField={register("pincode", {
                required: "Pincode is required",
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: "Pincode must be exactly 6 digits",
                },
              })}
              error={errors.pincode?.message}
            />
            <InputField
              id="contact"
              label="Contact Number"
              placeholder="9876543210"
              registerField={register("contact", {
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Contact number must be exactly 10 digits",
                },
              })}
              error={errors.contact?.message}
            />
            <InputField
              id="email"
              label="Email"
              type="email"
              placeholder="clinic@example.com"
              registerField={register("email")}
            />
            <InputField
              id="operatingHours"
              label="Operating Hours"
              placeholder="9 AM - 6 PM"
              registerField={register("operatingHours")}
            />

            {/* --- Owner Info --- */}
            <h2 className="md:col-span-2 text-lg font-semibold text-[#0c213e] border-b border-[#0c213e]/20 pt-4 pb-2">
              Owner Details
            </h2>

            <InputField
              id="licenseNo"
              label="License No"
              placeholder="CLN12345"
              registerField={register("licenseNo")}
            />

            <InputField
              id="ownerAadhar"
              label="Owner Aadhar"
              placeholder="123456789012"
              type="number"
              registerField={register("ownerAadhar", {
                required: "Aadhar number is required",
                pattern: {
                  value: /^[0-9]{12}$/,
                  message: "Aadhar must be exactly 12 digits",
                },
              })}
              error={errors.ownerAadhar?.message}
            />

            <InputField
              id="ownerPan"
              label="Owner PAN"
              placeholder="ABCDE1234F"
              registerField={register("ownerPan", {
                required: "PAN number is required",
                pattern: {
                  value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                  message: "Enter valid PAN (ABCDE1234F)",
                },
              })}
              error={errors.ownerPan?.message}
            />

            {/* --- Staff Info --- */}
            <h2 className="md:col-span-2 text-lg font-semibold text-[#0c213e] border-b border-[#0c213e]/20 pt-4 pb-2">
              Staff Details
            </h2>

            <InputField
              id="staffName"
              label="Staff Name"
              placeholder="John Doe"
              registerField={register("staffName")}
            />
            <InputField
              id="staffEmail"
              label="Staff Email"
              type="email"
              placeholder="staff@clinic.com"
              registerField={register("staffEmail")}
            />

            <div className="relative">
              <label
                htmlFor="staffPassword"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Staff Password
              </label>
              <input
                id="staffPassword"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                {...register("staffPassword", {
                  required: "Password is required",
                })}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 pr-10 text-gray-800 shadow-sm focus:ring-2 focus:ring-[#0c213e] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-gray-500 hover:text-[#0c213e]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.staffPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.staffPassword.message}
                </p>
              )}
            </div>

            {/* --- File Upload --- */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Registration Certificate
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="flex items-center justify-center w-full sm:w-1/2 h-28 border-2 border-dashed border-[#0c213e]/40 rounded-lg cursor-pointer hover:bg-[#0c213e]/5 transition">
                  <Upload className="text-[#0c213e] mr-2" size={20} />
                  <span className="text-gray-600 text-sm">
                    {certFile ? "Change File" : "Upload Certificate"}
                  </span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                {certFile && (
                  <div className="border border-[#0c213e]/30 rounded-lg p-2 bg-gray-50 shadow-sm flex items-center justify-center w-28 h-28">
                    {certPreview ? (
                      <img
                        src={certPreview}
                        alt="Preview"
                        className="object-cover w-full h-full rounded-md"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-600 text-xs text-center">
                        <FileText size={20} />
                        <p className="mt-1 truncate">{certFile.name}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* --- Submit --- */}
            <div className="md:col-span-2 text-center mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-2.5 text-white text-base font-semibold rounded-lg shadow-md transition-all duration-300 ${
                  loading
                    ? "bg-[#0c213e] cursor-not-allowed"
                    : "bg-[#0c213e] hover:bg-[#0c213e] hover:scale-[1.02]"
                }`}
              >
                {loading ? "Submitting..." : "Register Clinic"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
};

export default RegisterClinic;
