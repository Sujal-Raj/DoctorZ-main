
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { Phone } from "lucide-react";
import api from "../../Services/mainApi";

interface Doctor {
  _id: string;
  fullName: string;
  gender: string;
  MobileNo: string;
  Aadhar: number;
  specialization: string;
}

interface DoctorWithBooking {
  doctor: Doctor;
  bookingDate: string;
  roomId:string;
}

interface DoctorApiResponse {
  data: Array<{
    doctor: Doctor;
    bookingDate: string;
     roomId:string;
  }>;
}

const PatientAppointments: React.FC = () => {
  const navigate = useNavigate();
  const patientId = useParams().id;

  const [doctors, setDoctors] = useState<DoctorWithBooking[]>([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get<DoctorApiResponse>(`/api/patient/appointments/doctors/${patientId}`);
           console.log("hie",res)
          //  console.log()
        // ✅ extract doctorId + bookingDate from each booking
        const extractedDoctors: DoctorWithBooking[] = res.data.data.map(item => ({
          doctor: item.doctor,
          bookingDate: item.bookingDate,
          roomId:item.roomId
        }));
        console.log("here",extractedDoctors) 
        
        setDoctors(extractedDoctors);
        // setDoctors(res.data.data);

        console.log(doctors)
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };

    fetchDoctors();
  }, [patientId]);

  return (
    <div className="w-full p-4 sm:p-5 md:p-6 overflow-x-auto rounded-lg font-[Poppins]">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 text-center sm:text-left">
        Doctors List
      </h2>

      {doctors.length === 0 ? (
        <p className="text-gray-500 text-center sm:text-left">No Pending appointments.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-700 text-xs sm:text-sm md:text-base">
              <tr>
                <th className="px-3 sm:px-4 py-2">Name</th>
                <th className="px-3 sm:px-4 py-2">Gender</th>
                <th className="px-3 sm:px-4 py-2">Specialization</th>
                <th className="px-3 sm:px-4 py-2">Contact</th>
                <th className="px-3 sm:px-4 py-2">Date</th>
                <th className="px-3 sm:px-4 py-2">Call / Chat</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map(({ doctor, bookingDate,roomId }) => (
                <tr key={doctor._id} className="border-t hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-2 font-medium flex items-center gap-2">
                    <UserCircleIcon className="w-6 h-6 text-gray-500" />
                    Dr. {doctor.fullName}
                  </td>

                  <td className="px-3 sm:px-4 py-2">{doctor.gender}</td>
                  <td className="px-3 sm:px-4 py-2">{doctor.specialization}</td>
                  <td className="px-3 sm:px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Phone size={18} className="text-gray-500" />
                      {doctor.MobileNo}
                    </div>
                  </td>

                  <td className="px-3 sm:px-4 py-2">
                    {new Date(bookingDate).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                     
                    })}
                  </td>

                  <td className="px-3 sm:px-4 py-2">
                    <div className="flex gap-2">
                      <a
                        href={`tel:${doctor.MobileNo}`}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                      >
                        Call
                      </a>

                      <button
                        onClick={() => navigate(`/doctor-chat/${roomId}`)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Chat
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
