import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../Services/mainApi";
import {
  Search as SearchIcon,
  Sparkles,
  Shield,
  Heart,
  Star,
  TrendingUp,
  Zap,
  Clock,
  Award,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

// 🧩 PNG icons
import fullbody from "../assets/icons/fullbody.png";
import diabetes from "../assets/icons/diabetes.png";
import womens from "../assets/icons/womens.png";
import thyroid from "../assets/icons/thyroid.png";
import vitamin from "../assets/icons/vitamin.png";
import blood from "../assets/icons/blood.png";
import heart from "../assets/icons/heart.png";
import kidney from "../assets/icons/kidney.png";
import liver from "../assets/icons/liver.png";
import hairfall from "../assets/icons/hairfall.png";
import fever from "../assets/icons/fever.png";
import senior from "../assets/icons/senior.png";
import testIcon from "../assets/icons/test.png";
import packageIcon from "../assets/icons/package.png";
import pcod from "../assets/icons/pcod.png";
import pregnancy from "../assets/icons/pregnancy.png";
import iron from "../assets/icons/iron.png";
import pill from "../assets/icons/pill.png";
import { useState, useEffect, useMemo } from "react";

// 🧠 Interfaces
interface Lab {
  name?: string;
}

interface LabTest {
  name: string;
  _id: string;
  testName: string;
  shortDescription?: string;
  price?: number;
  category?: string;
  customCategory?: string;
  lab?: Lab;
  labName?: string;
}

interface LabPackage {
  _id: string;
  packageName?: string;
  name?: string;
  title?: string;
  description?: string;
  shortDescription?: string;
  totalPrice?: number;
  price?: number;
  lab?: Lab;
  labName?: string;
  tests?: LabTest[];
}

export default function LabTestsPage() {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [packages, setPackages] = useState<LabPackage[]>([]);
  const [query, setQuery] = useState("");
  const [selectedHealthCheck, setSelectedHealthCheck] = useState<string | null>(null);
  const [showAllTests, setShowAllTests] = useState(false);
  const [showAllPackages, setShowAllPackages] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const iconMap: Record<string, string> = {
    heart,
    liver,
    kidney,
    thyroid,
    vitamin,
    blood,
    diabetes,
    fever,
    hair: hairfall,
    women: womens,
    pcod,
    pregnancy,
    iron,
    senior,
    full: fullbody,
  };

  const getIconForTest = (test: LabTest): string => {
    const name = `${test.testName || ""} ${test.category || ""}`.toLowerCase();
    for (const key of Object.keys(iconMap)) {
      if (name.includes(key)) return iconMap[key];
    }
    return testIcon;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const testRes = await api.get("/api/lab/alllabtests");
        const rawTests = testRes.data as any;
        const testsData: LabTest[] = Array.isArray(rawTests)
          ? rawTests
          : Array.isArray(rawTests?.tests)
          ? rawTests.tests
          : [];

        const normalizedTests: LabTest[] = testsData.map((t: any) => ({
          ...t,
          lab: t.lab || { name: t.labName || "Unknown Lab" },
        }));
        setTests(normalizedTests);

        const packageRes = await api.get("/api/lab/packages");
        const packageData = Array.isArray(packageRes.data)
          ? packageRes.data
          : "packages" in (packageRes.data as Record<string, unknown>) && Array.isArray((packageRes.data as Record<string, unknown>).packages)
          ? (packageRes.data as Record<string, unknown>).packages as LabPackage[]
          : [];

        const normalizedPackages: LabPackage[] = packageData.map((p: any) => ({
          ...p,
          lab: p.lab || { name: p.labName || "Unknown Lab" },
        }));
        setPackages(normalizedPackages);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedHealthCheck) {
      window.scrollTo({ top: 600, behavior: "smooth" });
    }
  }, [selectedHealthCheck]);

  const filteredTests = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tests.filter((t) => {
      const matchesQuery =
        q === "" ||
        t.testName?.toLowerCase().includes(q) ||
        t.shortDescription?.toLowerCase().includes(q);
      const matchesHealth =
        !selectedHealthCheck ||
        t.category?.toLowerCase().includes(selectedHealthCheck.toLowerCase()) ||
        t.customCategory?.toLowerCase().includes(selectedHealthCheck.toLowerCase()) ||
        t.testName?.toLowerCase().includes(selectedHealthCheck.toLowerCase());
      return matchesQuery && matchesHealth;
    });
  }, [tests, query, selectedHealthCheck]);

  const filteredPackages = useMemo(() => {
    const q = query.trim().toLowerCase();
    return packages.filter((p) => {
      const name = p.packageName || p.name || p.title || "";
      const desc = p.description || p.shortDescription || "";
      const matchesQuery =
        q === "" || name.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
      const matchesHealth =
        !selectedHealthCheck ||
        name.toLowerCase().includes(selectedHealthCheck.toLowerCase()) ||
        desc.toLowerCase().includes(selectedHealthCheck.toLowerCase());
      return matchesQuery && matchesHealth;
    });
  }, [packages, query, selectedHealthCheck]);

  const healthChecks = [
    { key: "Full Body Checkup", icon: fullbody, color: "from-blue-500 to-cyan-500" },
    { key: "Diabetes", icon: diabetes, color: "from-green-500 to-emerald-500" },
    { key: "Women's Health", icon: womens, color: "from-pink-500 to-rose-500" },
    { key: "Thyroid", icon: thyroid, color: "from-purple-500 to-violet-500" },
    { key: "Vitamin", icon: vitamin, color: "from-amber-500 to-orange-500" },
    { key: "Blood Studies", icon: blood, color: "from-red-500 to-rose-600" },
    { key: "Heart", icon: heart, color: "from-rose-500 to-red-500" },
    { key: "Kidney", icon: kidney, color: "from-indigo-500 to-blue-500" },
    { key: "Liver", icon: liver, color: "from-teal-500 to-cyan-500" },
    { key: "Hairfall", icon: hairfall, color: "from-gray-600 to-gray-700" },
    { key: "Fever", icon: fever, color: "from-orange-500 to-amber-500" },
    { key: "Senior Citizen", icon: senior, color: "from-slate-600 to-gray-700" },
  ];

  const womenCare = [
    { key: "PCOD Screening", icon: pcod, color: "from-pink-500 to-purple-500" },
    { key: "Blood Studies", icon: blood, color: "from-red-500 to-rose-600" },
    { key: "Pregnancy", icon: pregnancy, color: "from-rose-400 to-pink-500" },
    { key: "Iron Studies", icon: iron, color: "from-amber-600 to-orange-500" },
    { key: "Vitamin", icon: pill, color: "from-cyan-500 to-blue-500" },
  ];

  return (
    <div
      className="relative min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 overflow-hidden"
      style={{ fontFamily: "var(--font-primary, Inter, system-ui, sans-serif)" }}
    >
      {/* Animated Background */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 left-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-200/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div> */}

      {/* Hero Section */}
      <section className="relative pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 px-5 py-2.5 rounded-full text-sm font-semibold text-[#0c213e] mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Trusted by 50,000+ Patients Across India
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#0c213e] via-[#326ec3] to-[#081528] bg-clip-text text-transparent">
                Comprehensive Health Tests
              </span>
              <span className="block text-2xl md:text-3xl text-gray-600 font-semibold mt-3">
                Certified Labs • Accurate Results • Expert Care
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Book diagnostic tests and health packages from certified labs. Get reports delivered
              digitally with free doctor consultation.
            </p>
          </motion.div>

          {/* Premium Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative flex items-center bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden hover:shadow-blue-500/20 transition-all duration-300">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for tests, packages, or health conditions..."
                className="w-full pl-16 pr-36 py-6 text-lg text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
              />
              <button
                onClick={() => window.scrollTo({ top: 900, behavior: "smooth" })}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#0c213e] to-[#275ba4] text-white font-bold px-8 py-4 rounded-xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
              >
                <SearchIcon className="w-5 h-5" />
                Search
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="font-medium">NABL Certified Labs</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-500" />
                <span className="font-medium">100% Accurate Results</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                <span className="font-medium">24-48 Hour Reports</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-20 relative z-10">
        {/* Health Checks Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Popular Health Checks
                </h2>
                <p className="text-sm text-gray-500">
                  Curated by expert doctors for comprehensive screening
                </p>
              </div>
            </div>
            {selectedHealthCheck && (
              <button
                onClick={() => setSelectedHealthCheck(null)}
                className="text-sm font-semibold text-[#0c213e] hover:underline"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {healthChecks.map((hc) => {
              const active = selectedHealthCheck === hc.key;
              return (
                <motion.button
                  key={hc.key}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedHealthCheck(active ? null : hc.key)}
                  className={`group relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 ${
                    active
                      ? "border-[#0c213e] bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg"
                  }`}
                >
                  {active && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#0c213e] rounded-full flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-xl bg-gradient-to-br ${hc.color} shadow-lg mb-3 transform group-hover:scale-110 transition-transform duration-300`}
                  >
                    <img
                      src={hc.icon}
                      alt={hc.key}
                      className="w-8 h-8 object-contain filter brightness-0 invert"
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-800 text-center leading-tight">
                    {hc.key}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Available Tests Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Available Tests</h2>
                <p className="text-sm text-gray-500">{filteredTests.length} tests available</p>
              </div>
            </div>
            {filteredTests.length > 8 && (
              <button
                onClick={() => setShowAllTests(!showAllTests)}
                className="group flex items-center gap-2 bg-white border-2 border-[#0c213e] text-[#0c213e] px-6 py-3 rounded-xl font-semibold hover:bg-[#0c213e] hover:text-white transition-all duration-300"
              >
                {showAllTests ? "Show Less" : "View All"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="flex gap-4 mb-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-300">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Tests Found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filter</p>
              <button
                onClick={() => {
                  setQuery("");
                  setSelectedHealthCheck(null);
                }}
                className="bg-[#0c213e] text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTests.slice(0, showAllTests ? filteredTests.length : 8).map((t) => (
                <motion.div
                  key={t._id}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border-2 border-gray-100 hover:border-blue-200 p-6 flex flex-col transition-all duration-300"
                >
                  <div className="flex gap-4 mb-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 group-hover:from-blue-100 group-hover:to-cyan-100 transition-colors shadow-md">
                      <img
                        src={getIconForTest(t)}
                        alt={t.testName}
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-[#0c213e] transition-colors">
                        {t.testName}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {t.shortDescription || "Comprehensive diagnostic test"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 mt-auto">
                    <div className="text-2xl font-bold text-gray-900">₹{t.price ?? "N/A"}</div>
                    {(t.lab?.name || t.labName) && (
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                        {t.lab?.name || t.labName}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/lab-test-details/${t._id}`, { state: { test: t } })
                    }
                    className="w-full bg-gradient-to-r from-[#0c213e] to-blue-600 text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    View Details
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Health Packages Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Health Packages</h2>
                <p className="text-sm text-gray-500">
                  Complete checkup packages at best prices
                </p>
              </div>
            </div>
            {filteredPackages.length > 8 && (
              <button
                onClick={() => setShowAllPackages(!showAllPackages)}
                className="group flex items-center gap-2 bg-white border-2 border-purple-500 text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-500 hover:text-white transition-all duration-300"
              >
                {showAllPackages ? "Show Less" : "View All"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading packages...</div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-300">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Packages Found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPackages
                .slice(0, showAllPackages ? filteredPackages.length : 8)
                .map((p) => {
                  const packageName = p.packageName || p.name || p.title || "Health Package";
                  const description =
                    p.description || p.shortDescription || "Comprehensive package";
                  const price = p.totalPrice || p.price || "N/A";
                  const included = p.tests || [];

                  return (
                    <motion.div
                      key={p._id || packageName}
                      whileHover={{ y: -8, scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                      className="group bg-gradient-to-br from-white to-purple-50/30 rounded-2xl shadow-lg hover:shadow-2xl border-2 border-purple-100 hover:border-purple-300 p-6 flex flex-col transition-all duration-300"
                    >
                      <div className="flex gap-4 mb-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-200 group-hover:to-pink-200 transition-colors shadow-md">
                          <img
                            src={packageIcon}
                            alt="Package"
                            className="w-10 h-10 object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-purple-700 transition-colors">
                            {packageName}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {description}
                          </p>
                        </div>
                      </div>

                      {Array.isArray(included) && included.length > 0 && (
                        <div className="mb-4 bg-purple-50/50 rounded-lg p-3 border border-purple-100">
                          <div className="text-xs font-bold text-purple-700 mb-1">
                            Includes {included.length} tests:
                          </div>
                          <div className="text-xs text-gray-600 line-clamp-2">
                            {included
                              .slice(0, 2)
                              .map((t: LabTest) => t.testName || t.name)
                              .join(", ")}
                            {included.length > 2 && ` +${included.length - 2} more`}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-4 mt-auto">
                        <div className="text-2xl font-bold text-gray-900">₹{price}</div>
                        {(p.lab?.name || p.labName) && (
                          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
                            {p.lab?.name || p.labName}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          navigate(`/lab-package-details/${p._id}`, { state: { pkg: p } })
                        }
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        View Package
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </motion.div>
                  );
                })}
            </div>
          )}
        </section>

        {/* Women Care Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Women&apos;s Health Care
              </h2>
              <p className="text-sm text-gray-500">Specialized tests for women&apos;s wellness</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {womenCare.map((w) => {
              const active = selectedHealthCheck === w.key;
              return (
                <motion.button
                  key={w.key}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedHealthCheck(active ? null : w.key)}
                  className={`group relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 ${
                    active
                      ? "border-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 shadow-xl"
                      : "border-gray-200 bg-white hover:border-pink-300 hover:shadow-lg"
                  }`}
                >
                  {active && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-xl bg-gradient-to-br ${w.color} shadow-lg mb-3 transform group-hover:scale-110 transition-transform duration-300`}
                  >
                    <img
                      src={w.icon}
                      alt={w.key}
                      className="w-8 h-8 object-contain filter brightness-0 invert"
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-800 text-center leading-tight">
                    {w.key}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
