import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faLock } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { Audio } from "react-loader-spinner";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useUserData from "./hooks/useUserData";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("profile");
  const { profil, loading, error } = useUserData();
  const [profileData, setProfileData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [errorMessages, setErrorMessages] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi validasi yang lebih komprehensif
  const validateForm = () => {
    const errors = {
      oldPassword: !profileData.oldPassword ? "Password lama harus diisi" : "",
      newPassword: validatePassword(profileData.newPassword),
      confirmNewPassword:
        profileData.confirmNewPassword !== profileData.newPassword
          ? "Konfirmasi password tidak cocok"
          : "",
    };
    setErrorMessages(errors);
    return !Object.values(errors).some((error) => error !== "");
  };

  const validatePassword = (password) => {
    if (!password) return "Password baru harus diisi";
    if (password.length < 8) return "Minimal 8 karakter";
    if (!/[A-Z]/.test(password)) return "Harus ada huruf kapital";
    if (!/\d/.test(password)) return "Harus ada angka";
    return "";
  };

  // Fungsi untuk mengubah password
  const handlePasswordChange = async () => {
    if (!validateForm()) {
      toast.error("Harap perbaiki error sebelum submit");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `https://backend-desa-prima-dev.student.stis.ac.id/users/password`,
        {
          current_password: profileData.oldPassword,
          new_password: profileData.newPassword,
          new_password_confirmation: profileData.confirmNewPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setProfileData({
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      } else {
        toast.error(response.data.error || "Gagal mengubah password");
      }
    } catch (error) {
      console.error("Password change error details:", {
        response: error.response,
        request: error.request,
        message: error.message,
      });

      let errorMsg = "Gagal mengubah password. Silakan coba lagi.";

      if (error.response) {
        errorMsg = error.response.data.error || errorMsg;
      } else if (error.request) {
        errorMsg = "Tidak ada respon dari server";
      }

      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const renderPasswordField = (field, label) => (
    <div className="mb-4 relative">
      <label className="block mb-1 text-sm">{label}</label>
      <div className="relative">
        <FontAwesomeIcon
          icon={faLock}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <input
          type={showPasswords[field] ? "text" : "password"}
          className={`w-full p-2 pl-10 pr-10 border ${
            errorMessages[field] ? "border-red-500" : "border-gray-300"
          } rounded`}
          value={profileData[field]}
          onChange={(e) => {
            setProfileData({ ...profileData, [field]: e.target.value });
            // Validasi real-time
            if (field === "newPassword") {
              setErrorMessages({
                ...errorMessages,
                newPassword: validatePassword(e.target.value),
                confirmNewPassword:
                  profileData.confirmNewPassword &&
                  e.target.value !== profileData.confirmNewPassword
                    ? "Konfirmasi password tidak cocok"
                    : "",
              });
            } else if (field === "confirmNewPassword") {
              setErrorMessages({
                ...errorMessages,
                confirmNewPassword:
                  e.target.value !== profileData.newPassword
                    ? "Konfirmasi password tidak cocok"
                    : "",
              });
            }
          }}
        />
        <FontAwesomeIcon
          icon={showPasswords[field] ? faEyeSlash : faEye}
          onClick={() => togglePasswordVisibility(field)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
        />
      </div>
      {errorMessages[field] && (
        <p className="text-red-500 text-xs mt-1">{errorMessages[field]}</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Audio type="Bars" color="#542d48" height={80} width={80} />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-xl text-red-500">{error}</div>;
  }

  return (
    <>
      <div className="bg-white w-[90%] mb-12 md:w-full md:max-w-3xl mx-auto mt-6 p-5 rounded-lg shadow-lg">
        <div className="mt-5">
          <div className="flex border-b">
            <button
              className={`w-1/2 py-2 focus:outline-none ${
                selectedTab === "profile"
                  ? "border-b-2 border-secondary text-secondary"
                  : "text-gray-400"
              }`}
              onClick={() => setSelectedTab("profile")}
            >
              Detail Profil
            </button>
            <button
              className={`w-1/2 py-2 focus:outline-none ${
                selectedTab === "password"
                  ? "border-b-2 border-secondary text-secondary"
                  : "text-gray-400"
              }`}
              onClick={() => setSelectedTab("password")}
            >
              Ganti Password
            </button>
          </div>

          <div className="mt-6 flex flex-col md:flex-row items-start">
            {/* Tab Profil */}
            <div
              className={`w-full md:w-7/12 ${
                selectedTab === "password"
                  ? "opacity-30 pointer-events-none"
                  : ""
              }`}
            >
              <div className="flex-col w-full md:pr-4">
                <div className="flex mb-4">
                  <div className="w-1/5 text-sm pt-2 font-semibold text-gray-500 text-left">
                    NIP
                  </div>
                  <div className="bg-gray-100 text-sm p-2 rounded flex-grow">
                    {profil?.nip || "-"}
                  </div>
                </div>
                <div className="flex mb-4">
                  <div className="w-1/5 text-sm pt-2 font-semibold text-gray-500 text-left">
                    Email
                  </div>
                  <div className="bg-gray-100 text-sm p-2 rounded flex-grow">
                    {profil?.email}
                  </div>
                </div>
                <div className="flex mb-4">
                  <div className="w-1/5 text-sm pt-2 font-semibold text-gray-500 text-left">
                    Nama
                  </div>
                  <div className="bg-gray-100 text-sm p-2 rounded flex-grow">
                    {profil?.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Password */}
            <div
              className={`w-full md:w-1/2 md:ml-4 ${
                selectedTab === "profile"
                  ? "opacity-30 pointer-events-none"
                  : ""
              }`}
            >
              {renderPasswordField("oldPassword", "Password Lama")}
              {renderPasswordField("newPassword", "Password Baru")}
              {renderPasswordField(
                "confirmNewPassword",
                "Konfirmasi Password Baru"
              )}

              <button
                className={`w-full bg-secondary text-white p-2 rounded text-sm ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
                onClick={handlePasswordChange}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Memproses..." : "Ubah Password"}
              </button>
            </div>
          </div>
        </div>
        <style jsx>{`
          @media (max-width: 768px) {
            .opacity-30 {
              display: none;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default ProfilePage;
