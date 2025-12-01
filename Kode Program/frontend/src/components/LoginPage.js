import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Audio } from "react-loader-spinner";
import toast from "react-hot-toast";
import Login from "../page/Login";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const focusEmailInput = () => emailInputRef.current?.focus();
  const focusPasswordInput = () => passwordInputRef.current?.focus();
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { email, password } = formData;
      const result = await login(email, password);

      if (!result) {
        throw new Error("No response from login function");
      }

      if (result.success) {
        toast.success("Login berhasil");
        const from =
          location.state?.from?.pathname || getDashboardPath(result.user);
        navigate(from, { replace: true });
      } else {
        toast.error(result.error || "Login gagal");
      }
    } catch (error) {
      toast.error(error.message || "Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboardPath = (user) => {
    switch (user.role) {
      case "Admin":
      case "Pegawai":
        return "/provinsi-dashboard";
      case "Pendamping":
        if (!user.kabupatenId) {
          toast.error(
            "Akun Pendamping tidak valid: kabupatenId tidak ditemukan"
          );
          return "/unauthorized";
        }
        return `/kabupaten-dashboard/${encodeURIComponent(
          user.kabupatenName || user.kabupatenId
        )}`;
      case "Pengurus":
        if (!user.kelompokId) {
          toast.error("Akun Pengurus tidak valid: kelompokId tidak ditemukan");
          return "/unauthorized";
        }
        return `/kelompok-desa/${user.kelompokId}`;
      default:
        return "/unauthorized";
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <Audio type="Bars" color="#542d48" height={80} width={80} />
        </div>
      ) : (
        <Login>
          <div className="sm:w-full sm:max-w-sm">
            <img
              className="mx-auto h-20 w-auto"
              src="/images/logo_diy.png"
              alt="DP3AP DIY"
            />
            <h2 className="mt-5 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              SISTEM DESA PRIMA
            </h2>
            <p className="text-center text-lg">DP3AP2 DIY</p>
          </div>

          <div className="mt-5 w-full items-center">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="relative">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email
                </label>
                <div className="mt-2 relative flex items-center">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 border-r border-gray-400 pr-2"
                    onClick={focusEmailInput}
                  />
                  <input
                    id="email"
                    name="email"
                    type="text"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    ref={emailInputRef}
                    className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Password
                  </label>
                </div>
                <div className="mt-2 relative">
                  <FontAwesomeIcon
                    icon={faLock}
                    className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 border-r border-gray-400 pr-2"
                    onClick={focusPasswordInput}
                  />
                  <input
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    ref={passwordInputRef}
                    className="block w-full rounded-md border-0 py-1.5 pl-10 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                  />
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    onClick={togglePasswordVisibility}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md bg-purple-800 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                >
                  {isLoading ? "Memproses..." : "Masuk"}
                </button>
              </div>
            </form>
            <div className="text-center mt-1">
              <button
                onClick={() => navigate("/forgot-password")}
                className="font-medium text-purple-800 hover:text-purple-700"
              >
                Lupa Password?
              </button>
            </div>
          </div>
        </Login>
      )}
    </>
  );
};

export default LoginPage;
