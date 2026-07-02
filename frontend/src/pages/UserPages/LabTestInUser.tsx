// import React, { useEffect, useState, useContext } from "react";
// // import { useParams } from "react-router-dom";
// import { getUserLabTests } from "../../Services/getLabTest";
// import { AuthContext } from "../../Context/AuthContext";

// export interface LabTestItem {
//   labId: { name: string; city: string; address: string };
//   _id: string;
//   testName: string;
//   status: string;
//   doctorId?: { fullName: string; MobileNo: string };
//   bookedAt?: string;
//   reportUrl?: string;
// }

// function LabTestInUser() {
//   const [labTests, setLabTests] = useState<LabTestItem[]>([]);
//   const { user } = useContext(AuthContext); // or from context

//   useEffect(() => {
//     if (!user?.id) return;

//     const fetchLabTests = async () => {
//       try {
//         const res = await getUserLabTests(user.id);
//         setLabTests(res.data.labTests);
//         console.log("Lab Tests API Response:", res.data.labTests);
//       } catch (err) {
//         console.log("Error fetching lab tests:", err);
//       }
//     };

//     fetchLabTests();
//   }, [user]);

//   // return (
//   //   <div className="p-4">
//   //     <h1 className="text-xl font-semibold mb-4">Lab Test</h1>

//   //     {labTests.length === 0 ? (
//   //       <p>No lab tests found.</p>
//   //     ) : (
//   //       <div className="space-y-3">
//   //         {labTests.map((test) => (
//   //           <div
//   //             key={test._id}
//   //             className="border p-3 rounded-lg shadow-sm bg-white"
//   //           >
//   //             <p>
//   //               <strong>Test Name:</strong> {test.testName}
//   //             </p>
//   //             {/* <p><strong>Status:</strong> {test.status}</p> */}
//   //             <p>
//   //               <strong>Lab:</strong> {test.labId.name}
//   //             </p>

//   //             {/* {test.bookedAt && !isNaN(Date.parse(test.bookedAt)) ? (
//   //               <p>
//   //                 <strong>Appointment Date:</strong>{" "}
//   //                 {new Date(test.bookedAt).toLocaleString()}
//   //               </p>
//   //             ) : (
//   //               <p>Appointment Date: Not Available</p>
//   //             )} */}

//   //             {test.bookedAt && !isNaN(Date.parse(test.bookedAt)) ? (
//   //               <div>
//   //                 <p>
//   //                   <strong>Appointment Date:</strong>{" "}
//   //                   {new Date(test.bookedAt).toLocaleDateString()}
//   //                 </p>
//   //                 <p>
//   //                   <strong>Appointment Time:</strong>{" "}
//   //                   {new Date(test.bookedAt).toLocaleTimeString([], {
//   //                     hour: "2-digit",
//   //                     minute: "2-digit",
//   //                   })}
//   //                 </p>
//   //               </div>
//   //             ) : (
//   //               <p>Appointment Date: Not Available</p>
//   //             )}

//   //             {/* {test.reportUrl && (
//   //               <a
//   //                 href={test.reportUrl}
//   //                 target="_blank"
//   //                 rel="noopener noreferrer"
//   //                 className="text-blue-600 underline"
//   //               >
//   //                 View Report
//   //               </a>
//   //             )} */}
//   //           </div>
//   //         ))}
//   //       </div>
//   //     )}
//   //   </div>
//   // );

//   return (
//   <div className="p-6">
//     <h1 className="text-2xl font-semibold mb-6">My Lab Tests</h1>

//     {labTests.length === 0 ? (
//       <p className="text-gray-500">No lab tests found.</p>
//     ) : (
//       <div className="space-y-4">
//         {labTests.map((test) => (
//           <div
//             key={test._id}
//             className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
//           >
//             <p className="font-medium text-lg mb-1"> <strong>Test Name:</strong> {test.testName}</p>
//             <p className="text-gray-600 mb-1">
//               <strong>Lab:</strong> {test.labId.name}
//             </p>
//             {test.bookedAt && !isNaN(Date.parse(test.bookedAt)) ? (
//               <div className="text-gray-600 mb-1">
//                 <p>
//                   <strong>Appointment Date:</strong>{" "}
//                   {new Date(test.bookedAt).toLocaleDateString()}
//                 </p>
//                 <p>
//                   <strong>Appointment Time:</strong>{" "}
//                   {new Date(test.bookedAt).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </p>
//               </div>
//             ) : (
//               <p className="text-gray-500">Appointment Date: Not Available</p>
//             )}
//             {test.reportUrl && (
//               <a
//                 href={test.reportUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-600 underline mt-2 inline-block"
//               >
//                 View Report
//               </a>
//             )}
//           </div>
//         ))}
//       </div>
//     )}
//   </div>
// );


// }


// export default LabTestInUser;


import React, { useEffect, useState, useContext } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { getUserLabTests } from "../../Services/getLabTest";
import { AuthContext } from "../../Context/AuthContext";

export interface LabTestItem {
  labId: { name: string; city: string; address: string };
  _id: string;
  testName: string;
  status: string;
  doctorId?: { fullName: string; MobileNo: string };
  bookedAt?: string;
  reportUrl?: string;
  bookingType?: "test" | "package";
}

function LabTestInUser() {
  const [labTests, setLabTests] = useState<LabTestItem[]>([]);
  const { user } = useContext(AuthContext);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2; // Number of tests per page

  useEffect(() => {
    if (!user?.id) return;

    const fetchLabTests = async () => {
      try {
        const res = await getUserLabTests(user.id);
        setLabTests(res.data.labTests || []);
        console.log("Lab Tests API Response:", res.data.labTests);
      } catch (err) {
        console.log("Error fetching lab tests:", err);
      }
    };

    fetchLabTests();
  }, [user]);

  const totalPages = Math.ceil(labTests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTests = labTests.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Lab Tests & Packages</h1>

      {labTests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No lab tests found.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {currentTests.map((test) => {
              const status = test.status || "pending";
              const isCompleted = status.toLowerCase() === "completed";
              const isCancelled = status.toLowerCase() === "cancelled";

              return (
                <div
                  key={test._id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          test.bookingType === "package"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {test.bookingType || "test"}
                        </span>

                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          isCompleted
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : isCancelled
                            ? "bg-red-50 text-red-700 border-red-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                          ) : isCancelled ? (
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>

                      <h2 className="text-xl font-bold text-gray-900">
                        {test.testName}
                      </h2>

                      <p className="text-gray-600 text-sm flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span><strong>Lab:</strong> {test.labId?.name || "Lab"} ({test.labId?.city})</span>
                      </p>

                      {test.bookedAt && !isNaN(Date.parse(test.bookedAt)) ? (
                        <div className="text-gray-500 text-xs space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-100 inline-block">
                          <p className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>
                              <strong>Date:</strong>{" "}
                              {new Date(test.bookedAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>
                              <strong>Time:</strong>{" "}
                              {new Date(test.bookedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-xs italic">Appointment Date: Not Available</p>
                      )}
                    </div>

                    <div className="sm:text-right shrink-0 flex items-center">
                      {test.reportUrl ? (
                        <a
                          href={test.reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0c213e] hover:bg-[#1a3a5f] text-white text-sm font-semibold rounded-xl shadow-sm transition active:scale-95 duration-200 cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                          <span>View Report</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                        </a>
                      ) : isCompleted ? (
                        <span className="text-gray-400 text-sm italic">Report not uploaded yet</span>
                      ) : (
                        <span className="text-gray-400 text-sm italic">Pending report completion</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-5">
            <button
              disabled={currentPage === 1 || totalPages === 0}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="px-4 py-1 bg-[#0c213e] text-white rounded-lg text-sm font-semibold">
              {currentPage} / {totalPages || 1}
            </span>

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default LabTestInUser;
