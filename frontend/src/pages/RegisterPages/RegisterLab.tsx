import { useState } from "react";
import { registerLab } from "../../Services/labApi";

// ✅ Toastify
import { toast, Toaster } from "react-hot-toast";

interface Timings {
  open: string;
  close: string;
}

interface Lab {
  name: string;
  email: string;
  password: string;
  state: string;
  city: string;
  pincode: string;
  address: string;
  timings: Timings;
}

export default function RegisterLab() {
  const [pincodeError, setPincodeError] = useState("");
  const [loading, setLoading] = useState(false);

  const [lab, setLab] = useState<Lab & { certificateNumber?: string }>({
    name: "",
    email: "",
    password: "",
    state: "",
    city: "",
    pincode: "",
    address: "",
    timings: { open: "", close: "" },
    certificateNumber: "",
  });

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "open" || name === "close") {
      setLab((prev) => ({
        ...prev,
        timings: { ...prev.timings, [name]: value },
      }));
    } else {
      setLab((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRegistration = async () => {
    if (!/^[0-9]{6}$/.test(lab.pincode)) {
      setPincodeError("Pincode must be exactly 6 digits");
      return;
    }

    setLoading(true);
    setPincodeError("");

    const cleanedData = {
      ...lab,
      email: lab.email.trim().toLowerCase(),
    };

    try {
      const response = await registerLab(cleanedData);
      if (response.status === 201) {
        toast.success(
          "Registration Successful! Your lab details have been submitted for admin approval.",
          { duration: 3500 }
        );

        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error registering lab", {
        duration: 3500,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ Toastify Toaster */}
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

      {/* SEO */}
      <head>
        <title>Register Your Diagnostic Lab | HealthCare Platform</title>
        <meta
          name="description"
          content="Register your diagnostic lab easily on our platform. Get verified and reach patients in your area."
        />
        <meta
          name="keywords"
          content="lab registration, diagnostic center, healthcare platform"
        />
      </head>

      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 flex items-center justify-center px-6 py-16">
        <section
          className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-10 animate-fade-in"
          aria-label="Lab registration form"
        >
          <h1 className="text-3xl font-extrabold text-[#0c213e] text-center mb-8 tracking-tight">
            🧪 Register Your Laboratory
          </h1>
          <p className="text-center text-gray-600 mb-10">
            Join our trusted network of diagnostic centers. Fill in your lab
            details below.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegistration();
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Input label="Lab Name" name="name" value={lab.name} onChange={handleOnChange} />
            <Input label="Email" type="email" name="email" value={lab.email} onChange={handleOnChange} />
            <Input
              label="Password"
              type="password"
              name="password"
              minLength={8}
              value={lab.password}
              onChange={handleOnChange}
            />
            <Input
              label="Certificate Number"
              name="certificateNumber"
              value={lab.certificateNumber}
              onChange={handleOnChange}
            />
            <Input label="State" name="state" value={lab.state} onChange={handleOnChange} />
            <Input label="City" name="city" value={lab.city} onChange={handleOnChange} />
            <Input label="Address" name="address" value={lab.address} onChange={handleOnChange} />

            <div>
              <Input
                label="Pincode"
                name="pincode"
                value={lab.pincode}
                onChange={(e) => {
                  setPincodeError("");
                  handleOnChange(e);
                }}
                placeholder="Enter 6-digit pincode"
              />
              {pincodeError && (
                <p className="text-red-500 text-xs mt-1">{pincodeError}</p>
              )}
            </div>

            <Input
              label="Opening Time"
              name="open"
              value={lab.timings.open}
              onChange={handleOnChange}
              placeholder="e.g. 9:00 AM"
            />
            <Input
              label="Closing Time"
              name="close"
              value={lab.timings.close}
              onChange={handleOnChange}
              placeholder="e.g. 7:00 PM"
            />

            <div className="md:col-span-2 text-center mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-2.5 text-white text-lg font-semibold rounded-lg 
                  bg-[#0c213e] hover:bg-[#1f2775] shadow-md transition 
                  ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {loading ? "Submitting..." : "Register Lab"}
              </button>
            </div>
          </form>

          <p className="text-center text-gray-600 mt-8">
            Already registered?{" "}
            <a
              href="/lab-login"
              className="cursor-pointer text-blue-600 font-semibold hover:underline"
            >
              Login Here
            </a>
          </p>
        </section>
      </main>
    </>
  );
}

/* Reusable Input Component */
function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  minLength,
  pattern,
  title,
}: {
  label: string;
  name: string;
  type?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  minLength?: number;
  pattern?: string;
  title?: string;
}) {
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        minLength={minLength}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder || label}
        className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800 bg-white"
        required
        pattern={pattern}
        title={title}
      />
    </div>
  );
}
