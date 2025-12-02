import { MapPin, Mail, Phone, Facebook, Linkedin, Youtube, Instagram } from "lucide-react";

function Footer() {
  return (
   <footer className="bg-[#0c213e] text-black w-full">
  {/* Top Section */}
  <div className="container mx-auto px-6 py-12 md:py-16">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
      {/* DoctorZ Title */}
      <h2 className="text-2xl md:text-3xl font-extrabold mb-2 text-left md:text-left">
        <span
          className="
            text-transparent bg-clip-text 
            bg-white
            animate-gradient
            bg-[length:200%_200%]
          "
        >
          DoctorZ
        </span>
      </h2>

      {/* Description */}
      <p className="text-sm text-white md:text-base font-medium text-center md:text-center md:whitespace-nowrap">
        Connect with doctors, book consultations, and manage appointments easily.
      </p>

      {/* Social Icons */}
      <div className="flex justify-start md:justify-end space-x-4 mt-4 md:mt-0">
        <a href="#" className="text-white hover:text-blue-800"><Facebook size={20} /></a>
        <a href="#" className="text-white hover:text-blue-800"><Instagram size={20} /></a>
        <a href="#" className="text-white hover:text-blue-800"><Youtube size={20} /></a>
        <a href="#" className="text-white hover:text-blue-800"><Linkedin size={20} /></a>
      </div>
    </div>

    {/* Links Section */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mt-12 md:mt-16 text-sm">
      {/* About Section */}
      <div>
        <h3 className="text-md md:text-lg font-semibold text-white mb-6 border-b-3 border-white inline-block pb-1">
          About Us
        </h3>
        <ul className="space-y-2">
          <li><a href="#" className=" font-semibold text-white  hover:text-blue-900">About DoctorZ</a></li>
          <li><a href="#" className=" font-semibold text-white hover:text-blue-900">Our Team</a></li>
          <li><a href="#" className=" font-semibold text-white hover:text-blue-900">Careers</a></li>
          <li><a href="#" className=" font-semibold text-white hover:text-blue-900">News & Updates</a></li>
          <li><a href="#" className=" font-semibold text-white hover:text-blue-900">Contact Us</a></li>
        </ul>
      </div>

      {/* For Patients */}
      <div>
        <h3 className="text-md md:text-lg font-semibold text-white mb-6 border-b-3 border-white inline-block pb-1">
          For Patients
        </h3>
        <ul className="space-y-2">
          <li><a href="#" className=" font-semibold text-white hover:text-blue-900">Search for Doctors</a></li>
          <li><a href="#" className=" font-semibold text-white hover:text-blue-900">Search for Clinics</a></li>
          <li><a href="#" className=" font-semibold text-white hover:text-blue-900">Book Appointments</a></li>
          <li><a href="#" className=" font-semibold text-white hover:text-blue-900">Health Articles</a></li>
          <li><a href="#" className=" font-semibold text-white hover:text-blue-900">Download App</a></li>
        </ul>
      </div>

      {/* For Doctors */}
      <div>
        <h3 className="text-md md:text-lg font-semibold text-white mb-6 border-b-3 border-white inline-block pb-1">
          For Doctors
        </h3>
        <ul className="space-y-2">
          <li><a href="#" className="font-semibold text-white hover:text-blue-900">Join DoctorZ</a></li>
          <li><a href="#" className="font-semibold text-white hover:text-blue-900">Manage Appointments</a></li>
          <li><a href="#" className="font-semibold text-white hover:text-blue-900">DoctorZ Pro</a></li>
          <li><a href="#" className="font-semibold text-white hover:text-blue-900">For Clinics</a></li>
        </ul>
      </div>

      {/* Contact Us */}
      <div>
        <h3 className="text-md md:text-lg font-semibold text-white mb-6 border-b-3 border-white inline-block pb-1">
          Contact Us
        </h3>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start font-semibold gap-2">
            <MapPin size={28} className="text-white mt-1" />
            <span className="text-white">123 Health Street, Raipur, Chhattisgarh 492001</span>
          </li>
          <li className="flex font-semibold items-center gap-2">
            <Mail size={18} className="text-white" />
            <span className="text-white">support@doctorz.in</span>
          </li>
          <li className="flex font-semibold items-center gap-2">
            <Phone size={18} className="text-white" />
            <span className="text-white">+91 98765 43210</span>
          </li>
        </ul>
      </div>
    </div>
  </div>

  {/* Bottom Bar */}
  <div className="bg-[#0c213e] border-t-3 border-white">
    <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm px-6 py-5">
      <p className="text-white text-center md:text-left mb-2 md:mb-0">
        &copy; {new Date().getFullYear()} <span className="text-white font-semibold">DoctorZ</span> |
         All rights reserved.
      </p>
      <div className="flex flex-wrap justify-center md:justify-end items-center space-x-4 text-gray-400">
        {/* <a href="#" className="hover:text-white">Privacy Policy</a>
        <a href="#" className="hover:text-white">Terms & Conditions</a>
        <a href="#" className="hover:text-white">Sitemap</a> */}
        <span className="text-white">
          Powered by <span className="text-white font-semibold hover:text-blue-800 hover:cursor-pointer">Zager Digital Services</span>
        </span>
      </div>
    </div>
  </div>
</footer>

  );
}

export default Footer;