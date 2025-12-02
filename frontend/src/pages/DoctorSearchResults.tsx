

import { useLocation, useNavigate } from "react-router-dom";

import {
  MapPin,
  Calendar,
  Stethoscope,
  Search as SearchIcon,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Helmet } from "react-helmet";
import DoctorCard from "../components/DoctorCard";
import BookingDrawer from "../components/BookingDrawer";
import { useEffect, useMemo, useState } from "react";
import api from "../Services/mainApi";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

type SearchState = {
  location?: string;
  specialty?: string;
  date?: string;
};
// interface DecodedToken {
//   id: string;
// }

// // ✅ Get patient ID from token safely

//   const token = Cookies.get("patientToken");
//   console.log(token)
//   const patientId = token ? (jwtDecode<DecodedToken>(token)?.id ?? null) : null;
interface DecodedToken {
  sub: string;
  id:string,
}

const token = Cookies.get("patientToken");
console.log("Token:", token);
if (token) {
  const decoded = jwtDecode<DecodedToken>(token);
  console.log("Decoded token:", decoded);
  const patientId = decoded?.id ?? null;
  console.log("Patient ID:", patientId);
}

// const token = Cookies.get("patientToken");
const patientId = token ? jwtDecode<DecodedToken>(token)?.id ?? null : null;

const API = `/api/doctor/allDoctors/${patientId}`;

const DoctorSearchResults: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const searchState = (state || {}) as SearchState;

  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 6;

  const [specialty, setSpecialty] = useState(searchState.specialty || "");
  const [locationValue, setLocationValue] = useState(
    searchState.location || ""
  );
  const [date, setDate] = useState(searchState.date || "");

  const [modeHospital, setModeHospital] = useState(true);
  const [modeOnline, setModeOnline] = useState(true);
  const [expFilters, setExpFilters] = useState<string[]>([]);
  const [feeFilters, setFeeFilters] = useState<string[]>([]);
  const [languageFilters, setLanguageFilters] = useState<string[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [consultMode, setConsultMode] = useState<"online" | "hospital" | null>(
    null
  );

  // ✅ Fetch Doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const res = await api.get<any>(API);
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.doctors ?? res.data;

        setDoctors(data || []);
      } catch (e) {
        console.error("Error fetching doctors:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // ✅ Utility for date filter
  const hasSlotForDate = (doc: any, date?: string) => {
    if (!date) return true;
    if (!Array.isArray(doc?.slots)) return false;
    return doc.slots.some((s: { date: string }) => s.date === date);
  };

  // ✅ Geolocation “Near Me”
  const showNearMe = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const approx = doctors.filter((d) => {
          if (!d.lat || !d.lng) return false;
          const R = 6371;
          const dLat = ((d.lat - lat) * Math.PI) / 180;
          const dLon = ((d.lng - lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat * Math.PI) / 180) *
              Math.cos((d.lat * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const dist = R * c;
          return dist <= 50;
        });
        setDoctors(approx);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        console.error(err);
        alert("Unable to get your location.");
      }
    );
  };

  // ✅ Filtering Logic
  const filtered = useMemo(() => {
    const loc = (locationValue || "").trim().toLowerCase();
    const spec = (specialty || "").trim().toLowerCase();
    const dateVal = (date || "").trim();

    return doctors.filter((d: any) => {
      const matchesSpec =
        !spec ||
        (d.specialization && d.specialization.toLowerCase().includes(spec)) ||
        (d.fullName && d.fullName.toLowerCase().includes(spec));

      const matchesLocation =
        !loc ||
        (d.location && d.location.toLowerCase().includes(loc)) ||
        (d.city && d.city.toLowerCase().includes(loc));

      const matchesDate = hasSlotForDate(d, dateVal);

      const supportsHospital = d.modeOfConsult?.includes("hospital") ?? true;
      const supportsOnline = d.modeOfConsult?.includes("online") ?? true;

      // NEW CONSULT MODE FILTER
      if (consultMode === "online" && !supportsOnline) return false;
      if (consultMode === "hospital" && !supportsHospital) return false;

      if (expFilters.length > 0) {
        const exp = d.experience ?? 0;
        const matchesExp = expFilters.some((ef) => {
          if (ef === "15+") return exp >= 15;
          const [min, max] = ef.split("-").map(Number);
          return exp >= min && exp <= max;
        });
        if (!matchesExp) return false;
      }

      if (feeFilters.length > 0) {
        const fee = d.consultationFee ?? 0;
        const matchesFee = feeFilters.some((ff) => {
          if (ff === "1000+") return fee >= 1000;
          const [min, max] = ff.split("-").map(Number);
          return fee >= min && fee <= max;
        });
        if (!matchesFee) return false;
      }

      if (languageFilters.length > 0) {
        const langs: string[] = d.languages ?? [];
        const matchesLang = languageFilters.every((lf) =>
          langs.map((x) => x.toLowerCase()).includes(lf.toLowerCase())
        );
        if (!matchesLang) return false;
      }

      return matchesSpec && matchesLocation && matchesDate;
    });
  }, [
    doctors,
    specialty,
    locationValue,
    date,
    modeHospital,
    modeOnline,
    expFilters,
    feeFilters,
    languageFilters,
  ]);

  // ✅ move sort here (after filtered)
  const sortedDoctors = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.isFavourite === b.isFavourite) return 0;
      return a.isFavourite ? -1 : 1;
    });
  }, [filtered]);
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = sortedDoctors.slice(
    indexOfFirstDoctor,
    indexOfLastDoctor
  );
  const totalPages = Math.ceil(sortedDoctors.length / doctorsPerPage);

  const toggleExp = (val: string) =>
    setExpFilters((s) =>
      s.includes(val) ? s.filter((x) => x !== val) : [...s, val]
    );
  const toggleFee = (val: string) =>
    setFeeFilters((s) =>
      s.includes(val) ? s.filter((x) => x !== val) : [...s, val]
    );
  const toggleLang = (val: string) =>
    setLanguageFilters((s) =>
      s.includes(val) ? s.filter((x) => x !== val) : [...s, val]
    );

  const openBooking = (doc: any) => {
    setSelectedDoctor(doc);
    setDrawerOpen(true);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    navigate("/search-results", {
      state: { location: locationValue, specialty, date },
      replace: true,
    });
  };
  // const handleFavouriteToggle = (doctorId: string, isFavourite: boolean) => {
  //   setDoctors((prev) =>
  //     prev.map((d) => (d._id === doctorId ? { ...d, isFavourite } : d))
  //   );
  // };

  const clearFilters = () => {
    setSpecialty("");
    setLocationValue("");
    setDate("");
    setModeHospital(true);
    setModeOnline(true);
    setExpFilters([]);
    setFeeFilters([]);
    setLanguageFilters([]);
  };

  return (
    <div className="w-full bg-white text-gray-900">
  <Helmet>
    <title>Consult Doctors Online | DoctorZ</title>
    <meta name="description" content="Find and consult top doctors online by specialization, experience, and location on DoctorZ." />
  </Helmet>

  <div className="max-w-[1500px] mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
    {/* Sidebar Filters */}
    <aside className="lg:col-span-3 hidden lg:block sticky top-24 self-start">
      <FilterPanel
        showNearMe={showNearMe}
        clearFilters={clearFilters}
        modeHospital={modeHospital}
        setModeHospital={setModeHospital}
        modeOnline={modeOnline}
        setModeOnline={setModeOnline}
        expFilters={expFilters}
        toggleExp={toggleExp}
        feeFilters={feeFilters}
        toggleFee={toggleFee}
        languageFilters={languageFilters}
        toggleLang={toggleLang}
      />
    </aside>

    {/* Main Content */}
    <main className="lg:col-span-6">
      {/* Header with count and filters toggle */}
      <div className="flex items-center justify-between mb-5 px-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {specialty ? `Consult ${specialty}s Online` : "Available Doctors"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} doctors found</p>
        </div>
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden flex items-center gap-2 px-3 py-2 border border-[#0c213e] text-[#0c213e] rounded-md text-sm font-medium hover:bg-[#0c213e]/10 transition"
          aria-label="Open Filters"
          type="button"
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>

      {/* Search Filters Bar */}
      <div className="border border-gray-300 rounded-lg bg-white p-3 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <SearchInput
            icon={<Stethoscope className="w-4 h-4 text-gray-400" />}
            placeholder="Specialty"
            value={specialty}
            onChange={setSpecialty}
          />
          <SearchInput
            icon={<MapPin className="w-4 h-4 text-gray-400" />}
            placeholder="Location"
            value={locationValue}
            onChange={setLocationValue}
          />
          <SearchInput
            icon={<Calendar className="w-4 h-4 text-gray-400" />}
            placeholder="Date"
            type="date"
            value={date}
            onChange={setDate}
          />
          <button
            onClick={handleSearch}
            className="bg-[#0c213e] hover:bg-[#132d54] text-white rounded-lg px-5 py-2 font-medium flex items-center justify-center gap-2 transition"
            type="button"
            aria-label="Search doctors"
          >
            <SearchIcon className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>

      {/* Consult Mode Toggle Buttons */}
      <div className="flex gap-3 mb-6 px-2">
        <button
          onClick={() => setConsultMode(consultMode === "online" ? null : "online")}
          className={`flex-1 py-2 rounded-lg text-center font-medium border transition ${
            consultMode === "online"
              ? "bg-[#0c213e] text-white border-[#0c213e]"
              : "bg-white text-gray-700 border-gray-300 hover:border-[#0c213e] hover:text-[#0c213e]"
          }`}
          type="button"
          aria-pressed={consultMode === "online"}
        >
          Online Consult
        </button>
        <button
          onClick={() => setConsultMode(consultMode === "hospital" ? null : "hospital")}
          className={`flex-1 py-2 rounded-lg text-center font-medium border transition ${
            consultMode === "hospital"
              ? "bg-[#0c213e] text-white border-[#0c213e]"
              : "bg-white text-gray-700 border-gray-300 hover:border-[#0c213e] hover:text-[#0c213e]"
          }`}
          type="button"
          aria-pressed={consultMode === "hospital"}
        >
          Visit Doctor
        </button>
      </div>

      {/* Doctor Cards List */}
      {loading ? (
        <div className="p-6 bg-white rounded-lg shadow text-center border border-gray-200">
          <div className="mx-auto w-10 h-10 border-4 border-[#0c213e] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-6 bg-white rounded-lg shadow text-center border border-gray-200 text-gray-700">
          No doctors found matching your filters.
        </div>
      ) : (
        <div className="space-y-6">
          {currentDoctors.map((doc) => (
            <DoctorCard
              key={doc._id}
              doctor={doc}
              onConsult={openBooking}
              onFavouriteToggle={(doctorId, isFav) =>
                setDoctors((prev) =>
                  prev.map((d) => (d._id === doctorId ? { ...d, isFavourite: isFav } : d))
                )
              }
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex justify-center mt-6" aria-label="Pagination">
          <div className="inline-flex gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-3 py-1.5 rounded-md border text-sm font-medium transition ${
                  currentPage === idx + 1
                    ? "bg-[#0c213e] text-white border-[#0c213e] shadow-lg shadow-[#0c213e]/30 scale-105"
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#0c213e] hover:text-[#0c213e] hover:bg-[#0c213e]/10"
                }`}
                aria-current={currentPage === idx + 1 ? "page" : undefined}
                aria-label={`Go to page ${idx + 1}`}
                type="button"
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </nav>
      )}
    </main>

    {/* Right side Help Card */}
    <aside className="lg:col-span-2 hidden lg:block">
          <div className="bg-[#08263a] text-white rounded-lg p-4 shadow-md border border-gray-200">
            <h3 className="font-semibold text-base">Need help finding the right clinic?</h3>
            <p className="text-sm mt-2 leading-snug">
              Call <span className="font-medium">+91-8040245807</span> to book instantly
            </p>
            <a
              href="tel:+918040245807"
              className="inline-block mt-3 bg-white text-[#08263a] font-medium px-3 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors"
            >
              Call Now
            </a>
          </div>
        </aside>
  </div>

  {/* Mobile Filter Drawer */}
  {mobileFilterOpen && (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="bg-white w-80 max-w-full h-full p-5 overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={() => setMobileFilterOpen(false)}
            className="p-1 rounded-full hover:bg-gray-100 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#0c213e]"
            aria-label="Close filters"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <FilterPanel
          showNearMe={showNearMe}
          clearFilters={clearFilters}
          modeHospital={modeHospital}
          setModeHospital={setModeHospital}
          modeOnline={modeOnline}
          setModeOnline={setModeOnline}
          expFilters={expFilters}
          toggleExp={toggleExp}
          feeFilters={feeFilters}
          toggleFee={toggleFee}
          languageFilters={languageFilters}
          toggleLang={toggleLang}
        />

        <button
          onClick={() => setMobileFilterOpen(false)}
          className="mt-6 w-full bg-[#0c213e] text-white py-3 rounded-md font-semibold border border-[#1a2f4a] shadow-sm hover:bg-[#10273f] hover:border-[#254466] transition-all"
          type="button"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )}

  {/* Booking Drawer */}
  <BookingDrawer
    open={drawerOpen}
    doctor={
      selectedDoctor
        ? {
            _id: selectedDoctor._id,
            fullName: selectedDoctor.fullName,
            photo: selectedDoctor.photo,
            specialization: selectedDoctor.specialization,
            fees: selectedDoctor.consultationFee,
          }
        : null
    }
    onClose={() => {
      setDrawerOpen(false);
      setSelectedDoctor(null);
    }}
    onBooked={() => {
      setDrawerOpen(false);
      setSelectedDoctor(null);
    }}
  />
</div>

  );
};

/* 🔹 Reusable Components */

const SearchInput = ({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
}: any) => (
  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
    {icon}
    <input
      type={type}
      placeholder={placeholder}
      className="w-full outline-none text-gray-700"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const FilterPanel = ({
  showNearMe,
  clearFilters,
  // modeHospital,
  // setModeHospital,
  // modeOnline,
  // setModeOnline,
  expFilters,
  toggleExp,
  feeFilters,
  toggleFee,
  languageFilters,
  toggleLang,
}: any) => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
      <button
        onClick={clearFilters}
        className="text-sm text-[#0c213e] hover:underline"
      >
        Clear All
      </button>
    </div>

    <div className="space-y-4">
      <button
        onClick={showNearMe}
        className="w-full border border-[#0c213e] text-[#0c213e] text-sm font-medium rounded-md py-2 hover:bg-[#0c213e]/10"
      >
        Show Doctors Near Me
      </button>

      {/* Mode */}
      {/* <div className="pt-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Mode of Consult</h4>
        <label className="flex items-center gap-2 text-sm text-gray-600 mb-1">
          <input
            type="checkbox"
            checked={modeHospital}
            onChange={() => setModeHospital((s: boolean) => !s)}
            className="accent-teal-600"
          />
          Hospital Visit
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={modeOnline}
            onChange={() => setModeOnline((s: boolean) => !s)}
            className="accent-teal-600"
          />
          Online Consult
        </label>
      </div> */}

      {/* Experience */}
      <div className="pt-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Experience</h4>
        {["0-5", "5-10", "10-15", "15+"].map((v) => (
          <label
            key={v}
            className="flex items-center gap-2 text-sm text-gray-600 mb-1"
          >
            <input
              type="checkbox"
              checked={expFilters.includes(v)}
              onChange={() => toggleExp(v)}
              className="accent-[#0c213e]"
            />
            {v} years
          </label>
        ))}
      </div>

      {/* Fee */}
      <div className="pt-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Consultation Fee
        </h4>
        {["0-500", "500-1000", "1000+"].map((v) => (
          <label
            key={v}
            className="flex items-center gap-2 text-sm text-gray-600 mb-1"
          >
            <input
              type="checkbox"
              checked={feeFilters.includes(v)}
              onChange={() => toggleFee(v)}
              className="accent-[#0c213e]"
            />
            ₹{v}
          </label>
        ))}
      </div>

      {/* Languages */}
      <div className="pt-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Languages</h4>
        {["English", "Hindi", "Marathi", "Gujarati"].map((v) => (
          <label
            key={v}
            className="flex items-center gap-2 text-sm text-gray-600 mb-1"
          >
            <input
              type="checkbox"
              checked={languageFilters.includes(v)}
              onChange={() => toggleLang(v)}
              className="accent-[#0c213e]"

            />
            {v}
          </label>
        ))}
      </div>
    </div>
  </div>
);

export default DoctorSearchResults;
