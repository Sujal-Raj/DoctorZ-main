import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Box, Edit3, Trash2 } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

/* -------------------- Types -------------------- */
interface LabDashboardContext {
  labId: string | null;
}

interface Test {
  _id?: string;
  testName: string;
  price: number;
  precaution?: string;
  description?: string;
  category?: string;
  customCategory?: string;
}

interface Package {
  _id?: string;
  packageName: string;
  description?: string;
  totalPrice: number;
  tests: (string | Test)[];
}

/* -------------------- API -------------------- */
const API_BASE = "http://localhost:3000/api/lab";
const API = {
  getTestsByLab: (labId: string) => `${API_BASE}/getAllTestByLabId/${labId}`,
  addTest: () => `${API_BASE}/addTest`,
  updateTest: (testId: string) => `${API_BASE}/updateLabTest/${testId}`,
  deleteTest: (testId: string) => `${API_BASE}/deleteLabTest/${testId}`,

  addPackage: () => `${API_BASE}/addPackage`,
  getPackagesByLab: (labId: string) => `${API_BASE}/getAllPackagesByLabId/${labId}`,
  updatePackage: (packageId: string) => `${API_BASE}/updatePackage/${packageId}`,
  deletePackage: (packageId: string) => `${API_BASE}/deletePackage/${packageId}`,
};

/* -------------------- Constants -------------------- */
const categories = [
  "Liver",
  "Kidney",
  "Diabetes",
  "Fever",
  "Vitamin",
  "Pregnancy",
  "Heart",
  "Other",
];

/* -------------------- Component -------------------- */
const LabManagementPro: React.FC = () => {
  const { labId } = useOutletContext<LabDashboardContext>();

  const [tests, setTests] = useState<Test[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"tests" | "packages">("tests");
  const [showAllTests, setShowAllTests] = useState(false);
  const [showAllPackages, setShowAllPackages] = useState(false);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [testForm, setTestForm] = useState<Partial<Test>>({
    testName: "",
    price: 0,
    description: "",
    precaution: "",
    category: "",
    customCategory: "",
  });

  const [packageForm, setPackageForm] = useState<Partial<Package>>({
    packageName: "",
    description: "",
    totalPrice: 0,
    tests: [],
  });

  /* -------------------- Effects -------------------- */
  useEffect(() => {
    if (!labId) return;
    loadAll();
  }, [labId]);

  const loadAll = async () => {
    if (!labId) return;
    setLoading(true);
    try {
      const [tRes, pRes] = await Promise.all([
        axios.get<{ tests: Test[] }>(API.getTestsByLab(labId)),
        axios.get<{ packages: Package[] }>(API.getPackagesByLab(labId)),
      ]);
      setTests(tRes.data.tests || []);
      setPackages(pRes.data.packages || []);
    } catch (err) {
      console.error("Load error:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Helpers -------------------- */
  const resetTestForm = () =>
    setTestForm({
      testName: "",
      price: 0,
      description: "",
      precaution: "",
      category: "",
      customCategory: "",
    });

  const resetPackageForm = () =>
    setPackageForm({
      packageName: "",
      description: "",
      totalPrice: 0,
      tests: [],
    });

  const getTestName = (t: any) => {
    if (!t) return "";
    return typeof t === "string"
      ? tests.find((x) => x._id === t)?.testName ?? "Test"
      : t.testName ?? "Test";
  };

  /* -------------------- Filtered lists -------------------- */
  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const matchQuery =
        query.trim() === "" ||
        t.testName.toLowerCase().includes(query.toLowerCase()) ||
        (t.description || "").toLowerCase().includes(query.toLowerCase());

      const matchCategory =
        categoryFilter === "" || t.category === categoryFilter;

      return matchQuery && matchCategory;
    });
  }, [tests, query, categoryFilter]);

  const filteredPackages = useMemo(() => {
    return packages.filter((p) => {
      const matchQuery =
        query.trim() === "" ||
        p.packageName.toLowerCase().includes(query.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(query.toLowerCase());
      return matchQuery;
    });
  }, [packages, query]);

  /* -------------------- Test CRUD -------------------- */
  const openAddTest = () => {
    setActiveTab("tests");
    setIsEditMode(false);
    setEditingId(null);
    resetTestForm();
    setModalOpen(true);
  };

  const openEditTest = (t: Test) => {
    setActiveTab("tests");
    setIsEditMode(true);
    setEditingId(t._id || null);
    setTestForm({ ...t });
    setModalOpen(true);
  };

  const submitTest = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!labId) return toast.error("Lab ID missing");
    if (!testForm.testName || testForm.price === undefined)
      return toast.error("Test name & price required");

    try {
      if (isEditMode && editingId) {
        const payload = {
          testName: testForm.testName,
          price: Number(testForm.price),
          description: testForm.description || "",
          precaution: testForm.precaution || "",
          category:
            testForm.category === "Other"
              ? testForm.customCategory || "Other"
              : testForm.category,
        };

        const res = await axios.put<{ updatedTest: Test }>(API.updateTest(editingId), payload);
        setTests((prev) =>
          prev.map((x) => (x._id === editingId ? res.data.updatedTest : x))
        );

        toast.success("Test updated");
      } else {
        const payload = [
          {
            ...testForm,
            price: Number(testForm.price),
            category:
              testForm.category === "Other"
                ? testForm.customCategory || "Other"
                : testForm.category,
            labId,
          },
        ];

        const res = await axios.post<{ tests: Test[] }>(API.addTest(), payload);
        setTests((prev) => [...res.data.tests, ...prev]);
        toast.success("Test added");
      }

      setModalOpen(false);
      loadAll();
    } catch (err) {
      console.error("Test submit error:", err);
      toast.error("Failed to save test");
    }
  };

  const removeTest = async (testId?: string) => {
    if (!testId) return;

    const ok = confirm(
      "Are you sure? This will also remove it from all packages."
    );
    if (!ok) return;

    try {
      await axios.delete(API.deleteTest(testId));
      setTests((prev) => prev.filter((x) => x._id !== testId));

      setPackages((prev) =>
        prev.map((p) => ({
          ...p,
          tests: p.tests.filter((t: any) =>
            typeof t === "string" ? t !== testId : t._id !== testId
          ),
        }))
      );

      toast.success("Test deleted");
    } catch (err) {
      console.error("Delete test error:", err);
      toast.error("Failed to delete test");
    }
  };

  /* -------------------- Package CRUD -------------------- */
  const openAddPackage = () => {
    setActiveTab("packages");
    setIsEditMode(false);
    setEditingId(null);
    resetPackageForm();
    setModalOpen(true);
  };

  const openEditPackage = (p: Package) => {
    setActiveTab("packages");
    setIsEditMode(true);
    setEditingId(p._id || null);

    const testIds = p.tests
      .map((t) => (typeof t === "string" ? t : t._id))
      .filter((id): id is string => id !== undefined);

    setPackageForm({
      packageName: p.packageName,
      description: p.description,
      totalPrice: p.totalPrice,
      tests: testIds,
    });

    setModalOpen(true);
  };

  const togglePackageTest = (testId: string) => {
    setPackageForm((s) => {
      const curr = (s.tests as string[]) || [];
      return {
        ...s,
        tests: curr.includes(testId)
          ? curr.filter((id) => id !== testId)
          : [...curr, testId],
      };
    });
  };

  const submitPackage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!labId) return toast.error("Lab ID missing");
    if (!packageForm.packageName || packageForm.totalPrice === undefined)
      return toast.error("Package name & price required");

    if (!packageForm.tests || packageForm.tests.length === 0)
      return toast.error("Select at least one test");

    try {
      const payload = {
        packageName: packageForm.packageName,
        description: packageForm.description || "",
        totalPrice: Number(packageForm.totalPrice),
        testIds: packageForm.tests,
        labId,
      };

      if (isEditMode && editingId) {
        await axios.put(API.updatePackage(editingId), payload);
        toast.success("Package updated");
      } else {
        await axios.post(API.addPackage(), payload);
        toast.success("Package created");
      }

      setModalOpen(false);
      loadAll();
    } catch (err) {
      console.error("Package submit error:", err);
      toast.error("Failed to save package");
    }
  };

  const removePackage = async (packageId?: string) => {
    if (!packageId) return;

    const ok = confirm("Delete this package?");
    if (!ok) return;

    try {
      await axios.delete(API.deletePackage(packageId));
      setPackages((prev) => prev.filter((p) => p._id !== packageId));

      toast.success("Package deleted");
    } catch (err) {
      console.error("Delete package error:", err);
      toast.error("Failed to delete package");
    }
  };

  /* -------------------- JSX -------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-6">
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

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">
              Lab Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Professional management for tests & packages.
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <div className="flex items-center bg-white rounded-full border px-3 py-1 shadow-sm">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tests or packages..."
                className="outline-none text-sm w-64"
              />
            </div>

            <div className="hidden md:flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-md border px-2 py-1 text-sm"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option value={c} key={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={openAddTest}
              className="bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-4 py-2 inline-flex items-center gap-2 shadow"
            >
              <Plus className="w-4 h-4" /> Add Test
            </button>
            <button
              onClick={openAddPackage}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-4 py-2 inline-flex items-center gap-2 shadow"
            >
              <Box className="w-4 h-4" /> Create Package
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow border flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Total Tests</div>
              <div className="text-2xl font-bold text-slate-800">
                {tests.length}
              </div>
            </div>
            <div className="text-sky-600 text-2xl">🧪</div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow border flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Total Packages</div>
              <div className="text-2xl font-bold text-slate-800">
                {packages.length}
              </div>
            </div>
            <div className="text-amber-600 text-2xl">🎁</div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow border">
            <div className="text-sm text-slate-500">Search & Filters</div>
            <div className="mt-2 text-sm text-slate-600">
              Use search box or filter dropdown.
            </div>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setActiveTab("tests")}
            className={`py-2 px-3 rounded-md text-sm font-semibold ${
              activeTab === "tests" ? "bg-white shadow" : "text-slate-700"
            }`}
          >
            Tests
          </button>
          <button
            onClick={() => setActiveTab("packages")}
            className={`py-2 px-3 rounded-md text-sm font-semibold ${
              activeTab === "packages" ? "bg-white shadow" : "text-slate-700"
            }`}
          >
            Packages
          </button>
        </nav>

        {/* Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TEST LIST */}
          <section className="bg-white rounded-2xl p-5 shadow border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Tests</h3>
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-500 hidden md:block">
                  {filteredTests.length} results
                </div>
                <button
                  onClick={() => setShowAllTests((s) => !s)}
                  className="px-3 py-1 rounded-md text-sm text-slate-600"
                >
                  {showAllTests
                    ? "View Less"
                    : `View All (${filteredTests.length})`}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-slate-500">Loading...</div>
            ) : filteredTests.length === 0 ? (
              <div className="text-sm text-slate-500">No tests found.</div>
            ) : !showAllTests ? (
              <div className="flex gap-4 overflow-x-auto py-2 px-1 scrollbar-hide">
                {filteredTests.slice(0, 4).map((t) => (
                  <motion.article
                    key={t._id}
                    whileHover={{ y: -4 }}
                    className="min-w-[300px] bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">
                        {t.testName}
                      </div>
                      <div className="text-sm text-slate-500">
                        ₹{t.price}
                      </div>
                      <div className="text-xs text-slate-400 mt-2">
                        {t.description}
                      </div>
                      <div className="mt-3 text-xs text-slate-500">
                        Category: {t.category}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => openEditTest(t)}
                        className="inline-flex items-center gap-2 px-2 py-1 rounded bg-amber-400 text-white text-xs"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => removeTest(t._id)}
                        className="inline-flex items-center gap-2 px-2 py-1 rounded bg-red-500 text-white text-xs"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredTests.map((t) => (
                  <motion.article
                    key={t._id}
                    whileHover={{ y: -4 }}
                    className="bg-white border rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="font-semibold">{t.testName}</div>
                        <div className="text-sm text-slate-500">
                          ₹{t.price}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {t.description}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">
                          Category: {t.category}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => openEditTest(t)}
                          className="px-2 py-1 rounded bg-amber-400 text-white text-xs inline-flex items-center gap-2"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => removeTest(t._id)}
                          className="px-2 py-1 rounded bg-red-500 text-white text-xs inline-flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </section>

          {/* PACKAGE LIST */}
          <section className="bg-white rounded-2xl p-5 shadow border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Packages</h3>
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-500 hidden md:block">
                  {filteredPackages.length} results
                </div>
                <button
                  onClick={() => setShowAllPackages((s) => !s)}
                  className="px-3 py-1 rounded-md text-sm text-amber-600"
                >
                  {showAllPackages
                    ? "View Less"
                    : `View All (${filteredPackages.length})`}
                </button>
              </div>
            </div>

            {filteredPackages.length === 0 ? (
              <div className="text-sm text-slate-500">
                No packages created yet.
              </div>
            ) : !showAllPackages ? (
              <div className="flex gap-4 overflow-x-auto py-2 px-1 scrollbar-hide">
                {filteredPackages.slice(0, 4).map((p) => (
                  <motion.article
                    key={p._id}
                    whileHover={{ y: -4 }}
                    className="min-w-[340px] bg-white border rounded-xl p-4 shadow-sm"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">
                        {p.packageName}
                      </div>
                      <div className="text-sm text-slate-500">
                        ₹{p.totalPrice}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {p.description}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {p.tests.slice(0, 5).map((t: any, i: number) => (
                          <span
                            key={i}
                            className="text-xs bg-slate-50 rounded px-2 py-1"
                          >
                            {getTestName(t)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => openEditPackage(p)}
                        className="inline-flex items-center gap-2 px-2 py-1 rounded bg-amber-400 text-white text-xs"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => removePackage(p._id)}
                        className="inline-flex items-center gap-2 px-2 py-1 rounded bg-red-500 text-white text-xs"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredPackages.map((p) => (
                  <motion.article
                    key={p._id}
                    whileHover={{ y: -4 }}
                    className="bg-white border rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="font-semibold">{p.packageName}</div>
                        <div className="text-sm text-slate-500">
                          ₹{p.totalPrice}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {p.description}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {p.tests.map((t: any, i: number) => (
                            <span
                              key={i}
                              className="text-xs bg-slate-50 rounded px-2 py-1"
                            >
                              {getTestName(t)}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => openEditPackage(p)}
                          className="px-2 py-1 rounded bg-amber-400 text-white text-xs inline-flex items-center gap-2"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => removePackage(p._id)}
                          className="px-2 py-1 rounded bg-red-500 text-white text-xs inline-flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* MODAL */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              key="modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
            >
              <motion.div
                initial={{ y: 20, scale: 0.98 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 10, scale: 0.98 }}
                className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">
                    {activeTab === "tests"
                      ? isEditMode
                        ? "Edit Test"
                        : "Add Test"
                      : isEditMode
                      ? "Edit Package"
                      : "Create Package"}
                  </h4>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="text-slate-500"
                  >
                    Close
                  </button>
                </div>

                {activeTab === "tests" ? (
                  <form onSubmit={submitTest} className="space-y-3">
                    <input
                      value={testForm.testName || ""}
                      onChange={(e) =>
                        setTestForm({ ...testForm, testName: e.target.value })
                      }
                      placeholder="Test name"
                      className="w-full rounded-md border px-3 py-2"
                      required
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        value={
                          testForm.price === undefined ? "" : testForm.price
                        }
                        onChange={(e) =>
                          setTestForm({
                            ...testForm,
                            price: Number(e.target.value),
                          })
                        }
                        placeholder="Price (₹)"
                        className="rounded-md border px-3 py-2"
                        required
                      />

                      <select
                        value={testForm.category || ""}
                        onChange={(e) =>
                          setTestForm({
                            ...testForm,
                            category: e.target.value,
                          })
                        }
                        className="rounded-md border px-3 py-2"
                      >
                        <option value="">Category</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {testForm.category === "Other" && (
                      <input
                        value={testForm.customCategory || ""}
                        onChange={(e) =>
                          setTestForm({
                            ...testForm,
                            customCategory: e.target.value,
                          })
                        }
                        placeholder="Custom category"
                        className="w-full rounded-md border px-3 py-2"
                      />
                    )}

                    <textarea
                      value={testForm.description || ""}
                      onChange={(e) =>
                        setTestForm({
                          ...testForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Description (optional)"
                      className="w-full rounded-md border px-3 py-2"
                      rows={3}
                    />

                    <input
                      value={testForm.precaution || ""}
                      onChange={(e) =>
                        setTestForm({
                          ...testForm,
                          precaution: e.target.value,
                        })
                      }
                      placeholder="Precautions (optional)"
                      className="w-full rounded-md border px-3 py-2"
                    />

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="px-4 py-2 rounded-md border"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-md bg-sky-600 text-white"
                      >
                        {isEditMode ? "Update Test" : "Add Test"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={submitPackage} className="space-y-3">
                    <input
                      value={packageForm.packageName || ""}
                      onChange={(e) =>
                        setPackageForm({
                          ...packageForm,
                          packageName: e.target.value,
                        })
                      }
                      placeholder="Package name"
                      className="w-full rounded-md border px-3 py-2"
                      required
                    />

                    <textarea
                      value={packageForm.description || ""}
                      onChange={(e) =>
                        setPackageForm({
                          ...packageForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Short description"
                      className="w-full rounded-md border px-3 py-2"
                      rows={2}
                    />

                    <input
                      type="number"
                      value={
                        packageForm.totalPrice === undefined
                          ? ""
                          : packageForm.totalPrice
                      }
                      onChange={(e) =>
                        setPackageForm({
                          ...packageForm,
                          totalPrice: Number(e.target.value),
                        })
                      }
                      placeholder="Total price (₹)"
                      className="w-full rounded-md border px-3 py-2"
                      required
                    />

                    <div>
                      <div className="text-sm font-medium mb-2">
                        Select tests to include
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto border rounded p-2">
                        {tests.map((t) => {
                          const checked = packageForm.tests?.includes(t._id!);
                          return (
                            <label
                              key={t._id}
                              className={`flex items-center gap-3 p-2 rounded ${
                                checked ? "bg-slate-50" : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => togglePackageTest(t._id!)}
                                className="w-4 h-4"
                              />
                              <div>
                                <div className="font-medium text-sm">
                                  {t.testName}
                                </div>
                                <div className="text-xs text-slate-500">
                                  ₹{t.price}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="px-4 py-2 rounded-md border"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-md bg-amber-500 text-white"
                      >
                        {isEditMode ? "Update Package" : "Create Package"}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LabManagementPro;
