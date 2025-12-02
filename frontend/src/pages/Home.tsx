import  { useState } from "react";
import {
  Search,
  MapPin,
  Video,
  Calendar,
  Pill,
  FileText,
  Shield,
  Clock,
  Star,
  ChevronRight,
  Phone,
  Mail,
  Stethoscope,
  Heart,
  Baby,
  Microscope,
  Eye,
  Bone,
  Activity,
  Brain,
  Users,
  CheckCircle,
  Award,
  Zap,
  UserCheck 
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import HealthcareHero from "../components/HeroSection";
// import { CheckCircle } from "lucide-react";

export default function HealthcareHomepage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  // Main Services
  const mainServices = [
    {
      icon: Video,
      title: "Video Consultation",
      desc: "Connect with doctors instantly from anywhere in India",
      color: "from-blue-500 to-blue-600",
      cta: "Consult Now",
    },
    {
      icon: Calendar,
      title: "Book Appointment",
      desc: "Find nearby doctors and clinics based on your location",
      color: "from-green-500 to-green-600",
      cta: "Find Doctors",
    },
    {
      icon: Microscope,
      title: "Lab Tests",
      desc: "Book diagnostic tests at home or nearby labs",
      color: "from-purple-500 to-purple-600",
      cta: "Book Test",
    },
    {
      icon: Pill,
      title: "Order Medicine",
      desc: "Get medicines delivered from nearby pharmacies",
      color: "from-orange-500 to-orange-600",
      cta: "Order Now",
    },
  ];

  // Specialties
  const specialties = [
    { icon: Heart, name: "Cardiology", doctors: 150 },
    { icon: Brain, name: "Neurology", doctors: 120 },
    { icon: Bone, name: "Orthopedics", doctors: 200 },
    { icon: Eye, name: "Ophthalmology", doctors: 180 },
    { icon: Baby, name: "Pediatrics", doctors: 140 },
    { icon: Stethoscope, name: "General Medicine", doctors: 300 },
    { icon: Activity, name: "Dermatology", doctors: 160 },
    { icon: Users, name: "Psychology", doctors: 90 },
  ];

  // Why Choose Us
  const features = [
    {
      icon: Shield,
      title: "Verified Doctors",
      desc: "All doctors are verified with valid medical licenses",
    },
    {
      icon: Clock,
      title: "24/7 Available",
      desc: "Round-the-clock access to healthcare professionals",
    },
    {
      icon: FileText,
      title: "Digital Records",
      desc: "Complete EMR maintained securely for all consultations",
    },
    {
      icon: Award,
      title: "Quality Care",
      desc: "Top-rated doctors with 4.5+ ratings",
    },
  ];

  // Stats
  // const stats = [
  //   { value: "50,000+", label: "Verified Doctors" },
  //   { value: "5M+", label: "Happy Patients" },
  //   { value: "1000+", label: "Cities Covered" },
  //   { value: "4.8/5", label: "Average Rating" },
  // ];
  const healthcareIcons = [
  { icon: Heart, label: "Compassionate Care" },
  { icon: Stethoscope, label: "Expert Doctors" },
  { icon: UserCheck, label: "Verified Professionals" },
];

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        fontFamily: "var(--font-primary, system-ui, -apple-system, sans-serif)",
      }}
    >

      <HealthcareHero/>

      {/* Main Services Grid - CTA #1 */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Complete Healthcare at Your Fingertips
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for better health - consultations,
              appointments, tests, and medicines
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {mainServices.map((service, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-2"
              >
                <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
                <div className="p-8">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.desc}
                  </p>
                  <button className="w-full bg-[#0c213e] hover:bg-[#1a3557] text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group-hover:gap-3">
                    {service.cta}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Find Doctors by Specialty
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Expert doctors across all major specialties available 24/7
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
            {specialties.map((specialty, index) => (
              <button
                key={index}
                className="group bg-white hover:bg-gradient-to-br hover:from-[#0c213e] hover:to-[#1a3557] border-2 border-gray-200 hover:border-[#0c213e] rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gray-100 group-hover:bg-white/20 rounded-2xl flex items-center justify-center mb-4 transition-all">
                    <specialty.icon className="w-8 h-8 text-[#0c213e] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-white mb-1 transition-colors">
                    {specialty.name}
                  </h3>
                  <p className="text-sm text-gray-500 group-hover:text-blue-200 transition-colors">
                    {specialty.doctors}+ Doctors
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center">
            <button className="bg-white border-2 border-[#0c213e] text-[#0c213e] hover:bg-[#0c213e] hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all inline-flex items-center gap-2">
              View All Specialties
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Video Consultation CTA - CTA #2 */}
      {/* <section className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-12 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-6 self-start">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-semibold">Available Now</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Consult a Doctor in
                  <span className="text-[#0c213e]"> 60 Seconds</span>
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Skip the waiting room. Connect with certified doctors instantly via video call from anywhere in India. Get prescriptions, medical certificates, and expert advice.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Available 24/7 - Day or Night</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Digital Prescriptions & EMR</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Follow-up Support Included</span>
                  </div>
                </div>
                <button className="bg-[#0c213e] hover:bg-[#1a3557] text-white px-10 py-5 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 group">
                  <Video className="w-6 h-6" />
                  Start Video Consultation
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="bg-gradient-to-br from-[#0c213e] to-[#1a3557] p-12 flex items-center justify-center">
                <div className="text-center text-white">
                  <Video className="w-32 h-32 mx-auto mb-8 opacity-80" />
                  <div className="text-6xl font-bold mb-4">₹299</div>
                  <div className="text-xl opacity-90">First Consultation</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Everything at Your Fingertips - CTA #2 */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-12 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-[#0c213e] px-4 py-2 rounded-full mb-6 self-start">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    No Need to Step Out
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Everything at Your
                  <span className="text-[#0c213e]"> Fingertips</span>
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-tight">
                  Book appointments, consult doctors online, order medicines,
                  and book lab tests - all from the comfort of your home.
                  Healthcare made simple and accessible.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      Book appointments with nearby doctors
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      Video consultations when appointment time arrives
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      Order medicines & book lab tests online
                    </span>
                  </div>
                </div>
                <Link to={"/search-results"}>
                  <button className="bg-[#0c213e] hover:bg-[#1a3557] text-white px-10 py-5 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 group cursor-pointer">
                    <Calendar className="w-6 h-6" />
                    Book Your Appointment
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
              <div className="bg-gradient-to-br from-[#0c213e] to-[#1a3557] p-12 flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Mobile App Mockup Illustration */}
                  <div className="relative">
                    {/* Phone Frame */}
                    <div className="w-64 h-96 bg-white rounded-3xl shadow-2xl p-4 relative overflow-hidden border-8 border-gray-800">
                      {/* Status Bar */}
                      <div className="flex justify-between items-center mb-4 px-2">
                        <span className="text-xs text-gray-400">9:41</span>
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        </div>
                      </div>

                      {/* App Content */}
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="bg-[#0c213e] text-white p-3 rounded-xl">
                          <div className="text-xs opacity-75 mb-1">
                            Welcome back!
                          </div>
                          <div className="font-bold">Book Your Appointment</div>
                        </div>

                        {/* Service Cards */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-blue-50 p-3 rounded-lg text-center">
                            <Video className="w-6 h-6 text-[#0c213e] mx-auto mb-1" />
                            <div className="text-xs font-semibold text-gray-700">
                              Video Call
                            </div>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg text-center">
                            <Calendar className="w-6 h-6 text-green-600 mx-auto mb-1" />
                            <div className="text-xs font-semibold text-gray-700">
                              Book Apt
                            </div>
                          </div>
                          <div className="bg-purple-50 p-3 rounded-lg text-center">
                            <Microscope className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                            <div className="text-xs font-semibold text-gray-700">
                              Lab Tests
                            </div>
                          </div>
                          <div className="bg-orange-50 p-3 rounded-lg text-center">
                            <Pill className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                            <div className="text-xs font-semibold text-gray-700">
                              Medicines
                            </div>
                          </div>
                        </div>

                        {/* Appointment Preview */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-[#0c213e] rounded-full"></div>
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-gray-800">
                                Dr. Sharma
                              </div>
                              <div className="text-xs text-gray-500">
                                Cardiologist
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1 bg-white p-2 rounded text-center">
                              <div className="text-xs text-gray-500">Today</div>
                              <div className="text-xs font-bold text-[#0c213e]">
                                4:30 PM
                              </div>
                            </div>
                            <button className="flex-1 bg-[#0c213e] text-white p-2 rounded text-xs font-semibold">
                              Join
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Floating Icons */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Patients Trust Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              India's most trusted healthcare platform with verified doctors and
              secure digital records
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#0c213e] to-[#1a3557] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - CTA #3 */}
      <section className="py-20 bg-gradient-to-br from-[#0c213e] via-[#1a3557] to-[#0c213e] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Experience Better Healthcare?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join millions of Indians who trust us for their healthcare needs.
              Get started in less than 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-[#0c213e] hover:bg-gray-100 px-10 py-5 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 group">
                <Video className="w-6 h-6" />
                Consult Doctor Now
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#0c213e] px-10 py-5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3">
                <Phone className="w-6 h-6" />
                Call: 1800-123-4567
              </button>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>No Registration Fee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Free Follow-ups</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Secure & Private</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">DOCTORZ</h3>
              <p className="text-sm mb-4">
                India's trusted healthcare platform connecting patients with
                verified doctors.
              </p>
              <div className="flex gap-4">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Find Doctors
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Video Consultation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Book Lab Tests
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Order Medicine
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Doctors</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Register as Doctor
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Doctor Login
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    List Your Clinic
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  1800-123-4567
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  support@healthcare.com
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>
              &copy; 2024 HealthCare. All rights reserved. | Privacy Policy |
              Terms of Service
            </p>
          </div>
        </div>
      </footer>

      {/* Global Font Variable */}
      <style>{`
        :root {
          --font-primary: 'Inter', 'Segoe UI', 'Roboto', system-ui, -apple-system, sans-serif;
        }
      `}</style>
    </div>
  );
}
