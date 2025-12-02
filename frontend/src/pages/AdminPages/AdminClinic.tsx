import { useEffect, useState } from "react";
import api from "../../Services/mainApi";
import { Toaster, toast } from "react-hot-toast"; // ✅ Toastify added

type ClinicStatus = "pending" | "approved" | "rejected";

interface Clinic {
  _id: string;
  clinicName: string;
  email: string;
  state: string;
  district: string;
  pincode: string;
  address: string;
  operatingHours: string;
  status: ClinicStatus;
}

interface ApiClinicsResponse {
  Clinics: Clinic[];
}

interface ProcessingState {
  id: string;
  action: "approve" | "reject";
}

export default function AdminClinic() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [processing, setProcessing] = useState<ProcessingState | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // 🔹 Fetch clinics
  const fetchClinicDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiClinicsResponse>(
        "/api/admin/clinics/pending"
      );
      setClinics(response.data.Clinics ?? []);
      setError("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch clinic data.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Approve / Reject Action with Toastify
  const handleAction = async (id: string, action: "approve" | "reject") => {
    try {
      setProcessing({ id, action });
      const url =
        action === "approve"
          ? `/api/admin/clinic/${id}/approve`
          : `/api/admin/clinic/${id}/reject`;

      const response = await api.put(url);

      if (response.status === 200) {
        toast.success(
          action === "approve"
            ? "Clinic approved successfully! ✅"
            : "Clinic rejected! ❌"
        );

        await fetchClinicDetails();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Action failed!");
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    fetchClinicDetails();
  }, []);

  // 🔹 Filter + Pagination
  const filteredClinics = clinics.filter(
    (c) =>
      c.clinicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredClinics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClinics = filteredClinics.slice(startIndex, endIndex);

  const goToPage = (page: number) =>
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  // 🔹 Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 text-gray-700 text-lg">
        Fetching clinic details...
      </div>
    );
  }

  // 🔹 Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600 font-semibold">
        {error}
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
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      {/* ✅ Toastify Component */}
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

      {/* Header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Clinic Approval Management
          </h1>
          <p className="text-gray-600">
            Review and approve pending clinic registrations.
          </p>
        </div>

        <div className="bg-white px-6 py-4 rounded-2xl shadow border border-gray-200 text-center min-w-[140px]">
          <p className="text-sm text-gray-500 uppercase">Total Pending</p>
          <p className="text-2xl font-bold text-gray-900">{clinics.length}</p>
        </div>
      </div>

      {/* Search Box */}
      <div className="mb-4 max-w-md relative">
        <input
          type="text"
          placeholder="Search by name, district, or state..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-4 pr-3 py-2 rounded-xl border border-gray-300 
          focus:outline-none focus:ring-2 focus:ring-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-200">
        {currentClinics.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No pending clinics found.
          </div>
        ) : (
          <table className="min-w-full text-left">
            <thead className="bg-gray-800 text-white text-xs uppercase">
              <tr>
                <th className="py-3 px-4">Clinic Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Timings</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentClinics.map((clinic, i) => (
                <tr
                  key={clinic._id}
                  className={`border-b hover:bg-gray-50 ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="py-3 px-4 font-semibold">
                    {clinic.clinicName}
                  </td>

                  <td className="py-3 px-4">{clinic.email}</td>

                  <td className="py-3 px-4">
                    {clinic.district}, {clinic.state} ({clinic.pincode})
                  </td>

                  <td className="py-3 px-4">{clinic.operatingHours}</td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-md text-xs ${
                        clinic.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : clinic.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {clinic.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    {clinic.status === "pending" ? (
                      <div className="flex justify-center gap-2">
                        {/* Approve */}
                        <button
                          onClick={() => handleAction(clinic._id, "approve")}
                          disabled={
                            processing?.id === clinic._id &&
                            processing.action === "approve"
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white ${
                            processing?.id === clinic._id &&
                            processing.action === "approve"
                              ? "bg-green-300 cursor-not-allowed"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          {processing?.id === clinic._id &&
                          processing.action === "approve"
                            ? "Approving..."
                            : "Approve"}
                        </button>

                        {/* Reject */}
                        <button
                          onClick={() => handleAction(clinic._id, "reject")}
                          disabled={
                            processing?.id === clinic._id &&
                            processing.action === "reject"
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white ${
                            processing?.id === clinic._id &&
                            processing.action === "reject"
                              ? "bg-red-300 cursor-not-allowed"
                              : "bg-red-500 hover:bg-red-600"
                          }`}
                        >
                          {processing?.id === clinic._id &&
                          processing.action === "reject"
                            ? "Rejecting..."
                            : "Reject"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm italic">
                        {clinic.status === "approved"
                          ? "Approved ✅"
                          : "Rejected ❌"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 p-4 bg-gray-50 border-t border-gray-200 mt-4 rounded-b-lg">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredClinics.length)} of{" "}
            {filteredClinics.length} results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
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
              )
            )}

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

      
    </main>
  );
}
