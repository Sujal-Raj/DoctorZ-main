import React, { useContext, useEffect, useState } from "react";
import { MapPin, Video, Briefcase, Phone, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import api from "../Services/mainApi";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";

export interface Doctor {
  clinic: any;
  _id: string;
  fullName: string;
  specialization: string;
  qualification?: string;
  experience: string;
  consultationFee: number;
  language?: string;
  MedicalRegistrationNumber?: string;
  location?: string;
  city?: string;
  photo?: string;
  rating?: number;
  gender?: string;
  clinicId?: string;
}

interface Props {
  doctor: Doctor;
  onConsult: (doctor: Doctor) => void;
  onFavouriteToggle?: (doctorId: string, isFavourite: boolean) => void;
}

interface DecodedToken {
  id: string;
}

const DoctorCard: React.FC<Props> = ({
  doctor,
  onConsult,
  onFavouriteToggle,
}) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);
  const [isFavourite, setIsFavourite] = useState<boolean>(false);

  const token = Cookies.get("patientToken");
  const patientId = token ? jwtDecode<DecodedToken>(token)?.id ?? null : null;

  // ----------------- TOAST -----------------
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ----------------- FAVOURITES -----------------
  useEffect(() => {
    const fetchFavouriteStatus = async () => {
      if (!isLoggedIn || !patientId) return;
      try {
        const res = await api.get<{ isFavourite: boolean }>(
          `api/patient/isFavourite/${patientId}/${doctor._id}`
        );
        setIsFavourite(res.data.isFavourite);
      } catch (error) {
        console.error("Error checking favourite:", error);
      }
    };
    fetchFavouriteStatus();
  }, [doctor._id, isLoggedIn, patientId]);

  const handleFavouriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isLoggedIn || !patientId) {
  const result = await Swal.fire({
    title: "Login Required",
    text: "You need to be logged in to add favourite doctors. Login now?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Login",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#28328C",
  });

      if (result.isConfirmed) navigate("/patient-login");
      return;
    }

    try {
      const res = await api.post<{ isFavourite: boolean }>(
        `api/patient/favourite-doctor/${patientId}`,
        { doctorId: doctor._id }
      );
      setIsFavourite(res.data.isFavourite);

      onFavouriteToggle?.(doctor._id, res.data.isFavourite);
    } catch (error) {
      console.error("Error toggling favourite:", error);
    }
  };

  // ----------------- CONSULT -----------------
 const handleConsultClick = async (e: React.MouseEvent) => {
  e.stopPropagation();

  if (!isLoggedIn) {
    const result = await Swal.fire({
      title: "Not Logged In",
      text: "You need to be logged in to consult. Do you want to login or register now?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Login",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#28328C",
    });

    if (result.isConfirmed) {
      navigate("/patient-login");
    }
    return;
  }

  onConsult(doctor);
};

  const handleCardClick = () => {
    navigate(`/view-doctor-profile/${doctor._id}`);
  };

  // ----------------- CONTACT CLINIC -----------------
  const handleContactClinic = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!doctor.clinic || doctor.clinic.length === 0) {
      setToast({
        message: "Clinic details not available for this doctor.",
        type: "error",
      });
      return;
    }

    navigate(`/clinic/${doctor.clinic[0]}`);
  };

  const getLocationText = () => {
    if (doctor.location && doctor.city)
      return `${doctor.location}, ${doctor.city}`;
    if (doctor.location) return doctor.location;
    if (doctor.city) return doctor.city;
    return "—";
  };

  return (
    <>
      {/* ----------------- TOAST UI ----------------- */}
      {toast && (
        <div
          className={`
          fixed top-5 right-5 px-4 py-3 rounded-lg shadow-lg text-white z-50 transition-all duration-300
          ${toast.type === "error" ? "bg-red-600" : "bg-green-600"}
        `}
        >
          {toast.message}
        </div>
      )}

      {/* ----------------- DOCTOR CARD ----------------- */}
      <article
        onClick={handleCardClick}
        className="group bg-white border border-gray-400 rounded-xl shadow-sm hover:shadow-md hover:border-gray-400 hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden relative"
      >
        <button
          onClick={handleFavouriteToggle}
          className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition"
        >
          <Heart
            className={`w-5 h-5 ${
              isFavourite ? "fill-red-500 text-red-500" : "text-gray-400"
            }`}
          />
        </button>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 p-4 md:p-5">
          <div className="flex-shrink-0 flex items-start">
            {doctor.photo ? (
              <img
                src={`http://localhost:3000/uploads/${doctor.photo}`}
                alt={`Dr. ${doctor.fullName}`}
                loading="lazy"
                className="w-32 h-32 md:w-40 md:h-40 rounded-lg object-cover border border-gray-200"
              />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg bg-[#0c213e] text-white flex items-center justify-center text-2xl font-bold">
                {doctor.fullName.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between w-full md:flex-1 md:min-w-0">
            <div className="text-left">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 break-words">
                Dr. {doctor.fullName}
              </h2>
              <p className="text-[#0c213e] text-sm md:text-base font-medium mt-1 break-words">
                {doctor.specialization}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-1 text-xs font-semibold bg-[#0c213e]/10 text-[#0c213e] px-3 py-1 rounded-full">
                  <Briefcase className="w-3.5 h-3.5" /> {doctor.experience} yrs
                  experience
                </span>
              </div>

              <div className="flex items-center gap-1 text-gray-600 text-sm mt-3">
                <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span>{getLocationText()}</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-3 w-full">
              <div className="text-left w-full md:w-auto">
                <p className="text-lg font-semibold text-gray-900">
                  ₹{doctor.consultationFee}
                </p>
                <p className="text-xs text-gray-500">Consultation Fee</p>
              </div>

              <div className="flex flex-col gap-2 w-full md:w-auto">
                {/* CONTACT CLINIC */}
                <button
                  onClick={handleContactClinic}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[#0c213e] border border-[#0c213e] hover:bg-[#112a4d]/10 text-sm rounded-lg font-medium shadow-sm transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Contact Clinic</span>
                </button>

                {/* SCHEDULE APPOINTMENT */}
                <button
                  onClick={handleConsultClick}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0c213e] hover:bg-[#112a4d] text-white text-sm rounded-lg font-medium shadow-sm border border-[#0c213e] transition-all"

                >
                  <Video className="w-4 h-4" />
                  <span>Schedule Appointment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

export default DoctorCard;
