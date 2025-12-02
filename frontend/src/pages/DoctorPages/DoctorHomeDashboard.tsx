

import React, { useEffect, useState } from "react";
import {
  UserIcon,
  CalendarIcon,
  HeartIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/solid";
import api from "../../Services/mainApi";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

interface Doctor {
  _id: string;
  doctorId: string;
  fullName: string;
  email: string;
}

interface DoctorResponse {
  message: string;
  doctor: Doctor;
}

interface Appointment {
  time: string;
  isActive: boolean;
}

interface TotalPatientsResponse {
  totalPatients: number;
}
import Cookies from "js-cookie";


const DoctorDashboardHome: React.FC = () => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [dateTime, setDateTime] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [todaysAppointments, setTodaysAppointments] = useState<number>(0);

  const navigate = useNavigate();
const token = Cookies.get("doctorToken");
  const doctorId = localStorage.getItem("doctorId");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      setDateTime(formatted);
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch doctor details
  useEffect(() => {
    if (!token || !doctorId) {
      navigate("/doctor-login");
      return;
    }

    const fetchDoctor = async () => {
      try {
        const res = await api.get<DoctorResponse>(`/api/doctor/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctor(res.data.doctor);
      } catch (err) {
        console.error("Error fetching doctor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [token, doctorId, navigate]);

  // Fetch today's appointments
  useEffect(() => {
    if (!token || !doctorId) return;

    const fetchTodaysAppointments = async () => {
      try {
        const res = await api.get<Appointment[]>(
          `/api/doctor/todays-appointments/${doctorId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTodaysAppointments(res.data.length);
      } catch (err) {
        console.error("Error fetching today's appointments:", err);
      }
    };

    fetchTodaysAppointments();
  }, [token, doctorId]);

  // Fetch total patients
  useEffect(() => {
    if (!token || !doctorId) return;

    const fetchTotalPatients = async () => {
      try {
        const res = await api.get<TotalPatientsResponse>(
          `/api/doctor/total-patients/${doctorId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTotalPatients(res.data.totalPatients);
      } catch (err) {
        console.error("Error fetching total patients:", err);
      }
    };

    fetchTotalPatients();
  }, [token, doctorId]);

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading dashboard...</p>;
  }

  const healthTrends = [
    { day: "Mon", heartRate: 80, bp: 120 },
    { day: "Tue", heartRate: 76, bp: 118 },
    { day: "Wed", heartRate: 85, bp: 122 },
    { day: "Thu", heartRate: 90, bp: 130 },
    { day: "Fri", heartRate: 88, bp: 125 },
    { day: "Sat", heartRate: 78, bp: 119 },
    { day: "Sun", heartRate: 82, bp: 121 },
  ];

  return (
    <div className="min-h-screen ml-5 w-full p-4 sm:p-6 text-gray-800 ">
      {/* Header */}
      <div className="bg-[#0B1D3B] shadow rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 text-white">
        <div className="mb-3 sm:mb-0">
          <h1 className="text-xl sm:text-2xl font-bold">
            Welcome back, Dr. {doctor?.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300">{dateTime}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-xs sm:text-sm font-medium text-gray-800 bg-white">
            Export Report
          </button>
          <button className="px-3 sm:px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs sm:text-sm font-medium shadow">
            Quick Actions
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6">
        {[
          {
            title: "Total Patients",
            value: totalPatients.toString(),
            icon: <UserIcon className="text-cyan-600 w-6 h-6" />,
            change: "+10%",
            note: "since last month",
          },
          {
            title: "Today's Appointments",
            value: (todaysAppointments ?? 0).toString(),
            icon: <CalendarIcon className="text-indigo-600 w-6 h-6" />,
            change: "",
            note: "scheduled today",
          },
          {
            title: "Critical Patients",
            value: "5",
            icon: <HeartIcon className="text-red-500 w-6 h-6" />,
            change: "Urgent",
            note: "requires attention",
          },
          {
            title: "Monthly Revenue",
            value: "₹85,000",
            icon: <CurrencyRupeeIcon className="text-green-600 w-6 h-6" />,
            change: "+18%",
            note: "growth this month",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-gray-50 p-4 sm:p-5 rounded-xl shadow hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              {item.icon}
              <span
                className={`text-xs sm:text-sm font-medium ${
                  item.title === "Critical Patients"
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {item.change}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-3">{item.value}</h2>
            <p className="text-gray-700 text-sm">{item.title}</p>
            <p className="text-gray-400 text-xs">{item.note}</p>
          </div>
        ))}
      </div>

      {/* Overview Section */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">
          Patient System Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart Section */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-gray-700 mb-2 font-semibold text-sm sm:text-base">
              Health Mapping Visualization
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={healthTrends}>
                <defs>
                  <linearGradient id="colorHeart" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#888" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="heartRate"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorHeart)"
                />
                <Area
                  type="monotone"
                  dataKey="bp"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorBP)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* System Summary */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: "Cardiovascular", count: 456 },
                { name: "Respiratory", count: 234 },
                { name: "Neurological", count: 189 },
                { name: "Gastrointestinal", count: 298 },
              ].map((sys) => (
                <div
                  key={sys.name}
                  className="bg-gray-100 p-3 rounded-md hover:bg-gray-200 transition text-center sm:text-left"
                >
                  <p className="font-semibold text-gray-700 text-sm sm:text-base">
                    {sys.name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {sys.count} patients
                  </p>
                </div>
              ))}
            </div>
            <div className="bg-red-100 border border-red-300 rounded-md p-3 sm:p-4">
              <p className="font-semibold text-red-600 text-sm sm:text-base">
                Active Alert:
              </p>
              <p className="text-gray-700 text-xs sm:text-sm">
                Robert Wilson – Atrial Fibrillation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardHome;
