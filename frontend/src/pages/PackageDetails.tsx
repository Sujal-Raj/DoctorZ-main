
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../Services/mainApi";
import packageIcon from "../assets/package.webp";
import kidneyIcon from "../assets/kidneyIcon.png";
import vitaminIcon from "../assets/vitaminIcon.jpg";
import heartIcon from "../assets/heartIcon.jpg";
import pregnancyIcon from "../assets/pregnancyIcon.jpg";
import {
  Clock,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Thermometer,
  Pill,
  TestTube,
} from "lucide-react";
import toast from "react-hot-toast";

// --- Types ---
interface Test {
  _id: string;
  testName: string;
  price: number;
  category: string;
  description: string;
}

interface PackageDetailsType {
  _id: string;
  labId: string | { _id: string };
  packageName: string;
  description: string;
  totalPrice: number;
  tests: Test[];
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  message: string;
  packageDetails: PackageDetailsType;
}

type TestCategory =
  | "Liver"
  | "Kidney"
  | "Diabetes"
  | "Fever"
  | "Vitamin"
  | "Pregnancy"
  | "Heart"
  | "Other";

// --- Category Icons ---
const categoryIcons: Record<TestCategory, React.ReactElement> = {
  Liver: <FlaskConical size={22} className="text-[#004b63]" />,
  Kidney: (
    <img src={kidneyIcon} alt="Kidney" className="w-6 h-6 object-contain -mt-[2px]" />
  ),
  Diabetes: <Pill size={22} className="text-[#004b63]" />,
  Fever: <Thermometer size={22} className="text-[#004b63]" />,
  Vitamin: (
    <img src={vitaminIcon} alt="Vitamin" className="w-6 h-6 object-contain -mt-[2px]" />
  ),
  Pregnancy: (
    <img src={pregnancyIcon} alt="Pregnancy" className="w-6 h-6 object-contain -mt-[2px]" />
  ),
  Heart: <img src={heartIcon} alt="Heart" className="w-6 h-6 object-contain -mt-[2px]" />,
  Other: <TestTube size={22} className="text-[#004b63]" />,
};

// --- Component ---
export const PackageDetails: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const [packageDetails, setPackageDetails] = useState<PackageDetailsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        const response = await api.get<ApiResponse>(`/api/lab/packages/${packageId}`);
        setPackageDetails(response.data.packageDetails);
      } catch (error) {
        console.error("Error fetching package details:", error);
      }
    };
    fetchPackageDetails();
  }, [packageId]);
  useEffect(() => {
  window.scrollTo(0, 0);
}, []);


  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handlePackageBooking = async (packageId: string, labId: string) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row:string) => row.startsWith("patientToken="))
        ?.split("=")[1];

      if (!token) {
        toast.error("Please login to book the package.");
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

      await api.post(
        `/api/lab/packages/book`,
        { packageId, patientId, labId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

    toast.success("Package booked successfully!");
    } catch (error) {
      console.error("Error booking package:", error);
    toast.error("Failed to book package. Please try again." );
    }
  };

  if (!packageDetails) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold text-gray-600">
        Loading Package Details...
      </div>
    );
  }

  // --- Group tests by category ---
  const groupedTests = packageDetails.tests.reduce((groups, test) => {
    const cat = test.category && test.category.trim() !== "" ? test.category : "Other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(test);
    return groups;
  }, {} as Record<string, Test[]>);

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10 flex flex-col md:flex-row gap-6 justify-center items-start">
      {/* LEFT SECTION */}
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full md:w-1/3">
        <div className="flex gap-2.5">
          <img src={packageIcon} alt="Package" className="w-20 h-20 mb-4" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{packageDetails.packageName}</h2>
            <p className="text-gray-600 leading-relaxed">{packageDetails.description}</p>
          </div>
        </div>

        <div className="text-md border-t border-gray-200 pt-4 space-y-3 text-gray-700">
          <div className="flex items-center gap-2">
            <Clock className="text-indigo-600" size={18} />
            <span>Sample collection within <strong>2 hours</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="text-indigo-600" size={18} />
            <span>Reports available within <strong>10 hours</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="text-indigo-600" size={18} />
            <span>10–12 hr fasting is required</span>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-gray-600 line-through text-sm">
            MRP ₹{Math.round(packageDetails.totalPrice * 1.6)}
          </p>
          <p className="text-2xl font-bold text-bg-[#0c213e]">₹{packageDetails.totalPrice}</p>
          <p className="text-green-600 font-medium text-sm">60% off</p>
        </div>

        <button
          onClick={() =>
            handlePackageBooking(
              packageDetails._id,
              typeof packageDetails.labId === "string"
                ? packageDetails.labId
                : packageDetails.labId._id
            )
          }
          className="mt-6 w-full bg-[#0c213e] text-white font-semibold py-3 rounded-xl bg-[#0c213e]transition"
        >
          {loading ? "Booking..." : "Book Now"}
        </button>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex flex-col gap-6 w-full md:w-2/3">
        {/* TESTS INCLUDED */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            Test(s) Included ({packageDetails.tests.length})
          </h3>

          {packageDetails.tests.length > 0 ? (
            <div className="space-y-3">
              {Object.entries(groupedTests).map(([category, tests]) => (
                <div key={category} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-2">
                      {categoryIcons[category as TestCategory] || categoryIcons["Other"]}
                      <span className="font-semibold text-gray-800">{category}</span>
                      <span className="text-gray-500 text-sm">({tests.length})</span>
                    </div>
                    <span className="text-gray-500">
                      {openCategories[category] ? (
                        <ChevronUp size={20} className="text-[#004b63]" />
                      ) : (
                        <ChevronDown size={20} className="text-[#004b63]" />
                      )}
                    </span>
                  </button>

                  {openCategories[category] && (
                    <div className="bg-gray-50 border-t border-gray-100">
                      {tests.map((test) => (
                        <div key={test._id} className="p-3 pl-6 border-b last:border-b-0">
                          <p className="font-medium text-indigo-700">{test.testName}</p>
                          {test.description && (
                            <p className="text-gray-600 text-sm mt-1">{test.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No tests available for this package.</p>
          )}
        </div>

        {/* FAQ SECTION */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">FAQs</h3>

          <div className="divide-y divide-gray-200">
            {[
              {
                question: "Why is a blood test important?",
                answer:
                  "Blood tests help evaluate your overall health and detect a wide range of disorders such as anemia, infection, and diabetes.",
              },
              {
                question: "Do I need to fast before a blood test?",
                answer:
                  "Yes, fasting for 8–12 hours is required for certain tests like lipid profile or blood glucose tests for accurate results.",
              },
              {
                question: "How long does it take to get blood test results?",
                answer:
                  "Most basic test results are available within 6–12 hours. However, some specialized tests may take up to 24–48 hours.",
              },
              {
                question: "Is blood sample collection painful?",
                answer:
                  "No, only a small prick is felt during sample collection. The process is quick and safe.",
              },
            ].map((faq, i) => (
              <details key={i} className="group py-3 cursor-pointer transition-all duration-300">
                <summary className="flex justify-between items-center text-gray-800 font-medium text-base list-none">
                  {faq.question}
                  <span className="ml-2 text-indigo-600 group-open:rotate-180 transition-transform">
                    <ChevronDown size={20} />
                  </span>
                </summary>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed pl-1">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
