import React, { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { MapPin, Calendar, Heart } from "lucide-react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

import api from "../Services/mainApi";
import Swal from "sweetalert2";



// ---------------------------
// Type definitions
// ---------------------------
interface MyTokenPayload {
  id: string;
  email?: string;
  exp?: number;
}

interface Clinic {
  _id: string;
  clinicName: string;
  clinicImage?: string;
  district?: string;
  state?: string;
  operatingHours?: string;
  phone?: string;
  email?: string;
  specialities?: string[];
}

interface ClinicCardProps {
  clinic: Clinic;
  navigate: (path: string) => void;
  onFavouriteToggle: (clinicId: string) => void;
}

interface FavouriteResponse {
  isFavourite: boolean;
}

// ---------------------------
// Component
// ---------------------------
const ClinicCard: React.FC<ClinicCardProps> = ({
  clinic,
  navigate,
  onFavouriteToggle,
}) => {
  const token = Cookies.get("patientToken") || "";
  const decoded = token ? jwtDecode<MyTokenPayload>(token) : null;
  const patientId = decoded?.id;

  const [isFavourite, setIsFavourite] = useState<boolean>(false);

  // Check if clinic is favourite
  useEffect(() => {
    const checkFavourite = async () => {
      if (!patientId || !clinic?._id) return;
      try {
        const res = await api.get<FavouriteResponse>(
          `/api/patient/isFavouriteClinic/${patientId}/${clinic._id}`
        );
        setIsFavourite(res.data.isFavourite);
      } catch (err) {
        console.error("Error checking favourite:", err);
      }
    };
    checkFavourite();
  }, [clinic._id, patientId]);

  // Toggle favourite
  const handleFavouriteToggle = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!patientId) {
     Swal.fire({
        title: "Error",
        text: "Please login to favourite a clinic",
        icon: "error",
        confirmButtonText: "Ok",
      });
      navigate("/patient-login")
      return;
    }

    try {
      const res = await api.post<FavouriteResponse>(
        `/api/patient/favourite-clinic/${patientId}`,
        { clinicId: clinic._id }
      );
      setIsFavourite(res.data.isFavourite);
    } catch (err) {
      console.error("Error toggling favourite:", err);
    }
    onFavouriteToggle(clinic._id);
  };

  return (
    <div
      onClick={() => navigate(`/clinic/${clinic._id}`)}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden relative shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      {/* ❤️ Favourite Icon */}
      <button
        onClick={handleFavouriteToggle}
        className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-transform duration-200"
        aria-label="Toggle favourite"
      >
        <Heart
          className={`w-5 h-5 ${
            isFavourite ? "fill-red-500 text-red-500" : "text-gray-400"
          }`}
        />
      </button>

      {/* Clinic Image */}
      <div className="absolute left-3 sm:left-6 top-3">
        <div className="relative">
          <img
            src={
              clinic.clinicImage
                ? clinic.clinicImage.startsWith("http")
                  ? clinic.clinicImage
                  : `http://localhost:3000/uploads/${clinic.clinicImage}`
                : "https://cdn-icons-png.flaticon.com/512/2966/2966327.png"
            }
            alt={clinic.clinicName}
            className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-300"
          />
          {/* Verified Badge */}
          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Clinic Info */}
      <div className="pl-32 sm:pl-40 pr-4 sm:pr-6 py-4 sm:py-6">
        <div className="mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-[#132d54] transition-colors duration-300 line-clamp-1 flex items-center gap-2">
  {clinic.clinicName}

  {/* Verified Badge (best quality) */}
<div className="relative group/verify">
  {/* Badge */}
  <div
    className="
      w-6 h-6 
      rounded-full 
      bg-gradient-to-br from-blue-500 to-blue-700 
      flex items-center justify-center 
      shadow-md shadow-blue-300/40
      border border-white
      hover:scale-110 transition-transform
      cursor-pointer
    "
  >
    <svg
      className="w-3.5 h-3.5 text-white"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  </div>

  {/* Tooltip: Right Side */}
  <span
    className="
      absolute left-8 top-1/2 -translate-y-1/2
      opacity-0 group-hover/verify:opacity-100
      transition-all duration-200
      bg-[#0c213e] text-white text-xs 
      px-2 py-1 rounded-md 
      shadow-lg whitespace-nowrap z-50
    "
  >
    Verified Clinic
  </span>
</div>


  
</h2>



          <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-1">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-500 flex-shrink-0" />
            <span className="line-clamp-1">
              {clinic.district}, {clinic.state}
            </span>
          </div>
          <div className="flex items-center text-gray-700 text-xs sm:text-sm">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600 mr-1">Hours:</span>
            <span className="line-clamp-1">
              {clinic.operatingHours || "Not Available"}
            </span>
          </div>
        </div>

        <hr className="border-gray-200 my-2 sm:my-3" />

        {/* Contact Info */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex-1">
            <div className="flex items-center text-xs sm:text-sm text-gray-700 mb-1">
              <span className="text-gray-600 mr-2">Phone:</span>
              <span className="line-clamp-1">
                {clinic.phone || "Not available"}
              </span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center text-xs sm:text-sm text-gray-700 mb-1">
              <span className="text-gray-600 mr-2">Email:</span>
              <span className="line-clamp-1">
                {clinic.email || "Not available"}
              </span>
            </div>
          </div>
        </div>

        {/* Specialities */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex-1">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">
              Medical Specialities
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
              {clinic.specialities?.join(", ") || "General Practice"}
            </p>
          </div>
          <div className="flex-1 hidden sm:block"></div>
        </div>

        {/* Verified Status + Button */}
        <div className="flex flex-col space-y-2 sm:space-y-3 mt-4 sm:mt-6">
          {/* <div className="flex items-center justify-center bg-green-50 border border-green-200 rounded-lg py-1.5 sm:py-2 px-3 sm:px-4">
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-1 sm:mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-green-700">
              Verified Healthcare Provider
            </span>
          </div> */}

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/clinic/${clinic._id}`);
            }}
            className="w-full bg-[#0c213e] text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md flex items-center justify-center text-sm sm:text-base cursor-pointer"
          >
            

           
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClinicCard;
