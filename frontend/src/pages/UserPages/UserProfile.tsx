import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../Services/mainApi";
// import Swal from "sweetalert2";
// import userIcon from "../../assets/UserIcon.png";
import { Mail, Phone, MapPin, CreditCard, User, Calendar, Users } from "lucide-react";
import toast from "react-hot-toast";

// Strong Types
interface Address {
  city?: string;
  pincode?: number;
}

interface EmergencyContact {
  name?: string;
  number?: number;
}

export interface User {
  fullName: string;
  gender: string;
  dob: string;
  email: string;
  mobileNumber: number;
  aadhar: number;
  address: Address;
  abhaId?: string;
  emergencyContact: EmergencyContact;
  profilePhoto: string;
}

interface UserResponse {
  message: string;
  user: User;
}

const fields: {
  key:
    | keyof User
    | "address.city"
    | "address.pincode"
    | "emergencyContact.name"
    | "emergencyContact.number";
  label: string;
  icon?: any;
}[] = [
  { key: "fullName", label: "Full Name", icon: User },
  { key: "gender", label: "Gender", icon: Users },
  { key: "dob", label: "Date of Birth", icon: Calendar },
  { key: "email", label: "Email", icon: Mail },
  { key: "mobileNumber", label: "Mobile Number", icon: Phone },
  { key: "aadhar", label: "Aadhar Number", icon: CreditCard },
  { key: "address.city", label: "City", icon: MapPin },
  { key: "address.pincode", label: "Pincode", icon: MapPin },
  { key: "abhaId", label: "ABHA ID", icon: CreditCard },
  { key: "emergencyContact.name", label: "Emergency Contact Name", icon: User },
  { key: "emergencyContact.number", label: "Emergency Contact Number", icon: Phone },
];

// ✅ Type Safe value extractor
const getValue = (obj: any, path: string): string | number => {
  return (
    path
      .split(".")
      .reduce(
        (acc, key) => (acc && acc[key] !== undefined ? acc[key] : ""),
        obj
      ) || ""
  );
};

function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<User | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // const [isDark] = useState(false);

  const { id } = useParams();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get<UserResponse>(`/api/patient/${id}`);
        const fetchedUser = res.data.user;
        console.log(fetchedUser);

        // Check if address/emergencyContact are strings, then parse
        if (typeof fetchedUser.address === "string") {
          try {
            fetchedUser.address = JSON.parse(fetchedUser.address);
          } catch (err) {
            console.log(err);

            fetchedUser.address = { city: "", pincode: 0 };
          }
        }

        if (typeof fetchedUser.emergencyContact === "string") {
          try {
            fetchedUser.emergencyContact = JSON.parse(
              fetchedUser.emergencyContact
            );
          } catch (err) {
            console.log(err);
            fetchedUser.emergencyContact = { name: "", number: 0 };
          }
        }

        setUser(fetchedUser);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUser();
  }, [userId, id]);

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (!editData) return;

  //   const { name, value } = e.currentTarget;

  //   if (name.startsWith("address.")) {
  //     const key = name.split(".")[1] as keyof Address;
  //     setEditData({
  //       ...editData,
  //       address: {
  //         ...editData.address,
  //         [key]: key === "pincode" ? Number(value) : value,
  //       },
  //     });
  //   } else if (name.startsWith("emergencyContact.")) {
  //     const key = name.split(".")[1] as keyof EmergencyContact;
  //     setEditData({
  //       ...editData,
  //       emergencyContact: {
  //         ...editData.emergencyContact,
  //         [key]: key === "number" ? Number(value) : value,
  //       },
  //     });
  //   } else {
  //     const key = name as keyof User;
  //     const finalValue =
  //       key === "mobileNumber" || key === "aadhar" ? Number(value) : value;

  //     setEditData({
  //       ...editData,
  //       [key]: finalValue,
  //     });
  //   }
  // };

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {
  if (!editData) return;

  const target = e.currentTarget;
  const { name, value } = target;

  if (!name) return; // safety guard

  if (name.startsWith("address.")) {
    const key = name.split(".")[1] as keyof Address;

    setEditData({
      ...editData,
      address: {
        ...editData.address,
        [key]: key === "pincode" ? Number(value) : value,
      },
    });

  } else if (name.startsWith("emergencyContact.")) {
    const key = name.split(".")[1] as keyof EmergencyContact;

    setEditData({
      ...editData,
      emergencyContact: {
        ...editData.emergencyContact,
        [key]: key === "number" ? Number(value) : value,
      },
    });

  } else {
    const key = name as keyof User;
    const finalValue =
      key === "mobileNumber" || key === "aadhar" ? Number(value) : value;

    setEditData({
      ...editData,
      [key]: finalValue,
    });
  }
};


  const handleSave = async () => {
    try {
      const formData = new FormData();

      if (selectedFile) {
        formData.append("profilePhoto", selectedFile);
      }

      // Add other fields
      if (editData) {
        Object.entries(editData).forEach(([key, value]) => {
          if (typeof value !== "object") formData.append(key, String(value));
        });
        // Nested objects
        formData.append("address", JSON.stringify(editData.address));
        formData.append(
          "emergencyContact",
          JSON.stringify(editData.emergencyContact)
        );
      }

      const res = await api.put<UserResponse>(
        `/api/patient/update/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const updatedUser = res.data.user;

      // Parse nested objects
      if (typeof updatedUser.address === "string") {
        try {
          updatedUser.address = JSON.parse(updatedUser.address);
        } catch {
          updatedUser.address = { city: "", pincode: 0 };
        }
      }

      if (typeof updatedUser.emergencyContact === "string") {
        try {
          updatedUser.emergencyContact = JSON.parse(
            updatedUser.emergencyContact
          );
        } catch {
          updatedUser.emergencyContact = { name: "", number: 0 };
        }
      }

     toast.success("Profile updated successfully");
      setUser(updatedUser);
      setIsEditing(false);
      setSelectedFile(null);
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#0c213e] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-500">User Not Found.</div>
      </div>
    );

  return (
  <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="max-w-3xl mx-auto">
        {/* Edit Profile Button */}
        {!isEditing && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => {
                if (user) {
                  setEditData({
                    ...user,
                    address: user.address || { city: "", pincode: 0 },
                    emergencyContact: user.emergencyContact || {
                      name: "",
                      number: 0,
                    },
                  });
                  setIsEditing(true);
                }
              }}
              className="bg-[#0c213e] text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Edit Profile
            </button>
          </div>
        )}

        {/* PERSONAL INFORMATION CARD */}
        <div className={`bg-white rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-300`}>
          <div className="flex items-center justify-between mb-6 sm:mb-8 pb-4 border-b-2 border-gray-200 border-opacity-20">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0c213e]">
              Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {fields.map(({ key, label, icon: Icon }) => {
              const value = isEditing
                ? getValue(editData!, key)
                : getValue(user!, key);

              return (
                <div
                  key={key}
                  className={`bg-gray-50 rounded-xl p-4 transition-all duration-300 hover:shadow-md`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {Icon && <Icon className="w-4 h-4 text-gray-500" />}
                    <span className="text-xs sm:text-sm font-medium text-gray-500">
                      {label}
                    </span>
                  </div>

                  {isEditing ? (
                    <input
                      type={
                        key === "dob"
                          ? "date"
                          : key === "address.pincode" ||
                            key === "emergencyContact.number" ||
                            key === "mobileNumber" ||
                            key === "aadhar"
                          ? "number"
                          : "text"
                      }
                      name={key}
                      value={
                        key === "dob"
                          ? new Date(String(value)).toISOString().split("T")[0]
                          : value ?? ""
                      }
                      onChange={handleChange}
                      className="w-full py-2 px-3 rounded-lg bg-white text-[#0c213e] border-gray-300 focus:border-[#0c213e] border-2 focus:outline-none transition-colors text-sm sm:text-base"
                    />
                  ) : (
                    <div className="py-2 text-sm sm:text-base font-semibold text-[#0c213e] break-words">
                      {key === "dob"
                        ? new Date(String(value)).toLocaleDateString("en-GB")
                        : value || "-"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 border-t-2 border-gray-200 border-opacity-20">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 text-white py-3 sm:py-4 rounded-xl font-semibold shadow-lg hover:bg-green-700 hover:shadow-xl transition-all duration-300"
              >
                Save Changes
              </button>

              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedFile(null);
                }}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-3 sm:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

}

export default UserProfile;