import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { User, CalendarDays, FilePlus2, FileText } from "lucide-react";
import { useContext, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../../Context/AuthContext";
import UserIcon from "../../assets/Icon2.png";

function UserDashboard() {
  const { user } = useContext(AuthContext);
  console.log("User", user);

  const navigate = useNavigate();
  const token = Cookies.get("patientToken");
  console.log(token);
  console.log("Patient ID from params:", user);
  useEffect(() => {
    if (!token) {
      navigate("/patient-login");
      return;
    }
    try {
      jwtDecode(token);
    } catch (err) {
      console.log(err);
      Cookies.remove("patientToken");
      navigate("/patient-login");
    }
  }, [token, navigate]);
  const location = useLocation();

  useEffect(() => {
    const base = `/user-dashboard/${user?.id}`;

    if (location.pathname === base) {
      navigate("user-profile", { replace: true });
    }
  }, [location.pathname, user, navigate]);

  return (
    <div className="w-full flex justify-center bg-gray-100">
    {/* <div className="w-full flex justify-center bg-gray-100 py-2"> */}
      {/* ✅ Responsive Wrapper */}
      <div
        className="flex w-full
                      bg-white md:shadow-xl 
                      overflow-hidden md:flex-row flex-col"
      >
        {/* ✅ SIDEBAR — hidden on mobile */}
        <aside
          className="h-screen left-0 hidden md:block w-72 bg-gradient-to-b 
                          from-[#0c213e] to-[#08172c] text-white p-6 relative"
        >
          <div className="flex items-center gap-3 mb-10 ">
            <img src={UserIcon} className="w-12 h-12 rounded-full" />
            <div>
              <h2 className="text-sm font-semibold">{user?.name}</h2>
              <p className="text-xs text-blue-100">{user?.email}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-3">
            <NavLink
              to="user-profile"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 rounded-lg transition 
                 ${
                   isActive
                     ? "bg-white text-indigo-700 shadow-md"
                     : "text-blue-100 hover:bg-white/10"
                 }`
              }
            >
              <User size={18} /> My Profile
            </NavLink>

            <NavLink
              to="appointments"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 rounded-lg transition 
                 ${
                   isActive
                     ? "bg-white text-indigo-700 shadow-md"
                     : "text-blue-100 hover:bg-white/10"
                 }`
              }
            >
              <CalendarDays size={18} /> Appointment
            </NavLink>

            <NavLink
              to="add-emr"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 rounded-lg transition 
                 ${
                   isActive
                     ? "bg-white text-indigo-700 shadow-md"
                     : "text-blue-100 hover:bg-white/10"
                 }`
              }
            >
              <FilePlus2 size={18} /> EMR
            </NavLink>

            <NavLink
              to="prescription"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 rounded-lg transition 
                 ${
                   isActive
                     ? "bg-white text-indigo-700 shadow-md"
                     : "text-blue-100 hover:bg-white/10"
                 }`
              }
            >
            <FileText size={18}/> My Prescriptions
            </NavLink>

            <NavLink
              to={`lab-test/${ user?.id}`}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 rounded-lg transition 
                 ${
                   isActive
                     ? "bg-white text-indigo-700 shadow-md"
                     : "text-blue-100 hover:bg-white/10"
                 }`
              }
            >
              <FilePlus2 size={18} /> Lab Test
            </NavLink>
          </nav>
        </aside>

        {/* ✅ CONTENT AREA */}
        <main className="flex-1 h-screen p-3 md:p-0 bg-gray-100 md:bg-[#dadde1] overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default UserDashboard;
