import { useEffect, useState } from "react";
import {
  Link,
  Outlet,
  // useLocation,
  useMatch,
  useNavigate,
} from "react-router-dom";
import {
  HomeIcon,
  UserIcon,
  ClockIcon,
  CalendarIcon,
  UsersIcon,
  KeyIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import api from "../../Services/mainApi";

interface Notification {
  _id: string;
  message: string;
  status: "pending" | "seen";
  createdAt: string;
}

export default function DoctorDashboard() {
  // const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [newNotifCount, setNewNotifCount] = useState(0);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto open/close depending on screen
  useEffect(() => {
    if (isDesktop) setSidebarOpen(true);
    else setSidebarOpen(false);
  }, [isDesktop]);

  const handleLogout = () => {
    localStorage.removeItem("doctorId");
    localStorage.removeItem("token");
    navigate("/");
  };

  const doctorId = localStorage.getItem("doctorId");

  // Fetch notifications
  const fetchNotificationCount = async () => {
    try {
      const res = await api.get<{ notifications: Notification[] }>(
        `/api/doctor/notifications/${doctorId}`
      );

      const pendingCount = res.data.notifications.filter(
        (n: any) => n.status === "pending"
      ).length;

      setNewNotifCount(pendingCount);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 10000);
    return () => clearInterval(interval);
  }, [doctorId]);

  const menuItems = [
    {
      name: "Appointments",
      path: "appointments",
      icon: <CalendarIcon className="w-5 h-5" />,
    },
    {
      name: "Dashboard",
      path: "doctor-home-dashboard",
      icon: <HomeIcon className="w-5 h-5" />,
    },
    {
      name: "Profile",
      path: "doctorProfile",
      icon: <UserIcon className="w-5 h-5" />,
    },
    {
      name: "Add Availability",
      path: "time-slots",
      icon: <ClockIcon className="w-5 h-5" />,
    },
    {
      name: "My Patients",
      path: "patients",
      icon: <UsersIcon className="w-5 h-5" />,
    },
    {
      name: "Notifications",
      path: "notifications",
      icon: <BellIcon className="w-5 h-5" />,
    },
  ];
  

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* --- MOBILE TOP BAR --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#0c213e] text-white flex items-center justify-between px-4 py-3 z-50 shadow-lg">
        <h1 className="text-lg font-semibold">Doctor Dashboard</h1>

        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded hover:bg-[#0a1a32] transition"
        >
          <Bars3Icon className="w-7 h-7 text-white" />
        </button>
      </div>

      {/* --- BACKDROP (CLICK OUTSIDE TO CLOSE SIDEBAR) --- */}
      {!isDesktop && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          bg-[#0c213e] text-white flex flex-col justify-between
          fixed md:relative 
          left-0
          z-40 
          w-64 h-[calc(100vh-56px)] md:h-full
          transform transition-transform duration-300

          /* mobile top spacing (below topbar) */
          top-[56px] md:top-0

          /* sliding animation */
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 bg-[#0c213e] rounded-md hover:bg-[#0a1a32] transition md:hidden"
        >
          <XMarkIcon className="w-5 h-5 text-white" />
        </button>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="hidden md:flex items-center justify-center mb-10">
            <h2 className="text-2xl font-bold">Doctor Dashboard</h2>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const dashboardPath = `/doctordashboard/${doctorId}`;
              // const to = item.path === "" ? dashboardPath : item.path;

              // const isActive =
              //   item.path === ""
              //     ? !!useMatch(`/doctorDashboard/${doctorId}`)
              //     : !!useMatch(`/doctorDashboard/${doctorId}/${item.path}`);
              const basePath = `/doctorDashboard/${doctorId}`;

              const isActive =
                item.path === "appointments"
                  ? location.pathname === basePath ||
                    location.pathname.startsWith(`${basePath}/appointments`)
                  : location.pathname.startsWith(`${basePath}/${item.path}`);

              // const handleMenuClick = () => {
              //   if (!isDesktop) setSidebarOpen(false);
              // };

              return (
                <Link
                  key={item.name}
                  to={
                    item.path === "appointments"
                      ? `${basePath}/appointments`
                      : `${basePath}/${item.path}`
                  }
                  onClick={() => !isDesktop && setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-800 text-gray-300"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium text-sm md:text-base">
                    {item.name}
                  </span>

                  {item.name === "Notifications" && newNotifCount > 0 && (
                    <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {newNotifCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-6 border-t border-[#0a1a32]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-700 transition text-white w-full justify-center"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        className="
          flex-1 bg-gray-100 
          p-8 overflow-y-auto 
          pt-[56px] md:pt-8
          
        "
      >
        <div className="max-w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
