import { Outlet } from "react-router-dom";
import ClinicSidebar from "../../components/ClinicSidebar";
import { useParams } from "react-router-dom";

export const ClinicDashboard = () => {
  const { clinicId } = useParams<{ clinicId: string }>();
  console.log("Clinic ID from URL:", clinicId);

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* Sidebar */}
      <ClinicSidebar />

      {/* Main Content */}
      <main
        className="
          flex-1
          p-4 sm:p-6 md:p-8
          overflow-y-auto
          pt-[56px]           /* FIX for mobile → pushes content below mobile topbar */
          md:pt-8             /* Desktop normal padding */
          md:ml-64            /* FIX for desktop → shifts page right of sidebar */
        "
      >
        <Outlet context={{ clinicId }} />
      </main>

    </div>
  );
};
