import { useState, useContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Menu,
  X,
  User,
  LogOut,
  LogIn,
  ChevronDown,
  MapPin,
  Navigation,
  Loader2,
  Stethoscope,
  UserPlus,
  UserCircle2,
  Hospital,
  FlaskConical,
  LocateFixed,
} from "lucide-react";
import Cookies from "js-cookie";
import { jwtDecode, type JwtPayload } from "jwt-decode";
import { AuthContext } from "../Context/AuthContext";
import RightSidebar from "./RightSidebar";

export default function Navbar() {
  interface MyTokenPayload extends JwtPayload {
    id: string;
  }

  interface LocationData {
  city?: string;
  countryName?: string;
}


  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const { isLoggedIn, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const token = Cookies.get("patientToken") || "";
  const decoded = token ? jwtDecode<MyTokenPayload>(token) : null;

  // Get patientId from decoded token
  const patientId = decoded?.id || "";

  // ---------------- LOCATION ----------------
  const [userLocation, setUserLocation] = useState<string>(
    "Detecting location..."
  );
  const [isLocating, setIsLocating] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string>("");
  const [locationDropdownOpen, setLocationDropdownOpen] =
    useState<boolean>(false);

  const popularCities = [
    "Delhi, India",
    "Mumbai, India",
    "Bangalore, India",
    "Hyderabad, India",
    "Chennai, India",
    "Kolkata, India",
    "Pune, India",
    "Ahmedabad, India",
  ];

  useEffect(() => {
    const fetchLocation = async (): Promise<void> => {
      try {
        setIsLocating(true);
        if (!navigator.geolocation) {
          setUserLocation("Location not supported");
          setIsLocating(false);
          return;
        }

        const cached = localStorage.getItem("userLocation");
        if (cached) {
          setUserLocation(cached);
          setIsLocating(false);
        }

        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 8000,
            maximumAge: 300000,
          })
        );

        const { latitude, longitude } = pos.coords;
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data:LocationData = await res.json();
        const locationText = `${data.city || "Unknown"}, ${
          data.countryName || ""
        }`;
        console.log("Detected location:", locationText);
        setUserLocation(locationText);
        localStorage.setItem("userLocation", locationText);
      } catch {
        setUserLocation("Location not found");
      } finally {
        setIsLocating(false);
      }
    };

    fetchLocation();
  }, []);


  const handleManualLocationSelect = (city: string) => {
    setUserLocation(city);
    localStorage.setItem("userLocation", city);
    setShowLocationPopup(false);
    setLocationDropdownOpen(false);
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setLocationError("");
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 8000,
          maximumAge: 300000,
        })
      );
      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const data = await res.json();
      const locationText = `${data.city || "Unknown"}, ${
        data.countryName || ""
      }`;
      setUserLocation(locationText);
      localStorage.setItem("userLocation", locationText);
      setLocationDropdownOpen(false);
    } catch {
      setLocationError("Failed to fetch location");
    } finally {
      setIsLocating(false);
    }
  };

  // ---------------- NAV ITEMS ----------------
  const navItems = [
    { label: "Home", path: "/" },
    { label: "Find Doctors", path: "/search-results" },
    { label: "Find Clinics", path: "/all-clinics" },
    { label: "Lab Tests", path: "/all-lab-test" },
  ];

  // ---------------- DROPDOWN OPTIONS ----------------
  const registerOptions = [
    {
      label: "Patient",
      path: "/patient-register",
      icon: <UserCircle2 size={18} />,
    },
    {
      label: "Doctor",
      path: "/doctor-register",
      icon: <Stethoscope size={18} />,
    },
    { label: "Clinic", path: "/clinic-register", icon: <Hospital size={18} /> },
    { label: "Lab", path: "/lab-register", icon: <FlaskConical size={18} /> },
  ];

  const loginOptions = [
    {
      label: "Patient",
      path: "/patient-login",
      icon: <UserCircle2 size={18} />,
    },
    { label: "Doctor", path: "/doctor-login", icon: <Stethoscope size={18} /> },
    { label: "Clinic", path: "/clinic-login", icon: <Hospital size={18} /> },
    { label: "Lab", path: "/lab-login", icon: <FlaskConical size={18} /> },
  ];

  // ---------------- RENDER ----------------
  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* LOGO + LOCATION */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-2xl font-bold text-[#0c213e] hover:text-[#1f2673]"
            >
              <div className="w-8 h-8 bg-[#0c213e] rounded-full flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              DoctorZ
            </Link>

            {/* Location Dropdown */}
            <DropdownMenu.Root
              open={locationDropdownOpen}
              onOpenChange={setLocationDropdownOpen}
            >
              <DropdownMenu.Trigger asChild>
                <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 cursor-pointer rounded-lg border border-gray-200">
                  {isLocating ? (
                    <Loader2 className="w-4 h-4 text-[#0c213e] animate-spin" />
                  ) : (
                    <MapPin size={16} className="text-[#0c213e]" />
                  )}
                  <span className="text-sm font-semibold text-gray-800">
                    {isLocating ? "Detecting..." : userLocation}
                  </span>
                  <ChevronDown size={14} className="text-gray-400" />
                </div>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content
                className="bg-white rounded-xl shadow-2xl border border-gray-100 w-80 z-[60]"
                align="start"
                sideOffset={5}
              >
                <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
                  {/* Current Location Button */}
                  <DropdownMenu.Item asChild>
                    <button
                      onClick={handleUseCurrentLocation}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 text-left transition-colors"
                    >
                      <LocateFixed size={20} className="text-[#0c213e]" />
                      <span className="flex-1 font-medium">
                        Current Location
                      </span>
                      {isLocating && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      )}
                    </button>
                  </DropdownMenu.Item>

                  {/* OR with horizontal lines */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-xs font-medium text-gray-500 px-2">
                      OR
                    </span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  <div>
                    <DropdownMenu.Item asChild>
                      <button
                        onClick={() => {
                          const userInput = prompt("Enter your location:");
                          if (userInput && userInput.trim()) {
                            handleManualLocationSelect(userInput.trim());
                          }
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 text-left transition-colors mb-3"
                      >
                        <MapPin size={20} className="text-green-600" />
                        <span className="flex-1 font-medium">
                          Choose a different location
                        </span>
                      </button>
                    </DropdownMenu.Item>
                  </div>

                  {/* Popular Cities Section */}
                  <div>
                    <div className="text-sm font-semibold mb-3 text-gray-700">
                      Popular Cities
                    </div>
                    <div className="grid gap-2">
                      {popularCities.map((city) => (
                        <DropdownMenu.Item asChild key={city}>
                          <button
                            onClick={() => handleManualLocationSelect(city)}
                            className="w-full text-left p-3 rounded-lg border hover:bg-blue-50 transition-colors"
                          >
                            <MapPin
                              size={16}
                              className="inline mr-2 text-gray-500"
                            />
                            {city}
                          </button>
                        </DropdownMenu.Item>
                      ))}
                    </div>
                  </div>

                  {/* Location Error */}
                  {locationError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                      <MapPin size={16} />
                      {locationError}
                    </div>
                  )}
                </div>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>

          {/* Desktop Menu */}
          {/* DESKTOP NAV */}
    <div className="hidden md:flex items-center gap-8">
      {navItems.map((item) => {
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`relative py-2 font-medium transition-all ${
              active
                ? "text-[#0C213E]"
                : "text-gray-600 hover:text-[#0C213E]"
            }`}
          >
            {item.label}

            {/* SLIDING UNDERLINE */}
            <span
              className={`absolute left-0 bottom-0 h-[2px] bg-[#0C213E] transition-all duration-300 ${
                active
                  ? "w-full"
                  : "w-0 group-hover:w-full"
              }`}
            />
          </Link>
        );
      })}


            {/* Register Dropdown */}
            {!isLoggedIn && (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="bg-[#0c213e] text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 hover:bg-[#1f2673] transition-colors">
                    <UserPlus size={18} />
                    Register
                    <ChevronDown size={16} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className="bg-white rounded-xl shadow-2xl border border-gray-100 w-56 z-[60]">
                  {registerOptions.map((opt) => (
                    <DropdownMenu.Item asChild key={opt.path}>
                      <Link
                        to={opt.path}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-[#0c213e] transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        {opt.icon}
                        {opt.label}
                      </Link>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            )}

            {/* Login Dropdown */}
            {!isLoggedIn ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="bg-green-600 text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 hover:bg-green-700 transition-colors">
                    <LogIn size={18} />
                    Login
                    <ChevronDown size={16} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className="bg-white rounded-xl shadow-2xl border border-gray-100 w-56 z-[60]">
                  {loginOptions.map((opt) => (
                    <DropdownMenu.Item asChild key={opt.path}>
                      <Link
                        to={opt.path}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        {opt.icon}
                        {opt.label}
                      </Link>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <User size={18} /> Profile
                </button>
                <button
                  onClick={() => {
                    logout();
                    Cookies.remove("patientToken");
                    navigate("/patient-login");
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Icon */}
          <button
            className="md:hidden text-gray-700 p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t shadow-lg z-40">
            <div className="flex flex-col px-6 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`py-2 transition-colors ${
                    location.pathname === item.path
                      ? "text-[#0c213e] font-semibold"
                      : "text-gray-700 hover:text-[#0c213e]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Register & Login dropdowns in mobile */}
              {!isLoggedIn && (
                <div className="mt-4">
                  <div className="text-gray-600 font-semibold mb-3">
                    Register
                  </div>
                  {registerOptions.map((opt) => (
                    <Link
                      key={opt.path}
                      to={opt.path}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 py-2 text-gray-700 hover:text-[#0c213e] transition-colors"
                    >
                      {opt.icon}
                      {opt.label}
                    </Link>
                  ))}

                  <div className="text-gray-600 font-semibold mt-6 mb-3">
                    Login
                  </div>
                  {loginOptions.map((opt) => (
                    <Link
                      key={opt.path}
                      to={opt.path}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 py-2 text-gray-700 hover:text-green-600 transition-colors"
                    >
                      {opt.icon}
                      {opt.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Logout in mobile */}
              {isLoggedIn && (
                <div className="mt-4 border-t pt-4">
                  <button
                    onClick={() => {
                      setSidebarOpen(true);
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-2 py-2 text-gray-700 hover:text-[#0c213e] transition-colors"
                  >
                    <User size={18} /> Profile
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      Cookies.remove("patientToken");
                      navigate("/patient-login");
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-2 py-2 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Right Sidebar */}
      <RightSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        patientId={patientId}
      />

      {/* Location Popup */}
      {showLocationPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Choose Location</h3>
              <p className="text-sm text-gray-600">
                Select your location for better experience
              </p>
            </div>
            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
              <button
                onClick={handleUseCurrentLocation}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <Navigation size={20} className="text-blue-500" />
                <span>Use Current Location</span>
                {isLocating && (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                )}
              </button>
              <div>
                <div className="text-sm font-semibold mb-3">Popular Cities</div>
                <div className="grid gap-2">
                  {popularCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleManualLocationSelect(city)}
                      className="w-full text-left p-3 rounded-lg border hover:bg-blue-50 transition-colors"
                    >
                      <MapPin size={16} className="inline mr-2 text-gray-500" />
                      {city}
                    </button>
                  ))}
                </div>
              </div>
              {locationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {locationError}
                </div>
              )}
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => setShowLocationPopup(false)}
                className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
