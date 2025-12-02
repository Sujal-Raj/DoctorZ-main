import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";

export default function AdminDashboard() {
  const adminToken = localStorage.getItem("adminToken");
  console.log("Admin Token:", adminToken);
 
  if (!adminToken) {
    window.location.href = "/admin/login";
  }
  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main
        className="
          transition-all duration-300
          lg:ml-64               /* Push content right when sidebar visible */
          pt-16 lg:pt-0          /* Add top padding for mobile header */
          px-4 sm:px-6 lg:px-8   /* Consistent inner spacing */
          min-h-screen
        "
      >
        <Outlet />
      </main>
    </div>
  );
}
