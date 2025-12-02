import React from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import RegisterPatient from "./pages/RegisterPages/RegisterPatient";
import RegisterDoctor from "./pages/RegisterPages/RegisterDoctor";
import RegisterClinic from "./pages/RegisterPages/RegisterClinic";
import { AuthProvider } from "../src/Context/AuthContext"; // <-- adjust path as needed

import LoginClinic from "./pages/LoginPages/LoginClinic";
import Layout from "../Layout";
import Home from "./pages/Home";
import AllClinic from "./pages/AllClinic";
// import AllDoctors from "./pages/AllDoctors";
import ViewDoctorProfile from "./pages/ViewDoctorProfile";

// Clinic

import AddDoctor from "./pages/AddDoctor";
import TimeSlots from "./pages/TimeSlots";
import DoctorLogin from "./pages/DoctorPages/DoctorLogin";
import DoctorDashboard from "./pages/DoctorPages/DoctorDashboard";
import DoctorProfile from "./pages/DoctorPages/DoctorProfile";
import ClinicProfile from "./pages/ClinicPages/ClinicProfile";
import LoginPatient from "./pages/LoginPages/LoginPatient";
import AllPatient from "./pages/AllPatient";

import RegisterLab from "./pages/RegisterPages/RegisterLab";
import LoginLab from "./pages/LoginPages/LoginLab";

import AllLabTest from "./pages/AllLabTest";
import LabTestDetails from "./pages/LabPages/LabTestDetails";
import Patients from "./pages/LabPages/LabPatients";
import LabTests from "./pages/LabPages/LabTests";
import LabProfile from "./pages/LabPages/LabProfile";
import LabDashboard from "./pages/LabPages/LabDashboard";
// import AppointmentForm from "./pages/AppointmentForm";
// import DoctorAppointments from "./pages/DoctorAppointments";
// import AllClinicPatients from "./pages/AllClinicPatients";
// import DoctorHomeDashboard from "./pages/DoctorHomeDashboard";
// import ClinicHomeDashboard from "./pages/ClinicHomeDashboard";
// import ClinicDoctorProfile from "./pages/ClinicDoctorProfile";
import AdminDashboard from "./pages/AdminPages/AdminDashboard";
import EditDoctorProfile from "./components/EditDoctorProfile";
import AdminDoctor from "./pages/AdminPages/AdminDoctor";
import AdminClinic from "./pages/AdminPages/AdminClinic";
import AdminLogin from "./pages/AdminPages/AdminLogin";

// import Navbar from "./components/Navbar";
// import { ToastContainer } from "react-toastify";
import ClinicHomeDashboard from "./pages/ClinicPages/ClinicHomeDashboard";
import ClinicDoctorProfile from "./pages/ClinicPages/ClinicDoctorProfile";
import AllClinicPatients from "./pages/AllClinicPatients";
import ClinicDetails from "./pages/ClinicPages/ClinicDetails";
import DoctorDashboardHome from "./pages/DoctorPages/DoctorHomeDashboard";

import { PackageDetails } from "./pages/PackageDetails";
import AdminLab from "./pages/AdminPages/AdminLab";
import ClinicDoctors from "./pages/ClinicPages/ClinicDoctors";
import { ClinicDashboard } from "./pages/ClinicPages/ClinicDashboard";
import UserProfile from "./pages/UserPages/UserProfile";
import UserDashboard from "./pages/UserPages/UserDashboard";
import AddEmr from "./pages/UserPages/AddEmr";
// import DoctorChat from "./pages/DoctorPages/DoctorChat";
// import PatientChat from "./pages/PatientChat";
import DoctorAppointments from "./pages/DoctorPages/DoctorAppointments";
import PatientAppointments from "./pages/UserPages/PatientAppointments";
import DoctorSearchResults from "./pages/DoctorSearchResults";
import PatientEMR from "./pages/PatientEMR";
import PrescriptionForm from "./pages/DoctorPages/PrescriptionForm";
import DoctorNotifications from "./pages/DoctorPages/DoctorNotifications";
// import ClinicDoctorCard from "./pages/ClinicPages/ClinicDoctorCard";
import UserPrescription from "./pages/UserPages/UserPrescription";
import PatientChat from "./pages/PatientChat";
import DoctorChat from "./pages/DoctorPages/DoctorChat";
import LabTestInUser from "./pages/UserPages/LabTestInUser";
// Admin


import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />{" "}
      <ToastContainer
       position="top-right"
        
      />
      {/* <-- Wrap the app here */}
      <Router>
        <Routes>
          {/* Layout route that conditionally shows Navbar */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/patient-register" element={<RegisterPatient />} />
            <Route path="/doctor-register" element={<RegisterDoctor />} />
            <Route path="/clinic-register" element={<RegisterClinic />} />
            <Route path="/all-clinics" element={<AllClinic />} />
            {/* <Route path="/all-doctors" element={<AllDoctors />} /> */}
            <Route path="/search-results" element={<DoctorSearchResults />} />
            <Route path="/clinic-login" element={<LoginClinic />} />
            <Route path="/patient-login" element={<LoginPatient />} />
            <Route path="/patient-chat" element={<PatientChat />} />
            <Route path="/doctor-chat/:roomId" element={<DoctorChat />} />
            <Route path="/doctor-login" element={<DoctorLogin />} />
            <Route path="/clinic/:id" element={<ClinicDetails />} />

            <Route
              path="/view-doctor-profile/:drId"
              element={<ViewDoctorProfile />}
            />
            <Route path="/lab-register" element={<RegisterLab />} />
            <Route path="/lab-login" element={<LoginLab />} />
            <Route path="/admin-lab" element={<AdminLab />} />
            <Route path="/all-lab-test" element={<AllLabTest />} />
            <Route path="/lab-test-details/:id" element={<LabTestDetails />} />
            <Route
              path="/lab-package-details/:packageId"
              element={<PackageDetails />}
            />
            <Route path="/user-dashboard/:id" element={<UserDashboard />}>
              <Route index element={<UserProfile />} />
              <Route path="user-profile" element={<UserProfile />} />
              <Route path="add-emr" element={<AddEmr />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="prescription" element={<UserPrescription />} />
              <Route path="lab-test/:id" element={<LabTestInUser />}/>
            </Route>
          </Route>

          {/* Routes without navbar */}

          <Route
            path="/clinicDashboard/:clinicId"
            element={<ClinicDashboard />}
          >
            <Route index element={<ClinicHomeDashboard />} />
            <Route
              path="clinic-home-dashboard"
              element={<ClinicHomeDashboard />}
            />

            <Route path="clinic-profile" element={<ClinicProfile />} />
            <Route path="doctorProfile" element={<DoctorProfile />} />
            <Route
              path="all-clinic-doctors/:drId/availability"
              element={<TimeSlots />}
            />
            <Route path="add-doctor" element={<AddDoctor />} />
            <Route path="all-clinic-doctors" element={<ClinicDoctors />} />
            <Route
              path="all-clinic-doctors/clinic-doctor-profile/:drId"
              element={<ClinicDoctorProfile />}
            />

            <Route path="all-clinic-patients" element={<AllClinicPatients />} />
            {/* <Route path="clinic-doctor-card" element={<ClinicDoctorCard />} /> */}
          </Route>

          {/* Doctor Dashboard */}
          <Route path="/doctordashboard/:drId" element={<DoctorDashboard />}>
            <Route index element={<DoctorAppointments />} />
            <Route
              path="doctor-home-dashboard"
              element={<DoctorDashboardHome />}
            />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route
              path="appointments/addPrescription/:bookingId/:patientAadhar"
              element={<PrescriptionForm />}
            />
            <Route path="time-slots" element={<TimeSlots />} />
            <Route path="patients" element={<AllPatient />} />
            <Route path="patientEMR/:aadhar" element={<PatientEMR />} />
            <Route
              path="editDoctorIdPassword"
              element={<EditDoctorProfile />}
            />
            <Route path="doctorProfile" element={<DoctorProfile />} />
            <Route path="notifications" element={<DoctorNotifications />} />
          </Route>

          {/* Admin Dashboard */}
          <Route path="/adminDashboard" element={<AdminDashboard />}>
          <Route index element={<AdminLab/>} />
            <Route path="admin-lab" element={<AdminLab />} />
            <Route path="admin-doctor" element={<AdminDoctor />} />

            <Route path="admin-clinic" element={<AdminClinic />} />
          </Route>

          <Route path="/lab-dashboard" element={<LabDashboard />}>
            {" "}
            <Route
              index
              element={
                <h1 className="text-2xl font-bold">Welcome to Dashboard</h1>
              }
            />
            <Route path="patients" element={<Patients />} />
            <Route path="tests" element={<LabTests />} />
            <Route path="profile" element={<LabProfile />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />}></Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
