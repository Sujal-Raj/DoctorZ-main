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
import { ChevronLeft, ChevronRight } from "lucide-react";
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
        setLabTests(res.data.labTests);
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
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">My Lab Tests</h1>

      {labTests.length === 0 ? (
        <p className="text-gray-500">No lab tests found.</p>
      ) : (
        <>
          <div className="space-y-4">
            {currentTests.map((test) => (
              <div
                key={test._id}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <p className="font-medium text-lg mb-1">
                  <strong>Test Name:</strong> {test.testName}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Lab:</strong> {test.labId.name}
                </p>
                {test.bookedAt && !isNaN(Date.parse(test.bookedAt)) ? (
                  <div className="text-gray-600 mb-1">
                    <p>
                      <strong>Appointment Date:</strong>{" "}
                      {new Date(test.bookedAt).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Appointment Time:</strong>{" "}
                      {new Date(test.bookedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">Appointment Date: Not Available</p>
                )}
                {test.reportUrl && (
                  <a
                    href={test.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline mt-2 inline-block"
                  >
                    View Report
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-5">
            <button
              disabled={currentPage === 1 || totalPages === 0}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 bg-gray-600 text-white rounded disabled:opacity-40"
            >
              <ChevronLeft />
            </button>

            <span className="px-4 py-1 bg-blue-600 text-white rounded text-lg">
              {currentPage} / {totalPages|| 1}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 bg-gray-600 text-white rounded disabled:opacity-40"
            >
              <ChevronRight />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default LabTestInUser;
