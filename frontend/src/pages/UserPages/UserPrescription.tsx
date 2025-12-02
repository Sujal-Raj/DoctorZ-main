

import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../Context/AuthContext";
import api from "../../Services/mainApi";
import {
  CalendarDays,
  
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Prescription {
  _id: string;
  doctorId: {
    fullName: string;
    MobileNo: string;
  };
  bookingId: {
    dateTime: string;
  };
  pdfUrl: string;
}

const UserPrescription = () => {
  const { user } = useContext(AuthContext);
  const aadhar = user?.aadhar;

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const itemsPerPage = 3;

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const res = await api.get<{ prescriptions: Prescription[] }>(
          `/api/patient/getUserPrescription/${aadhar}`
        );
        console.log(res)
        setPrescriptions(res.data.prescriptions);
      } catch (err) {
        console.error(err);
      }
    };

    if (aadhar) fetchPrescription();
  }, [aadhar]);

  /* 1️⃣ Search Filter */
  const searchFiltered = prescriptions.filter((item) =>
    item.doctorId.fullName.toLowerCase().includes(search.toLowerCase())
  );

  /* 2️⃣ Date, Month, Year Filter */
  const dateFiltered = searchFiltered.filter((item) => {
    const itemDate = new Date(item?.bookingId?.dateTime || "");

    // Start + End Date
    if (startDate && itemDate < new Date(startDate)) return false;
    if (endDate && itemDate > new Date(endDate)) return false;

    // Month Filter
    if (filterMonth && itemDate.getMonth() + 1 !== Number(filterMonth))
      return false;

    // Year Filter
    if (filterYear && itemDate.getFullYear() !== Number(filterYear))
      return false;

    return true;
  });

  console.log(dateFiltered)

  /* 3️⃣ Sorting */
  const sortedPrescriptions = [...dateFiltered].sort((a, b) => {
    const dateA = new Date(a.bookingId.dateTime).getTime();
    const dateB = new Date(b.bookingId.dateTime).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  /* 4️⃣ Pagination */
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = sortedPrescriptions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedPrescriptions.length / itemsPerPage);

  /* CLEAR FILTERS */
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilterMonth("");
    setFilterYear("");
    setSearch("");
    setSortOrder("newest");
    setCurrentPage(1);
  };

  return (
    <div className="p-5 flex gap-6">

      {/* ---------------- LEFT FILTER SIDEBAR ---------------- */}
      <div className="w-64 h-max bg-white shadow-md rounded-xl p-5">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={clearFilters}
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-5">

          {/* Start Date */}
          <div>
            <p className="font-medium mb-1">Start Date</p>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg"
              value={startDate}
              onChange={(e:React.ChangeEvent<HTMLInputElement>) => {
                const target = e.target as HTMLInputElement;
                setStartDate(target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* End Date */}
          <div>
            <p className="font-medium mb-1">End Date</p>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg"
              value={endDate}
              onChange={(e:React.ChangeEvent<HTMLInputElement>) => {
                const target = e.target as HTMLInputElement;
                setEndDate(target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Month Filter */}
          <div>
            <p className="font-medium mb-1">Month</p>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={filterMonth}
              onChange={(e:React.ChangeEvent<HTMLSelectElement>) => {
                const target = e.target as HTMLSelectElement;
                setFilterMonth(target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <p className="font-medium mb-1">Year</p>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={filterYear}
              onChange={(e:React.ChangeEvent<HTMLSelectElement>) => {
                const target = e.target as HTMLSelectElement;
                setFilterYear(target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Years</option>
              {Array.from(
                new Set(
                  prescriptions.map((p) =>
                    new Date(p.bookingId.dateTime).getFullYear()
                  )
                )
              )
                .sort((a, b) => b - a)
                .map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* ---------------- RIGHT SIDE ---------------- */}
      <div className="flex-1">

        <h2 className="text-xl font-semibold mb-4">My Prescriptions</h2>

        {/* SEARCH + SORT */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
          <div className="flex items-center gap-2 border-2 border-gray-100 px-3 py-2 rounded-lg w-full md:w-1/2 bg-white shadow-sm">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by doctor name..."
              className="outline-none w-full"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const target = e.target as HTMLInputElement;
                setSearch(target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className="border-gray-300 px-3 py-2 rounded-lg bg-white shadow-sm"
            value={sortOrder}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortOrder(e.currentTarget.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* RESULTS */}
        {sortedPrescriptions.length === 0 ? (
          <p className="text-gray-500">No prescriptions found.</p>
        ) : (
          <div className="space-y-4">
            {currentItems.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-xl shadow-md bg-white  hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3 mb-1">
                  <User size={22} className="text-blue-600" />
                  <p className="text-lg font-semibold text-gray-800">
                    Dr. {item.doctorId.fullName}
                  </p>
                </div>

                <p className="text-gray-600 mb-2">
                  Contact: {item.doctorId.MobileNo}
                </p>

                <div className="flex items-center gap-2 text-gray-700">
                  <CalendarDays size={18} className="text-purple-600" />
                  <span className="font-medium">
                    {new Date(item?.bookingId.dateTime).toLocaleDateString("en-GB")}
                  </span>
                </div>

                <div className="flex gap-3 mt-4">
                  <Link
                    to={item.pdfUrl}
                    target="_blank"
                    className="text-blue-600 font-medium hover:underline flex items-center gap-1"
                  >
                    <FileText size={18} /> View
                  </Link>

                  <a
                    href={`http://localhost:3000/api/prescription/download/${item._id}`}
                    className="text-green-600 font-medium hover:underline flex items-center gap-1"
                  >
                    <FileText size={18} /> Download
                  </a>
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 bg-gray-600 text-white rounded disabled:opacity-40"
              >
                <ChevronLeft />
              </button>

              <span className="px-4 py-1 bg-blue-600 text-white rounded text-lg">
                {currentPage}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 bg-gray-600 text-white rounded disabled:opacity-40"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPrescription;
