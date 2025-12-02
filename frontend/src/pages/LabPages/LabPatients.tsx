
import React, { useEffect, useMemo, useState, memo } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { Helmet } from "react-helmet";

interface PatientBooking {
  _id: string;
  userId: { _id: string; fullName: string } | string | null;
  testName: string;
  bookingDate: string | null;
  status: string;
}

interface LabDashboardContext {
  labId: string | null;
}

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const safeFullName = (userId: PatientBooking["userId"]) =>
  typeof userId === "object" && userId !== null
    ? userId.fullName
    : typeof userId === "string" && userId
    ? userId
    : "Unknown";

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const Patients: React.FC = memo(() => {
  const { labId } = useOutletContext<LabDashboardContext>();
  const [patients, setPatients] = useState<PatientBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Fetch patients
  useEffect(() => {
    if (!labId) {
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await axios.get<{ labPatients: PatientBooking[] }>(
          `http://localhost:3000/api/lab/getLabPatients/${labId}`
        );
        if (active) setPatients(res.data.labPatients || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [labId]);

  // Filter patients
  const filtered = useMemo(() => {
    const s = debouncedSearch.toLowerCase();
    return patients.filter((p) => {
      if (dateFrom || dateTo) {
        if (!p.bookingDate) return false;
        const d = new Date(p.bookingDate);
        if (dateFrom && d < new Date(dateFrom + "T00:00:00")) return false;
        if (dateTo && d > new Date(dateTo + "T23:59:59")) return false;
      }
      if (!s) return true;
      const name = safeFullName(p.userId).toLowerCase();
      const test = (p.testName || "").toLowerCase();
      return name.includes(s) || test.includes(s);
    });
  }, [patients, debouncedSearch, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    setPage((cur) => clamp(cur, 1, totalPages));
  }, [pageSize, filtered.length, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // Export CSV
    // const exportCSV = () => {
    //   // Build CSV manually to avoid an external dependency and missing types
    //   const headers = ["Patient Name", "Test Name", "Booking Date"];
    //   const rows = filtered.map((p) => [
    //     // Quote and escape values to ensure CSV is valid
    //     `"${safeFullName(p.userId).replace(/"/g, '""')}"`,
    //     `"${(p.testName || "").replace(/"/g, '""')}"`,
    //     `"${p.bookingDate ? new Date(p.bookingDate).toISOString() : ""}"`,
    //   ]);
    //   const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    //   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    //   const url = URL.createObjectURL(blob);
    //   const a = document.createElement("a");
    //   a.href = url;
    //   a.download = `lab_patients_${new Date().toISOString().slice(0, 10)}.csv`;
    //   a.click();
    //   URL.revokeObjectURL(url);
    // };

  if (loading)
    return (
      <div
        className={`flex justify-center items-center h-64 ${
          darkMode ? "bg-slate-900" : "bg-white"
        }`}
        role="status"
        aria-label="Loading patient data"
      >
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <>
      {/* SEO & Structured Data */}
      <Helmet>
        <title>Lab Dashboard - Booked Patients</title>
        <meta
          name="description"
          content="View and manage all booked patients for your lab. Export data, filter by date, and search by patient name or test."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            name: "Lab Booked Patients",
            description:
              "Dataset of all patients booked in the lab, including patient name, test name, and booking date.",
            url: window.location.href,
            data: patients.map((p) => ({
              patientName: safeFullName(p.userId),
              testName: p.testName || "",
              bookingDate: p.bookingDate,
            })),
          })}
        </script>
      </Helmet>

      <main
        className={`${
          darkMode ? "bg-slate-900 text-gray-100" : "bg-gray-50 text-gray-900"
        } p-4 sm:p-6 rounded-2xl shadow-md transition-colors duration-300 max-w-7xl mx-auto`}
      >
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Booked Patients
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage all patient bookings in one view.
            </p>
          </div>

          {/* <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setDarkMode((d) => !d)}
              aria-label="Toggle dark mode"
              className="px-3 py-2 rounded-lg border hover:shadow-sm bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 transition"
            >
              {darkMode ? "🌞 Light" : "🌙 Dark"}
            </button>

            <button
              onClick={exportCSV}
              aria-label="Export as CSV"
              className="px-3 py-2 rounded-lg border hover:shadow-md transition bg-blue-600 text-white font-medium"
            >
              ⬇ Export CSV
            </button>
          </div> */}
        </header>

        {/* Summary Cards */}
        <section
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          aria-label="Summary Statistics"
        >
          <article
            className={`p-4 rounded-xl shadow-sm ${
              darkMode ? "bg-slate-800" : "bg-white"
            }`}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Patients
            </p>
            <p className="text-2xl font-semibold">{patients.length}</p>
          </article>
        </section>

        {/* Filters */}
        <section
          className={`p-4 rounded-xl mb-6 shadow-sm ${
            darkMode ? "bg-slate-800" : "bg-white"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or test..."
              aria-label="Search patients"
              className={`w-full sm:flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-400 transition ${
                darkMode
                  ? "bg-slate-900 border-slate-700 text-gray-100 placeholder-gray-400"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                aria-label="Filter from date"
                className={`px-3 py-2 rounded-lg border w-full sm:w-auto ${
                  darkMode
                    ? "bg-slate-900 border-slate-700 text-gray-100"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                }`}
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                aria-label="Filter to date"
                className={`px-3 py-2 rounded-lg border w-full sm:w-auto ${
                  darkMode
                    ? "bg-slate-900 border-slate-700 text-gray-100"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                }`}
              />
            </div>
          </div>
        </section>

        {/* Table */}
        <section
          className={`overflow-x-auto rounded-xl shadow ${
            darkMode ? "bg-slate-800" : "bg-white"
          }`}
          aria-label="Patients Table"
        >
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead
              className={`${
                darkMode
                  ? "bg-slate-800 text-gray-300"
                  : "bg-gray-100 text-gray-700"
              } text-xs uppercase`}
            >
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  Patient
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  Test
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  Booking Date
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-gray-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                pageItems.map((p, idx) => {
                  const rowAlt =
                    idx % 2 === 0
                      ? darkMode
                        ? "bg-slate-900"
                        : "bg-white"
                      : darkMode
                      ? "bg-slate-800"
                      : "bg-gray-50";
                  const hoverBg = darkMode
                    ? "hover:bg-slate-700"
                    : "hover:bg-[#f9f9f9]";

                  return (
                    <tr
                      key={p._id}
                      className={`${rowAlt} ${hoverBg} transition`}
                    >
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        {safeFullName(p.userId)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {p.testName || "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(p.bookingDate)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>

        {/* Pagination */}
        <nav
          className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm flex-wrap"
          aria-label="Pagination"
        >
          <span>
            Showing{" "}
            <b>
              {Math.min((page - 1) * pageSize + 1, filtered.length || 0)}–
              {Math.min(page * pageSize, filtered.length)}
            </b>{" "}
            of <b>{filtered.length}</b>
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              «
            </button>
            <button
              onClick={() => setPage((p) => clamp(p - 1, 1, totalPages))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              ‹
            </button>
            <span>
              Page <b>{page}</b> of <b>{totalPages}</b>
            </span>
            <button
              onClick={() => setPage((p) => clamp(p + 1, 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              ›
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              »
            </button>
          </div>
        </nav>
      </main>
    </>
  );
});

export default Patients;
