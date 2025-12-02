import { useEffect, useState } from "react";
import { Check, X, User, Search } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

interface Doctor {
  _id: string;
  fullName: string;
  gender: string;
  consultationFee: number;
  dob: string;
  status: string;
  qualification: string;
  specialization: string;
  experience: number;
  MedicalRegistrationNumber?: string;
}

export default function AdminDoctor() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch("http://localhost:3000/api/admin/doctors/pending", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setDoctors(data);
    } catch (error) {
      toast.error("Failed to fetch doctors");
      console.error("Failed to fetch doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: "approve" | "reject") => {
    try {
      setActionLoading(id);

      await fetch(`http://localhost:3000/api/admin/doctor/${id}/${action}`, {
        method: "POST",
      });

      toast.success(
        action === "approve" ? "Doctor Approved Successfully!" : "Doctor Rejected!"
      );

      await fetchDoctors();
    } catch (error) {
      toast.error(`Failed to ${action} doctor`);
      console.error(`Failed to ${action} doctor:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.MedicalRegistrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false)
  );

  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDoctors = filteredDoctors.slice(startIndex, endIndex);

  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  return (
    <main className="min-h-screen bg-gray-50 py-8 overflow-x-hidden">

      {/* 🔥 Global Toast Provider */}
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

      <title>Admin Doctor Approval | Dashboard</title>
      <meta
        name="description"
        content="Admin dashboard for approving pending doctor registration requests."
      />

      {loading ? (
        <div className="flex justify-center items-center h-full">
          <div className="w-16 h-16 border-4 border-gray-800 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="w-full px-2 sm:px-6">
          {/* Header */}
          <div className="sticky top-0 bg-gray-50 z-30 pb-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
              <div>
                <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-2 text-center lg:text-left">
                  Doctor Approval Management
                </h1>
                <p className="text-gray-600 text-base sm:text-lg text-center lg:text-left">
                  Review and approve pending doctor registration requests
                </p>
              </div>

              <div className="bg-white px-6 py-4 rounded-2xl shadow border border-gray-200 min-w-[180px] text-center">
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                  Total Pending
                </p>
                <p className="text-3xl font-bold text-gray-900">{doctors.length}</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-2xl mt-6 mx-auto lg:mx-0">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, specialization, or registration number..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white shadow-sm overflow-x-auto mt-6 rounded-lg">
            <table className="w-full text-left min-w-[900px] border-collapse">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Medical Reg. No.</th>
                  <th className="px-4 py-3">Qualification</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3">Fee</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentDoctors.map((doc) => (
                  <tr key={doc._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-4 flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">{doc.fullName}</p>
                        <p className="text-sm text-gray-500">{doc.specialization}</p>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {doc.MedicalRegistrationNumber || "Not Provided"}
                    </td>

                    <td className="px-4 py-4">{doc.qualification}</td>

                    <td className="px-4 py-4">
                      {doc.experience} {doc.experience === 1 ? "Year" : "Years"}
                    </td>

                    <td className="px-4 py-4">₹{doc.consultationFee.toLocaleString()}</td>

                    <td className="px-4 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          doc.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : doc.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 flex justify-center gap-2">
                      <button
                        onClick={() => handleAction(doc._id, "approve")}
                        disabled={actionLoading === doc._id}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg disabled:opacity-50"
                      >
                        {actionLoading === doc._id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => handleAction(doc._id, "reject")}
                        disabled={actionLoading === doc._id}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg disabled:opacity-50"
                      >
                        {actionLoading === doc._id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-gray-50 border-t border-gray-200 mt-4 rounded-b-lg">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredDoctors.length)} of{" "}
                {filteredDoctors.length} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
                >
                  &lt;
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-800 border"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
