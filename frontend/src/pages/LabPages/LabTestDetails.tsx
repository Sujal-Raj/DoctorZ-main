
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import api from "../../Services/mainApi";


import diabetes from "../../assets/diabetes.png";
import fever from "../../assets/Fever and infections.png";
import Pregnancy from "../../assets/Pregnancy.png";
import vitamin from "../../assets/vitamin.png";
import Liver from "../../assets/Liver.png";
import kidney from "../../assets/kidney.png";
import Heart from "../../assets/Heart.png";
import Imaging from "../../assets/Imaging.png";

import toast from "react-hot-toast";

interface Test {
  _id: string;
  testName: string;
  price: number;
  labId: string;
  labName: string;
  category?: string;
  description?: string;
  precautions?: string;
  includedTests?: string[];
  reportFile?: string | null;
}

export default function LabTestDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const test = location.state?.test as Test | undefined;

  const [loading, setLoading] = useState(false);
  // const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [otherTests, setOtherTests] = useState<Test[]>([]);

  const categoryImages: Record<string, string> = {
    kidney,
    fever,
    pregnancy: Pregnancy,
    diabetes,
    vitamin,
    liver: Liver,
    heart: Heart,
    imaging: Imaging,
  };

  useEffect(() => {
    if (!test) navigate("/all-lab-test");
  }, [test, navigate]);
  useEffect(() => {
  window.scrollTo(0, 0);
}, []);


  useEffect(() => {
    const fetchOtherTests = async () => {
      if (!test?.labId) return;
      try {
        const res = await api.get(`/api/lab/alllabtests`);
        if (Array.isArray(res.data)) {
          const sameLabTests = res.data.filter(
            (t: Test) => t.labId === test.labId && t._id !== test._id
          );
          setOtherTests(sameLabTests.slice(0, 4));
        }
      } catch (err) {
        console.error("Error fetching other tests:", err);
      }
    };
    fetchOtherTests();
  }, [test]);

  if (!test) return null;

  const handleBookTest = async () => {
    setLoading(true);
    // setBookingStatus(null);

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("patientToken="))
        ?.split("=")[1];

      if (!token) {
       toast.error("Please login to book the test.");
        setLoading(false);
        return;
      }

      let patientId: string | null = null;
      try {
        const base64Payload = token.split(".")[1];
        const payload = JSON.parse(atob(base64Payload));
        patientId = payload.id;
      } catch {
      toast.error("Invalid session. Please login again.");
        setLoading(false);
        return;
      }

      const payload = {
        test: {
          labId: test.labId,
          name: test.testName,
          price: test.price,
          category: test.category || "General",
        },
        patientId,
      };

      const res = await api.post("/api/lab/bookTest", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Booking response:", res.data);
     toast.success("Test booked successfully!");
      // setBookingStatus("Booking successful!");

    } catch (error) {
      console.error("❌ Booking error:", error);
     toast.error("Booking failed. Try again.");
      // setBookingStatus("Booking failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewOtherTest = (selectedTest: Test) => {
    navigate(`/lab-test-details/${selectedTest._id}`, {
      state: { test: selectedTest },
    });
  };

  const categoryKey = test.category?.toLowerCase() || "";
  const imageSrc = categoryImages[categoryKey] || "/placeholder-image.jpg";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {test.testName}
              </h1>
              <p className="text-gray-600 mt-1">
                Provided by{" "}
                <span className="font-semibold text-[#0c213e]">
                  {test.labName}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-indigo-100 text-[#0c213e] text-sm font-medium px-3 py-1 rounded-full">
                {test.category || "General"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Test Card */}
            <div className="bg-white rounded-xl  border border-gray-300 p-6 text-center">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-100 p-3 mb-4">
                <img
                  src={imageSrc}
                  alt={test.testName}
                  className="w-full h-full object-contain"
                />
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {test.testName}
              </h2>

              <div className="mb-6">
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-gray-500 line-through text-sm">
                    ₹{test.price + 200}
                  </span>
                  <span className="text-3xl font-bold text-[#0c213e]">
                    ₹{test.price}
                  </span>
                </div>
                <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded">
                  Save ₹200
                </span>
              </div>

              {/* Features */}
              <div className="w-full space-y-2 mb-6">
                <FeatureItem text="Reports in 10 hours" />
                <FeatureItem text="2 hour collection window" />
                <FeatureItem text="NABL certified labs" />
              </div>

              {/* Book Button */}
              <button
                onClick={handleBookTest}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-[#0c213e] text-white hover:bg-[#0c213e]"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Book Test Now"
                )}
              </button>

              {/* {bookingStatus && (
                <p
                  className={`mt-3 text-sm font-medium ${
                    bookingStatus.includes("successful")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {bookingStatus}
                </p>
              )} */}

              {test.reportFile && (
                <a
                  href={test.reportFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-4 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  Download Sample Report
                </a>
              )}
            </div>

            {/* Other Tests */}
            {otherTests.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-300 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Other Tests from {test.labName}
                </h3>
                <div className="space-y-3">
                  {otherTests.map((t) => (
                    <div
                      key={t._id}
                      onClick={() => handleViewOtherTest(t)}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition cursor-pointer group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate group-hover:text-[#0c213e]">
                          {t.testName}
                        </p>
                        <p className="text-sm text-gray-500">{t.category}</p>
                      </div>
                      <span className="text-lg font-bold text-[[#0c213e]">
                        ₹{t.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <div className="bg-white rounded-xl border border-gray-300 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Test Overview
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {test.description ||
                  `The ${test.testName} is a diagnostic procedure designed to evaluate your ${
                    test.category?.toLowerCase() || "health"
                  } condition, providing valuable insights for accurate diagnosis and treatment planning.`}
              </p>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-xl border border-gray-300 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Test Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SpecItem label="Sample Type" value="Blood" />
                <SpecItem label="Gender" value="Both" />
                <SpecItem label="Age Group" value="7 years & above" />
                <SpecItem label="Fasting Required" value="10–12 hours" />
                <SpecItem
                  label="Test Category"
                  value={test.category || "General"}
                />
                <SpecItem label="Report Time" value="10 hours" />
              </div>
            </div>

            {/* Precautions */}
            {test.precautions && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-orange-900 mb-3">
                  Important Precautions
                </h3>
                <p className="text-orange-800 leading-relaxed">
                  {test.precautions}
                </p>
              </div>
            )}

            {/* Benefits */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-300 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[#0c213e] mb-4">
                Why Choose This Test?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BenefitItem
                  title="Accurate Results"
                  description="Precise testing with advanced equipment"
                />
                <BenefitItem
                  title="Expert Analysis"
                  description="Reviewed by certified pathologists"
                />
                <BenefitItem
                  title="Quick Turnaround"
                  description="Fast results without compromising quality"
                />
                <BenefitItem
                  title="Home Collection"
                  description="Convenient sample collection at your location"
                />
              </div>
            </div>

            {/* Lab Info */}
            <div className="bg-white rounded-xl border border-gray-300 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                About {test.labName}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {test.labName} is a premier diagnostic center accredited with
                NABL certification, renowned for its commitment to accuracy and
                patient care. Equipped with state-of-the-art technology and
                staffed by experienced healthcare professionals, the lab ensures
                reliable results and a seamless testing experience.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <LabFeature feature="NABL Certified" />
                <LabFeature feature="Modern Equipment" />
                <LabFeature feature="Expert Technicians" />
                <LabFeature feature="Quick Results" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Subcomponents (Text Only)
const FeatureItem = ({ text }: { text: string }) => (
  <div className="text-sm text-gray-700">{text}</div>
);

const SpecItem = ({ label, value }: { label: string; value: string }) => (
  <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-semibold text-gray-900">{value}</p>
  </div>
);

const BenefitItem = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div>
    <p className="font-semibold text-[#0c213e]">{title}</p>
    <p className="text-sm text-indigo-700">{description}</p>
  </div>
);

const LabFeature = ({ feature }: { feature: string }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-[#28328C]">
    {feature}
  </span>
);
