import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, UserPlus, LogOut, Menu, X } from "lucide-react";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const handleNavClick = () => {
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  const menuItems = [
    { name: "Home", path: "/", icon: <UserPlus size={18} /> },

    { name: "Labs", path: "admin-lab", icon: <User size={18} /> },
    { name: "Doctors", path: "admin-doctor", icon: <UserPlus size={18} /> },
    { name: "Clinics", path: "admin-clinic", icon: <UserPlus size={18} /> },
  ];

  return (
    <>
      {/* ---------- MOBILE TOP BAR ---------- */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 bg-[#0c213e] text-white 
        flex items-center justify-between px-4 py-3 z-50 shadow-lg"
      >
        <h1 className="text-lg font-semibold tracking-wide">Admin Dashboard</h1>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded hover:bg-[#0a1a32] active:scale-95 transition"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ---------- SIDEBAR ---------- */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#0c213e] text-white
          flex flex-col justify-between shadow-xl transform
          transition-transform duration-300 z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Sidebar Content */}
        <div className="flex-1 flex flex-col px-6 py-6 mt-12 lg:mt-0 overflow-y-auto">
          {/* Desktop Title */}
          <div className="hidden lg:flex items-center justify-center mb-10">
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          </div>

          {/* ---------- MENU ---------- */}
          <nav className="space-y-3">
            {menuItems.map((item) => {
              let isActive = false;

              // HOME ACTIVE ONLY ON EXACT HOME ROUTES
              if (item.path === "/") {
                isActive =
                  location.pathname === "/" || location.pathname === "/admin";
              }
              // LABS ACTIVE ON LAB ROUTES + DEFAULT DASHBOARD
              else if (item.path === "admin-lab") {
                isActive =
                  location.pathname.includes("admin-lab") ||
                  location.pathname === "/adminDashboard";
              }
              // OTHER ITEMS NORMAL INCLUDE CHECK
              else {
                isActive = location.pathname.includes(item.path);
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
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

        {/* ---------- LOGOUT BUTTON ---------- */}
        <div className="p-6 border-t border-[#0a1a32] bg-[#0c213e]">
          <button
            onClick={() => {
              handleLogout();
              handleNavClick();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg 
              bg-red-500 hover:bg-red-600 active:scale-95 transition 
              text-white w-full justify-center font-medium shadow-md"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ---------- MOBILE OVERLAY ---------- */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default AdminSidebar;
