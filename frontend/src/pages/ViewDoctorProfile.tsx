import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import {
  GraduationCap,
  MessageCircleMore,
  Stethoscope,
  ChevronDown,
  Phone,
  Star,
  Clock,
  Award,
  MapPin,
  Calendar,
  Shield,
  CheckCircle,
  Menu,
  X,
} from "lucide-react";
import BookingDrawer from "../components/BookingDrawer";
import api from "../Services/mainApi";

interface Doctor {
  _id: string;
  fullName: string;
  specialization: string;
  qualification: string;
  experience: string;
  consultationFee: number;
  language: string;
  MedicalRegistrationNumber?: string;
  photo?: string;
}
interface FavouriteStatusResponse {
  isFavourite: boolean;
}

const ViewDoctorProfile: React.FC = () => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"overview" | "education" | "faq">(
    "overview"
  );
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isBookingDrawerOpen, setIsBookingDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { drId } = useParams<{ drId: string }>();

  const faqs = [
    {
      question: "Where does the doctor practice?",
      answer:
        "Our main healthcare facility in the medical district with state-of-the-art infrastructure.",
    },
    {
      question: "How can I book an appointment?",
      answer:
        "You can book directly through our portal, call our helpline, or visit the clinic in person.",
    },
    {
      question: "What is the doctor's qualification?",
      answer: `Dr. ${doctor?.fullName} holds ${doctor?.qualification} from recognized medical institutions.`,
    },
    {
      question: "How many years of experience does the doctor have?",
      answer: `With ${doctor?.experience} years of clinical practice, Dr. ${doctor?.fullName} brings extensive expertise.`,
    },
    {
      question: "What is the consultation fee?",
      answer: `Professional consultation fee is ₹${doctor?.consultationFee}, inclusive of preliminary diagnosis.`,
    },
    {
      question: "Does the doctor offer online consultations?",
      answer:
        "Yes, telemedicine services are available for follow-up consultations and remote patients.",
    },
  ];

  const fetchFavouriteStatus = async (patientId: string) => {
    try {
      const favRes = await api.get<FavouriteStatusResponse>(
        `/api/patient/isFavourite/${patientId}/${drId}`
      );
      setIsFavourite(favRes.data.isFavourite);
    } catch (error) {
      console.error("Error fetching favourite status:", error);
    }
  };

  useEffect(() => {
    if (!drId) return;

    const fetchDoctor = async () => {
      try {
        const token = Cookies.get("patientToken");
        const res = await axios.get<{ doctor: Doctor }>(
          `http://localhost:3000/api/doctor/${drId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDoctor(res.data.doctor);
        if (token) {
          const decoded: any = jwtDecode(token);
          const patientId = decoded.id;
          await fetchFavouriteStatus(patientId);
        }
      } catch (err) {
        console.error("Error fetching doctor profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [drId]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-600 text-lg">
          Loading doctor profile...
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 text-lg font-semibold">
          Doctor profile not found
        </div>
      </div>
    );
  }

  const handleFavouriteToggle = async () => {
    const token = Cookies.get("patientToken");

    // ✅ Login check first
    if (!token) {
      alert("Please login to mark favourite doctors.");
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const patientId = decoded.id;

      // ✅ Toggle favourite UI
      setIsFavourite(!isFavourite);

      // ✅ Toggle on backend
      await api.post(`/api/patient/favourite-doctor/${patientId}`, {
        doctorId: doctor?._id,
      });
    } catch (err) {
      console.error("Error toggling favourite doctor", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Section */}
      <div className="relative bg-[#0c213e] text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
            {/* Doctor Image */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full border-4 border-white/30 shadow-2xl overflow-hidden">
                  <img
                    src={`http://localhost:3000/uploads/${doctor.photo}`}
                    alt={doctor.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/150";
                    }}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                  Verified
                </div>
              </div>
            </div>

            {/* Doctor Information */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                <div className="mb-4 lg:mb-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                    Dr. {doctor.fullName}
                  </h1>
                  <p className="text-lg sm:text-xl text-blue-100 font-medium">
                    {doctor.specialization}
                  </p>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2 bg-white/20 px-3 sm:px-4 py-2 rounded-full">
                  <Star
                    className="text-yellow-300"
                    size={18}
                    fill="currentColor"
                  />
                  <span className="font-semibold text-sm sm:text-base">
                    4.8/5
                  </span>
                  <span className="text-blue-100 text-sm">(120 Reviews)</span>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 bg-white/10 p-3 rounded-lg">
                  <Clock size={18} className="text-blue-200" />
                  <div>
                    <div className="font-semibold text-sm sm:text-base">
                      {doctor.experience} Years
                    </div>
                    <div className="text-blue-100 text-xs sm:text-sm">
                      Experience
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 bg-white/10 p-3 rounded-lg">
                  <Award size={18} className="text-blue-200" />
                  <div>
                    <div className="font-semibold text-sm sm:text-base">
                      ₹{doctor.consultationFee}
                    </div>
                    <div className="text-blue-100 text-xs sm:text-sm">
                      Consultation
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 bg-white/10 p-3 rounded-lg">
                  <MessageCircleMore size={18} className="text-blue-200" />
                  <div>
                    <div className="font-semibold text-sm sm:text-base">
                      {doctor.language}
                    </div>
                    <div className="text-blue-100 text-xs sm:text-sm">
                      Languages
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button
                  onClick={() => setIsBookingDrawerOpen(true)}
                  className="bg-white text-blue-700 px-4 sm:px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  <Calendar size={18} /> Book Appointment
                </button>
                <button
                  onClick={handleFavouriteToggle}
                  className={`border-2 px-4 sm:px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 text-sm sm:text-base ${
                    isFavourite
                      ? "border-yellow-300 text-yellow-300 bg-white/10"
                      : "border-white text-white hover:bg-white/10"
                  }`}
                >
                  <Star size={18} fill={isFavourite ? "currentColor" : "none"} /> {isFavourite ? "Favourite" : "Add to Favourite"}
                </button>
                <button className="border-2 border-white text-white px-4 sm:px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-all duration-200 text-sm sm:text-base">
                  <MapPin size={18} /> Clinic Location
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Toggle */}
      <div className="lg:hidden bg-white border-b">
        <button
          className="w-full flex items-center justify-between p-4 font-semibold text-gray-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span>
            {activeTab === "overview" && "Professional Overview"}
            {activeTab === "education" && "Education & Credentials"}
            {activeTab === "faq" && "FAQs"}
          </span>
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {isMobileMenuOpen && (
          <div className="border-t">
            {[
              {
                id: "overview" as const,
                label: "Professional Overview",
                icon: Stethoscope,
              },
              {
                id: "education" as const,
                label: "Education & Credentials",
                icon: GraduationCap,
              },
              { id: "faq" as const, label: "FAQs", icon: ChevronDown },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`w-full flex items-center gap-3 p-4 text-left border-b border-gray-100 ${
                  activeTab === id
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700"
                }`}
                onClick={() => {
                  setActiveTab(id);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Navigation Tabs */}
      <div className="hidden lg:block bg-white shadow-lg border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center space-x-8">
            {[
              {
                id: "overview" as const,
                label: "Professional Overview",
                icon: Stethoscope,
              },
              {
                id: "education" as const,
                label: "Education & Credentials",
                icon: GraduationCap,
              },
              { id: "faq" as const, label: "FAQs", icon: ChevronDown },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-semibold transition-all duration-200 ${
                  activeTab === id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Content Area */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content - Now takes 3 columns */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "overview" && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <Stethoscope className="text-[#28328C]" size={24} />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Professional Overview
                    </h2>
                  </div>

                  <div className="prose prose-sm sm:prose-lg max-w-none text-gray-700 leading-relaxed">
                    <p className="text-base sm:text-lg mb-4 sm:mb-6">
                      {doctor.fullName} is a distinguished{" "}
                      <strong>{doctor.specialization}</strong>
                      with over <strong>{doctor.experience} years</strong> of
                      comprehensive clinical experience. Fluent in{" "}
                      <strong>{doctor.language}</strong>, Dr.{" "}
                      {doctor.fullName.split(" ")[0]} is renowned for
                      patient-centric care and evidence-based medical practice.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                      <div className="bg-blue-50 p-4 sm:p-6 rounded-xl border border-blue-100">
                        <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                          Areas of Expertise
                        </h3>
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Comprehensive diagnosis and treatment
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Preventive healthcare guidance
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Personalized treatment plans
                          </li>
                        </ul>
                      </div>

                      <div className="bg-green-50 p-4 sm:p-6 rounded-xl border border-green-100">
                        <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                          Patient Care Philosophy
                        </h3>
                        <p className="text-gray-700">
                          Believes in transparent communication, compassionate
                          care, and collaborative decision-making with patients
                          and their families.
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                        Consultation Details
                      </h3>
                      <p>
                        The professional consultation fee of{" "}
                        <strong>₹{doctor.consultationFee}</strong> includes
                        thorough evaluation, preliminary diagnosis, and
                        personalized treatment recommendations. Each session
                        ensures adequate time for patient concerns and
                        comprehensive care.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "education" && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <GraduationCap className="text-blue-600" size={24} />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Education & Credentials
                    </h2>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <GraduationCap
                        className="text-blue-600 mt-1 flex-shrink-0"
                        size={20}
                      />
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                          Medical Qualifications
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                          {doctor.qualification}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 rounded-xl border border-green-100">
                      <Stethoscope
                        className="text-green-600 mt-1 flex-shrink-0"
                        size={20}
                      />
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                          Medical Registration
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {doctor.MedicalRegistrationNumber ? (
                            <span className="font-mono text-base sm:text-lg">
                              {doctor.MedicalRegistrationNumber}
                            </span>
                          ) : (
                            "Registration details available at clinic"
                          )}
                        </p>
                        {doctor.MedicalRegistrationNumber && (
                          <p className="text-green-600 font-semibold mt-2">
                            ✓ Valid and Active
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "faq" && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <ChevronDown className="text-blue-600" size={24} />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Frequently Asked Questions
                    </h2>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-200 transition-colors duration-200"
                      >
                        <button
                          className="w-full flex justify-between items-center p-4 sm:p-6 text-left bg-white hover:bg-gray-50 transition-colors duration-200"
                          onClick={() =>
                            setOpenFAQ(openFAQ === index ? null : index)
                          }
                        >
                          <span className="font-semibold text-gray-900 text-base sm:text-lg pr-4">
                            {faq.question}
                          </span>
                          <ChevronDown
                            size={18}
                            className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                              openFAQ === index ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {openFAQ === index && (
                          <div className="p-4 sm:p-6 pt-0 animate-fadeIn">
                            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Booking Sidebar - Now takes 1 column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 sticky top-6 overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="text-center mb-4 md:mb-3">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    Book Consultation
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Secure your appointment with Dr. {doctor.fullName}
                  </p>
                </div>

                {/* Price Highlight */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2 sm:p-4 rounded-xl mb-4 sm:mb-6 border border-blue-100">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      ₹{doctor.consultationFee}
                    </div>
                    <div className="text-gray-600 text-xs sm:text-sm">
                      Consultation Fee
                    </div>
                  </div>
                </div>

                {/* Key Information */}
                <div className="space-y-3 md:space-y-2 mb-4 sm:mb-6">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <Clock size={16} className="text-gray-600" />
                      <div className="flex-1">
                        <div className="text-xs sm:text-sm text-gray-600">
                          Experience
                        </div>
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">
                          {doctor.experience} years
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <MessageCircleMore size={16} className="text-gray-600" />
                      <div className="flex-1">
                        <div className="text-xs sm:text-sm text-gray-600">
                          Languages
                        </div>
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">
                          {doctor.language}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <CheckCircle size={16} className="text-green-600" />
                      <div className="flex-1">
                        <div className="text-xs sm:text-sm text-gray-600">
                          Status
                        </div>
                        <div className="font-semibold text-green-600 text-sm sm:text-base">
                          Available Today
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <Shield size={14} />
                    What's Included
                  </h4>
                  <ul className="text-xs sm:text-sm text-green-800 space-y-1">
                    <li>• Comprehensive diagnosis</li>
                    <li>• Personalized treatment plan</li>
                    <li>• Follow-up guidance</li>
                    <li>• Digital prescription</li>
                  </ul>
                </div>

                {/* Primary Booking Button */}
                <button
                  onClick={() => setIsBookingDrawerOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl mb-3 text-sm sm:text-base"
                >
                  <Calendar size={18} />
                  Book Appointment Now
                </button>

                {/* Secondary Options */}
                <div className="space-y-2">
                  <button className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2">
                    <Phone size={14} />
                    Call Clinic
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2">
                    <MapPin size={14} />
                    View Location
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Shield size={12} />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle size={12} />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Drawer */}
      <BookingDrawer
        doctor={{
          _id: doctor._id,
          fullName: doctor.fullName,
          photo: doctor.photo,
          specialization: doctor.specialization,
          fees: doctor.consultationFee,
        }}
        open={isBookingDrawerOpen}
        onClose={() => setIsBookingDrawerOpen(false)}
      />
    </div>
  );
};

export default ViewDoctorProfile;
