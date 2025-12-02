import { useEffect, useState } from "react";

import {
  CalendarDaysIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  UserIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import api from "../../Services/mainApi";
import { useNavigate } from "react-router-dom";

interface Patient {
  name: string;
  age: number;
  gender: string;
  contact: string;
  aadhar?: string;
}

interface Booking {
  _id: string;
  patient: Patient;
  dateTime: string;
  fees: number;
  mode: "online" | "offline";
  status: "pending" | "completed";
}

export default function DoctorAppointments() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const doctorId = localStorage.getItem("doctorId");
  const navigate = useNavigate();

  const fetchBookings = async () => {
    if (!doctorId) return;
    try {
      const { data } = await api.get<{ bookings: Booking[] }>(
        `/api/booking/doctor/${doctorId}`
      );

      if (data.bookings && data.bookings.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
        endOfWeek.setHours(23, 59, 59, 999);

        const todayBookings: Booking[] = [];
        const thisWeekBookings: Booking[] = [];
        const upcomingBookings: Booking[] = [];

        data.bookings.forEach((b) => {
          const date = new Date(b.dateTime);
          date.setSeconds(0, 0);
          if (date.toDateString() === today.toDateString()) {
            todayBookings.push(b);
          } else if (date >= today && date <= endOfWeek) {
            thisWeekBookings.push(b);
          } else {
            upcomingBookings.push(b);
          }
        });

        // Sort each group by date ascending
        todayBookings.sort(
          (a, b) =>
            new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        );
        thisWeekBookings.sort(
          (a, b) =>
            new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        );
        upcomingBookings.sort(
          (a, b) =>
            new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        );

        setBookings([
          ...todayBookings,
          ...thisWeekBookings,
          ...upcomingBookings,
        ]);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setBookings([]);
    }
  };

  const updateStatus = async (id: string) => {
    try {
      await api.put(`/api/booking/${id}/status`, {
        status: "completed",
      });
      fetchBookings();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const renderBookingCard = (b: Booking) => {
    const dateObj = new Date(b.dateTime);

    const formattedDate = dateObj.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const formattedTime = dateObj.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div
        key={b._id}
        className="bg-white border border-gray-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition"
      >
        {/* Patient Info */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <UserIcon className="text-gray-600 w-6 h-6" />
            <h3 className="text-lg font-semibold text-gray-900">
              {b.patient?.name}
            </h3>
          </div>
          <p className="text-gray-600 text-sm">
            {b.patient?.age} yrs • {b.patient?.gender}
          </p>
          <p className="text-gray-600 text-sm">Contact: {b.patient?.contact}</p>
        </div>

        {/* Appointment Info */}
        <div className="mb-4 text-gray-700 text-sm space-y-2">
          <p className="flex items-center gap-2">
            <CalendarDaysIcon className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Date:</span> {formattedDate}
          </p>

          <p className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Time:</span> {formattedTime}
          </p>

          <p className="flex items-center gap-2">
            <CurrencyRupeeIcon className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Fees:</span> {b.fees}
          </p>

          <p className="flex items-center gap-2 capitalize">
            <ClockIcon className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Mode:</span> {b.mode}
          </p>
        </div>

        {/* Status */}
        <div className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 bg-yellow-200 text-yellow-800">
          {b.status === "pending" ? "Pending" : "Completed"}
        </div>

        {/* Complete Appointment Button */}
        {b.status === "pending" && (
          <button
            onClick={() => updateStatus(b._id)}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
          >
            <CheckIcon className="w-5 h-5" />
            Complete Appointment
          </button>
        )}

        {/* Prescription Button */}
        <button
          onClick={() =>
            navigate(`addPrescription/${b._id}/${b?.patient.aadhar}`, {
              state: {
                name: b.patient?.name,
                gender: b.patient?.gender,
              },
            })
          }
          className="w-full mt-3 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
        >
          Give Prescription
        </button>
      </div>
    );
  };

  if (bookings.length === 0) {
    return (
      <div className="p-4 ml-5 lg:p-8 flex flex-col w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 text-gray-800">
          Appointments
        </h2>
        <div className="text-center text-gray-500 py-10 text-lg">
          No Appointments
        </div>
      </div>
    );
  }

  // Group headings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
  endOfWeek.setHours(23, 59, 59, 999);

  const todayAppointments = bookings.filter(
    (b) => new Date(b.dateTime).toDateString() === today.toDateString()
  );
  const thisWeekAppointments = bookings.filter((b) => {
    const date = new Date(b.dateTime);
    return (
      date.toDateString() !== today.toDateString() &&
      date >= startOfWeek &&
      date <= endOfWeek
    );
  });

  const upcomingAppointments = bookings.filter(
    (b) => new Date(b.dateTime) > endOfWeek
  );

  const renderGroup = (title: string, list: Booking[]) =>
    list.length > 0 && (
      <div className="mb-6">
        <h3 className="text-3xl font-bold text-gray-700 mb-6 ">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full max-w-screen-xl">
          {list.map((b) => renderBookingCard(b))}
        </div>
      </div>
    );

  return (
    <div className="p-4 ml-5 lg:p-8 flex flex-col w-full">
      {renderGroup("Today's  Appointments", todayAppointments)}
      {renderGroup("This Week's Appointments", thisWeekAppointments)}
      {renderGroup("Upcoming Appointments", upcomingAppointments)}
    </div>
  );
}
