// App.js - Fixed Version
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import LoginPage from "./components/LoginPage";
import KelompokDetail from "./page/KelompokDetail";
import DaftarKabKota from "./page/DaftarKabKota";
import KabDashboard from "./page/KabDashboard";
import DaftarKelompokDesa from "./page/DaftarKelompokDesa";
import ProvDashboard from "./page/ProvDashboard";
import PetaSebaran from "./page/PetaSebaran";
import DaftarUser from "./page/DaftarUser";
import Profil from "./page/Profil";
import { Toaster } from "react-hot-toast";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "./App.css";
import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import DaftarPelaporan from "./page/DaftarPelaporan";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./page/Unauthorized";
import ResetPassword from "./components/ForgotPassword/ResetPassword";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";

const TitleUpdater = () => {
  const location = useLocation();

  React.useEffect(() => {
    const pathTitles = {
      "/": "Login - Desa Prima",
      "/login": "Login - Desa Prima",
      "/peta-sebaran": "Peta Sebaran - Desa Prima",
      "/provinsi-dashboard": "Dashboard Provinsi - Desa Prima",
      "/daftar-kabupaten": "Daftar Kabupaten/Kota - Desa Prima",
      "/kabupaten-dashboard/:nama_kabupaten":
        "Dashboard Kabupaten/Kota - Desa Prima",
      "/daftar-kelompok": "Daftar Kelompok - Desa Prima",
      "/daftar-kelompok/:nama_kabupaten": "Daftar Kelompok - Desa Prima",
      "/kelompok-desa/:id": "Detail Kelompok - Desa Prima",
      "/daftar-user": "Daftar User - Desa Prima",
      "/profil": "Profil - Desa Prima",
      "/pelaporan": "Pelaporan - Desa Prima",
      "/pelaporan/:nama_kabupaten": "Pelaporan - Desa Prima",
      "/forgot-password": "Lupa Password - Desa Prima",
      "/reset-password": "Reset Password - Desa Prima",
      "/reset-password/:token": "Reset Password - Desa Prima",
      "/unauthorized": "Akses Ditolak - Desa Prima",
    };

    const getTitle = (path) => {
      for (const [pattern, title] of Object.entries(pathTitles)) {
        const regex = new RegExp(`^${pattern.replace(/:\w+/g, "[^/]+")}$`);
        if (path.match(regex)) {
          return title;
        }
      }
      return "Halaman Tidak Ditemukan - Desa Prima";
    };

    document.title = getTitle(location.pathname);
  }, [location.pathname]);

  return null;
};

function App() {
  console.log("=== APP ROUTES DEBUG ===");
  console.log("Current location:", window.location.pathname);
  console.log("========================");
  return (
    <>
      <AuthProvider>
        <ColorSchemeScript />
        <MantineProvider withGlobalStyles withNormalizeCSS>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#ffff",
                color: "#363636",
                padding: "12px 12px",
                fontSize: "16px",
              },
              closeButton: true,
            }}
          />
          <Router>
            <TitleUpdater />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />

              {/* Admin, Pegawai, Pendamping Routes */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["Admin", "Pegawai", "Pendamping"]}
                  />
                }
              >
                <Route path="/provinsi-dashboard" element={<ProvDashboard />} />
                <Route path="/daftar-kabupaten" element={<DaftarKabKota />} />
                <Route
                  path="/daftar-kelompok"
                  element={<DaftarKelompokDesa />}
                />
                <Route path="/peta-sebaran" element={<PetaSebaran />} />
                <Route path="/pelaporan" element={<DaftarPelaporan />} />
              </Route>

              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["Admin", "Pegawai", "Pendamping"]}
                  />
                }
              >
                <Route
                  path="/daftar-kelompok/:nama_kabupaten"
                  element={<DaftarKelompokDesa />}
                />
                <Route
                  path="/pelaporan/:nama_kabupaten"
                  element={<DaftarPelaporan />}
                />
                <Route
                  path="/kabupaten-dashboard/:nama_kabupaten"
                  element={<KabDashboard />}
                />
              </Route>

              {/* Admin Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
                <Route path="/daftar-user" element={<DaftarUser />} />
              </Route>

              {/* Routes yang bisa diakses oleh multiple roles */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "Admin",
                      "Pegawai",
                      "Pendamping",
                      "Pengurus",
                    ]}
                  />
                }
              >
                <Route path="/kelompok-desa/:id" element={<KelompokDetail />} />
                <Route path="/profil" element={<Profil />} />
              </Route>

              {/* Catch all route */}
              <Route
                path="*"
                element={<Navigate to="/unauthorized" replace />}
              />
            </Routes>
          </Router>
        </MantineProvider>
      </AuthProvider>
    </>
  );
}

export default App;
