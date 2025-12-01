import React, { useState, useEffect } from "react";

const BerandaFooter = () => {
  const [role, setRole] = useState([]);

  useEffect(() => {
    const peran = localStorage.getItem("role");
    setRole(peran ? JSON.parse(peran) : []);
  }, []);

  return (
    <footer className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white w-full">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <img 
              src="/images/logo_diy.png" 
              alt="Logo DP3AP2 DIY" 
              className="w-12 h-14 object-contain"
            />
            <div>
              <h3 className="font-bold text-lg">DP3AP2 DIY</h3>
              <p className="text-sm text-purple-100">Dinas Pemberdayaan Perempuan dan Perlindungan Anak</p>
            </div>
          </div>
          <p className="text-sm text-purple-100">
            Copyright © 2024 | Hanya Untuk Internal Dinas
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg">Tautan</h3>
          <ul className="space-y-2">
            <li>
              <a 
                href="/kabupaten-page" 
                className="text-purple-100 hover:text-white transition-colors text-sm"
              >
                Beranda
              </a>
            </li>
            {role.includes("katim") && (
              <li>
                <a 
                  href="/monitoring-evaluasi/dashboard" 
                  className="text-purple-100 hover:text-white transition-colors text-sm"
                >
                  Dashboard
                </a>
              </li>
            )}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg">Hubungi Kami</h3>
          <address className="not-italic space-y-2">
            <p className="text-sm text-purple-100">
              Jl. Tentara Rakyat Mataram No.31<br />
              Yogyakarta
            </p>
            <p className="text-sm text-purple-100">
              (0274) 562714, (0274) 558402
            </p>
            <a 
              href="mailto:dp3ap2@jogjaprov.go.id" 
              className="text-sm text-purple-100 hover:text-white transition-colors"
            >
              dp3ap2@jogjaprov.go.id
            </a>
          </address>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg">Lokasi Kami</h3>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126489.25470985468!2d110.19763626380063!3d-7.812124770284489!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a583d27b3156b%3A0x687ba19ee706c38a!2sDP3AP2%20DIY%20(Dinas%20Pemberdayaan%20Perempuan%2C%20Perlindungan%20Anak%20dan%20Pengendalian%20Penduduk)!5e0!3m2!1sen!2sid!4v1733016757890!5m2!1sen!2sid"
              width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              className="rounded-lg"
              title="Google Maps Location"
            />
          </div>
        </div>
      </div>

      <div className="bg-indigo-950 py-4">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-purple-200 font-medium">
            Dinas Pemberdayaan Perempuan, Perlindungan Anak, dan Pengendalian Penduduk Provinsi D.I. Yogyakarta
          </p>
        </div>
      </div>
    </footer>
  );
};

export default BerandaFooter;