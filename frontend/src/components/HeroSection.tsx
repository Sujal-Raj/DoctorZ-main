import  { useState } from 'react';
import { Search, MapPin, CheckCircle, Video, Stethoscope, Microscope, Pill, Heart, Activity, Calendar, FileText, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const HealthcareHero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const healthcareIcons = [
    { icon: Video, label: 'Video Consult' },
    { icon: Stethoscope, label: 'Find Doctors' },
    { icon: Microscope, label: 'Lab Tests' },
    { icon: Pill, label: 'Medicines' }
  ];

  return (
    <section className="relative bg-gradient-to-br from-[#0c213e] via-[#1a3557] to-[#0c213e] text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
          {/* Left Content */}
          <div className="text-center lg:text-left order-1 lg:order-1">
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">
                India's New Healthcare Platform
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 leading-tighter">
              Your Health,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 pb-3">
                Our Priority
              </span>
            </h1>

            <p className="text-base md:text-lg lg:text-xl text-blue-100 mb-8 max-w-2xl mx-auto lg:mx-0">
              Connect with verified doctors instantly. Video consultations,
              nearby clinics, lab tests & medicine delivery - all in one place.
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search doctors, specialties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl border-2 border-gray-200 focus:border-[#0c213e] focus:outline-none text-gray-800 text-sm md:text-base"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Your city or location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl border-2 border-gray-200 focus:border-[#0c213e] focus:outline-none text-gray-800 text-sm md:text-base"
                  />
                </div>
                <button className="bg-[#0c213e] hover:bg-[#1a3557] text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 whitespace-nowrap">
                  <Search className="w-5 h-5" />
                  Search
                </button>
              </div>
            </div>

            {/* Icon Features */}
            <div className="hidden md:flex justify-center lg:justify-start gap-8 lg:gap-12 mt-10">
              {healthcareIcons.map(({ icon: Icon, label }) => (
                <motion.div
                  key={label}
                  className="flex flex-col items-center gap-2"
                  whileHover={{ scale: 1.1, color: "#22D3EE" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className="w-8 h-8 text-blue-400" />
                  <span className="text-blue-200 text-sm font-medium">{label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Illustration - Professional Healthcare Dashboard */}
          <div className="flex items-center justify-center order-2 lg:order-2">
            <div className="relative w-full max-w-lg mx-auto">
              
              {/* Main Dashboard Container */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative bg-white rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0c213e] to-[#1a3557] rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Health Dashboard</h3>
                      <p className="text-xs text-gray-500">Your care journey</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-600 font-medium">Live</span>
                  </div>
                </div>

                {/* Doctor Profile Card */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 mb-4 border border-blue-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#0c213e] to-[#1a3557] rounded-full flex items-center justify-center">
                        <Stethoscope className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-800">Dr. Anjali Sharma</h4>
                      <p className="text-xs text-gray-600">Cardiologist • 15 years exp</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-3 h-3 text-yellow-400">★</div>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">4.9 (2.3k reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 bg-[#0c213e] text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-[#1a3557] transition-colors">
                      <Video className="w-3 h-3" />
                      Video Consult
                    </button>
                    <button className="flex-1 bg-white text-[#0c213e] py-2 rounded-lg text-xs font-semibold border border-[#0c213e] hover:bg-gray-50 transition-colors">
                      View Profile
                    </button>
                  </div>
                </motion.div>

                {/* Quick Stats Grid */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="grid grid-cols-2 gap-3 mb-4"
                >
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-gray-700">Health Score</span>
                    </div>
                    <p className="text-xl font-bold text-gray-800">92%</p>
                    <p className="text-xs text-green-600">Excellent</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-3 border border-purple-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-gray-700">Next Checkup</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800">Dec 5</p>
                    <p className="text-xs text-purple-600">In 7 days</p>
                  </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="space-y-2"
                >
                  <h4 className="text-xs font-semibold text-gray-600 mb-2">Recent Activity</h4>
                  
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-800">Lab Report Ready</p>
                      <p className="text-xs text-gray-500">Blood test results • 2h ago</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Pill className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-800">Prescription Updated</p>
                      <p className="text-xs text-gray-500">2 medications • Today</p>
                    </div>
                    <div className="text-xs text-orange-600 font-semibold">View</div>
                  </div>
                </motion.div>

                {/* Decorative gradient accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-2xl"></div>
              </motion.div>

              {/* Floating Trust Badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 sm:-right-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-xl p-3 sm:p-4"
              >
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </motion.div>

              {/* Floating Stats */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="hidden sm:block absolute -left-6 top-1/4 bg-white rounded-xl shadow-lg p-3 border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Video className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">1.2M+</p>
                    <p className="text-xs text-gray-500">Consultations</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="hidden sm:block absolute -right-6 bottom-1/4 bg-white rounded-xl shadow-lg p-3 border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Stethoscope className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">50K+</p>
                    <p className="text-xs text-gray-500">Doctors</p>
                  </div>
                </div>
              </motion.div>

              {/* Pulse Effect */}
              {/* <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-3xl border-2 border-blue-400 pointer-events-none"
              /> */}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HealthcareHero;