


import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import doctorTeam from "../assets/doctors.json";
import healthcareSupport from "../assets/healthcareSupport.json";
import patientFeedback from "../assets/patientFeedback.json";

interface Slide {
  title: string;
  description: string;
  animation: object;
  bg: string;
  color: string;
}

const slides: Slide[] = [
  {
    title: "Your Health, Our Priority",
    description:
      "Consult certified medical experts anytime from the comfort of your home. Track your health, get accurate advice, and enjoy seamless digital consultations without waiting in queues.",
    animation: doctorTeam,
    bg: "bg-gradient-to-r from-[#e3f2fd] via-[#bbdefb] to-[#1976d2]",
    color: "#0d47a1",
  },
  {
    title: "24/7 Available Support",
    description:
      "Our dedicated support team and online doctors are here for you round the clock. Whether it’s an urgent question or routine care, we make sure help is just a click away, anytime you need it.",
    animation: healthcareSupport,
    bg: "bg-gradient-to-r from-[#e8f5e9] via-[#c8e6c9] to-[#2e7d32]",
    color: "#1b5e20",
  },
  {
    title: "Building Trust, Delivering Care",
    description:
      "Thousands of patients trust us for reliable, transparent, and affordable healthcare services. We’re committed to providing accurate results and expert guidance that you can count on.",
    animation: patientFeedback,
    bg: "bg-gradient-to-r from-[#ede7f6] via-[#d1c4e9] to-[#512da8]",
    color: "#311b92",
  },
];

const SlidingBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`w-[90%] sm:w-[85%] lg:w-[80%] mx-auto rounded-2xl m-3 h-[55vh] sm:h-[50vh] lg:h-[45vh] overflow-hidden relative flex items-center justify-center transition-all duration-700 ${slides[currentIndex].bg}`}
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 flex flex-col-reverse md:flex-row items-center justify-between px-6 sm:px-10 md:px-16 lg:px-24 text-center md:text-left transition-all duration-700 ${
            index === currentIndex
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-full"
          }`}
        >
          {/* Text Section */}
          <div className="flex-1 max-w-lg">
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 leading-tight"
              style={{ color: slide.color }}
            >
              {slide.title}
            </h1>
            <p className="text-gray-700 text-sm sm:text-base lg:text-lg">
              {slide.description}
            </p>
          </div>

          {/* Animation Section */}
          <div className="flex-1 flex justify-center mb-4 md:mb-0">
            <div className="w-[220px] sm:w-[300px] md:w-[350px] lg:w-[400px] h-auto flex items-center justify-center">
              <Lottie animationData={slide.animation} loop={true} />
            </div>
          </div>
        </div>
      ))}

      {/* Dots Navigation */}
      <div className="absolute bottom-4 sm:bottom-5 left-1/2 transform -translate-x-1/2 flex gap-3">
        {slides.map((slide, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full cursor-pointer transition-all"
            style={{
              backgroundColor:
                index === currentIndex ? slide.color : "#bdbdbd",
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default SlidingBanner;
