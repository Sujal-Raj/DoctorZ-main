

import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import api from "../../Services/mainApi";

interface Doctor {
  _id: string;
  fullName: string;
  specialization: string;
  mode: string;
  photo?: string;
}

interface ApiResponse {
  message: string;
  doctors: Doctor[];
}

interface OutletContext {
  clinicId: string | undefined;
}

const getStatusColor = (mode: string) => {
  switch (mode) {
    case "online":
      return "bg-green-500";
    case "offline":
      return "bg-red-500";
    default:
      return "bg-gray-300";
  }
};

const ClinicDoctors = () => {
  const { clinicId } = useOutletContext<OutletContext>();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get<ApiResponse>(
          `/api/doctor/getClinicDoctors/${clinicId}`
        );
        if (Array.isArray(res.data.doctors)) {
          setDoctors(res.data.doctors);
        } else {
          setDoctors([]);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    if (clinicId) fetchDoctors();
  }, [clinicId]);

  if (loading)
    return (
      <p className="p-6 text-center text-gray-500 text-sm sm:text-base">
        Loading doctors...
      </p>
    );

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen font-poppins">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">
        Doctor List
      </h2>

      {doctors.length === 0 ? (
        <p className="text-gray-600 text-sm sm:text-base">
          No doctors found in this clinic.
        </p>
      ) : (
        <div
          className="
          grid grid-cols-1
          sm:grid-cols-2
          w-170
          h-88
        
         
          gap-4 sm:gap-6"
        >
          {doctors.map((doctor) => (
            <div
              key={doctor._id}
              onClick={() => navigate(`clinic-doctor-profile/${doctor._id}`)}
              className="cursor-pointer bg-white rounded-xl shadow-md border border-transparent hover:border-bg-[#0c213e]hover:shadow-lg transition duration-200 group relative overflow-hidden"
            >
              {/* Doctor Image */}
              <div className="w-full h-52 sm:h-60 md:h-64 overflow-hidden rounded-t-xl">
                <img
                  src={`http://localhost:3000/uploads/${doctor.photo}`}
                  alt={doctor.fullName}
                  className="w-full h-full  transform group-hover:scale-105 transition duration-300"
                />
              </div>

              {/* Doctor Info */}
              <div className="p-3 sm:p-4 group-hover:bg-[#0c213e] transition duration-200">
                {/* Status */}
                <div className="flex items-center mb-1">
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(
                      doctor.mode || "offline"
                    )}`}
                  ></span>
                  <p className="text-xs sm:text-sm text-gray-500 capitalize group-hover:text-white">
                    {doctor.mode || "offline"}
                  </p>
                </div>

                {/* Name & Specialization */}
                <h3 className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-white truncate">
                  {doctor.fullName}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 group-hover:text-white truncate">
                  {doctor.specialization}
                </p>
              </div>

              {/* 💬 Chat Icon */}
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 text-bg-[#0c213e] rounded-full flex items-center justify-center text-xs sm:text-sm group-hover:bg-white group-hover:text-blue-500 transition">
                  💬
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClinicDoctors;
