import { useEffect, useState, type JSX } from "react";
import { Helmet } from "react-helmet";
import ClinicDoctorCard from "../pages/ClinicPages/ClinicDoctorCard";
import api from "../Services/mainApi";
import { Search as SearchIcon } from "lucide-react";

export interface Doctor {
  _id: string;
  fullName: string;
  specialization: string;
  qualification?: string;
  location?: string;
  city?: string;
  photo?: string;
  gender?: string;
}
interface SearchResponse {
  doctors: Doctor[];
}

// Apple-Style Minimal Luxury UI — AddDoctor page
export default function AddDoctor(): JSX.Element {
  const [addedDoctors, setAddedDoctors] = useState<string[]>([]);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [genderFilter, setGenderFilter] = useState("");
  const [specialization, setSpecialization] = useState("");

  // Pagination (client side simple)
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Fetch doctors (only when searching)
  const fetchDoctors = async (query: string = "") => {
    if (!query.trim()) {
      setDoctors([]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get<SearchResponse>(`/api/doctor/search?query=${encodeURIComponent(query)}`);
      setDoctors(res.data.doctors || []);
      setPage(1);
    } catch (error) {
      console.error("fetchDoctors error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSent = (doctorId: string) => {
    // optimistic UI update
    setPendingRequests((prev) => (prev.includes(doctorId) ? prev : [...prev, doctorId]));
  };

  // load clinic status once
  useEffect(() => {
    const clinicId = localStorage.getItem("clinicId");
    if (!clinicId) return;

    api
      .get<{ addedDoctors: string[]; pendingRequests: string[] }>(`/api/clinic/doctor-status/${clinicId}`)
      .then((res) => {
        setAddedDoctors(res.data.addedDoctors || []);
        setPendingRequests(res.data.pendingRequests || []);
      })
      .catch((err) => console.error(err));
  }, []);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      if (search.trim()) fetchDoctors(search.trim());
      else setDoctors([]);
    }, 420);

    return () => clearTimeout(t);
  }, [search]);

  // filters
  const filtered = doctors.filter((d) => {
    const genderOk = genderFilter ? d.gender === genderFilter : true;
    const specOk = specialization
      ? d.specialization?.toLowerCase().includes(specialization.toLowerCase())
      : true;
    return genderOk && specOk;
  });

  // pagination slice
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleDoctors = filtered.slice((page - 1) * pageSize, page * pageSize);

  // reset pagination when filters change
  useEffect(() => setPage(1), [genderFilter, specialization, doctors]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 text-gray-800">
      <Helmet>
        <title>Add Doctors — Clinic • Professional</title>
        <meta name="description" content="Search, filter and add verified doctors to your clinic. Fast search, smart filters and clean professional UI." />
        <meta name="keywords" content="add doctor, clinic, doctors, search doctors, healthcare, medical staff" />
        <script type="application/ld+json">
          {`{
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Add Doctors",
            "description": "Search, filter and add verified doctors to your clinic.",
            "publisher": { "@type": "Organization", "name": "Your Clinic" }
          }`}
        </script>
      </Helmet>

      {/* HEADER */}
      <header className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[#0C213E] leading-tight">Add Doctors</h1>
            <p className="mt-2 text-gray-600 max-w-xl">
              Discover verified doctors, filter by specialization or gender and add them to your clinic with one click.
            </p>
          </div>

          <div className="w-full sm:w-[480px]">
  <label htmlFor="search" className="sr-only">Search doctors</label>

  <div
    className="
      group flex items-center
      bg-white
      border border-gray-200
      rounded-3xl
      px-5 py-4
      shadow-sm
      transition-all duration-300
      focus-within:border-[#0C213E]
      focus-within:shadow-[0_4px_18px_rgba(12,33,62,0.15)]
      hover:shadow-md
    "
  >
    <SearchIcon 
      className="
        w-6 h-6 
        text-gray-400 
        group-focus-within:text-[#0C213E]
        transition-colors
      " 
    />

    <input
      id="search"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="
        ml-4 w-full
        placeholder-gray-400
        text-base
        bg-transparent outline-none
        font-medium
      "
      placeholder="Search doctors..."
      aria-label="Search doctors"
      autoComplete="off"
    />
  </div>
</div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* SIDEBAR */}
          <aside className="lg:col-span-3">
            <div className="sticky top-6 bg-white/70 backdrop-blur py-6 px-4 rounded-2xl border border-gray-200 shadow-md">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#0C213E]">Filters</h2>
                <button
                  type="button"
                  onClick={() => {
                    setGenderFilter("");
                    setSpecialization("");
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Reset
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "", label: "Any" },
                      { key: "Male", label: "Male" },
                      { key: "Female", label: "Female" },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setGenderFilter(opt.key)}
                        className={`text-sm py-2 px-3 rounded-xl border transition ${genderFilter === opt.key ? "bg-[#0C213E] text-white border-transparent" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"}`}
                        aria-pressed={genderFilter === opt.key}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                  <input
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Dentist, Cardiologist"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:ring-2 focus:ring-[#0C213E] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Status</label>
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-600">Added: <span className="font-medium text-gray-800">{addedDoctors.length}</span></div>
                    <div className="text-sm text-gray-600">Pending: <span className="font-medium text-gray-800">{pendingRequests.length}</span></div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setGenderFilter("");
                      setSpecialization("");
                      setSearch("");
                      fetchDoctors("");
                    }}
                    className="w-full rounded-2xl py-2 bg-[#0C213E] hover:bg-[#08182d] text-white font-semibold shadow-sm transition"
                  >
                    Apply & Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* subtle note */}
            <div className="mt-6 text-xs text-gray-500">
              Tip: Start typing a doctor's name or specialization in the search box to discover matches. Results appear fast and are filtered locally for best UX.
            </div>
          </aside>

          {/* CONTENT */}
          <section className="lg:col-span-9">
            <div className="space-y-6">
              {/* Result header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{doctors.length} result{doctors.length !== 1 ? "s" : ""}</p>
                  <h3 className="text-xl font-semibold text-gray-800">Available Doctors</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">Sort</div>
                  <select
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "name") setDoctors((s) => [...s].sort((a, b) => a.fullName.localeCompare(b.fullName)));
                      if (v === "spec") setDoctors((s) => [...s].sort((a, b) => (a.specialization || "").localeCompare(b.specialization || "")));
                    }}
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Relevance</option>
                    <option value="name">Name (A–Z)</option>
                    <option value="spec">Specialization</option>
                  </select>
                </div>
              </div>

              {/* Cards grid */}
              {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-white rounded-2xl p-6 border border-gray-200 h-44" />
                  ))}
                </div>
              ) : visibleDoctors.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center shadow-sm">
                  <h4 className="text-lg font-medium text-gray-800">No doctors found</h4>
                  <p className="mt-2 text-gray-500">Try a different search term or clear filters.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleDoctors.map((d) => (
                    <ClinicDoctorCard
                      key={d._id}
                      doctor={d}
                      doctorStatus={
                        addedDoctors.includes(d._id) ? "added" : pendingRequests.includes(d._id) ? "pending" : "none"
                      }
                      onRequestSent={handleRequestSent}
                    />
                  ))}
                </div>
              )}

              {/* pagination */}
              {visibleDoctors.length > 0 && (
                <nav className="flex items-center justify-center gap-3 mt-4" aria-label="Pagination">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50"
                  >
                    Prev
                  </button>

                  <div className="px-4 py-2 rounded-lg bg-white border border-gray-200">
                    Page <span className="font-semibold">{page}</span> of {totalPages}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 pb-10 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Your Clinic. All rights reserved.
      </footer>
    </div>
  );
}