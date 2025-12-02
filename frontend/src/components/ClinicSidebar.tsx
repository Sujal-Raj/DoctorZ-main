import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, User, UserPlus, Users, LogOut, Menu } from "lucide-react";

interface MenuItem {
  name: string;
  path: string;
  icon: ReactNode;
}

const ClinicSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(window.innerWidth >= 768);

  // Detect window resize
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Desktop always open
  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  const handleLogout = () => {
    localStorage.removeItem("clinic_portal_token");
    navigate("/");
  };

  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      path: "clinic-home-dashboard",
      icon: <Home size={18} />,
    },
    {
      name: "All Doctor Profiles",
      path: "all-clinic-doctors",
      icon: <User size={18} />,
    },
    { name: "Add Doctor", path: "add-doctor", icon: <UserPlus size={18} /> },
    { name: "My Profile", path: "clinic-profile", icon: <User size={18} /> },
    {
      name: "Patients",
      path: "all-clinic-patients",
      icon: <Users size={18} />,
    },
  ];

  return (
    <>
      {/* ---------- MOBILE TOP BAR ---------- */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 bg-[#0c213e] text-white 
        flex items-center justify-between px-4 py-3 z-50 shadow-lg"
      >
        <h1 className="text-lg font-semibold tracking-wide">
          Clinic Dashboard
        </h1>

        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded hover:bg-[#0a1a32] active:scale-95 transition"
        >
          <Menu size={26} className="text-white" />
        </button>
      </div>

      {/* ---------- BACKDROP ---------- */}
      {!isDesktop && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* ---------- SIDEBAR ---------- */}
      <aside
        className={`
          bg-[#0c213e] text-white
          fixed md:fixed
          top-[56px] md:top-0
          left-0
          h-[calc(100vh-56px)] md:h-screen
          w-64
          flex flex-col
          z-50
          transform transition-transform duration-300 ease-in-out shadow-xl
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Desktop Title */}
          <div className="hidden md:flex items-center justify-center mb-10">
            <h2 className="text-2xl font-bold">Clinic Dashboard</h2>
          </div>

          {/* Navigation */}
          <nav className="space-y-3">
            {menuItems.map((item: MenuItem) => {
              // let isActive = false;

              // if (item.path === "clinic-home-dashboard") {
              //   // Dashboard special case
              //   isActive = location.pathname === location.pathname.split("/").slice(0, 3).join("/");
              // } else {
              //   // Normal route matching
              //   isActive = location.pathname.endsWith(item.path);
              // }

              const isActive = (() => {
                // FULL CURRENT PATH
                const fullPath = location.pathname;

                // BASE DASHBOARD URL => /clinicDashboard/:id
                const baseDashboard = fullPath.split("/").slice(0, 3).join("/");

                // -------- DASHBOARD LOGIC --------
                if (item.path === "clinic-home-dashboard") {
                  // Case 1: Direct dashboard load
                  if (fullPath === baseDashboard) return true;

                  // Case 2: Dashboard clicked -> /clinic-home-dashboard
                  if (fullPath.endsWith("clinic-home-dashboard")) return true;

                  return false;
                }

                // -------- OTHER MENU ITEMS --------
                return fullPath.endsWith(item.path);
              })();

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => !isDesktop && setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all
                    ${
                      isActive
                        ? "bg-white/20 shadow-md text-white scale-[1.02]"
                        : "hover:bg-white/10 text-gray-300"
                    }
                  `}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-6 border-t border-[#0a1a32] bg-[#0c213e]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg 
              bg-red-500 hover:bg-red-600 active:scale-95 transition 
              text-white w-full justify-center font-medium shadow-md"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ClinicSidebar;
