import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faCalendarAlt, faClock } from "@fortawesome/free-solid-svg-icons";

dayjs.locale("id");

const Header = ({ profil }) => {
  const [time, setTime] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(dayjs());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedDate = time.format("dddd, DD MMMM YYYY");
  const formattedTime = time.format("HH:mm:ss");

  return (
    <header className="bg-gradient-to-r from-purple-700 to-purple-900 shadow-lg">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* User Profile Section */}
          <div className="flex items-center mb-6 md:mb-0">
            <div className="bg-white/20 p-3 rounded-full mr-4">
              <FontAwesomeIcon 
                icon={faUser} 
                className="text-white text-2xl" 
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Selamat datang!</h1>
              <div className="mt-1">
                <p className="text-white font-medium">{profil.name}</p>
                <p className="text-purple-100 text-sm">
                  {profil.role || "Role tidak tersedia"}
                </p>
              </div>
            </div>
          </div>

          {/* Date and Time Section */}
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Date Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <FontAwesomeIcon 
                  icon={faCalendarAlt} 
                  className="text-white text-xl" 
                />
              </div>
              <div>
                <p className="text-purple-100 text-sm">Hari & Tanggal</p>
                <p className="text-white font-medium">{formattedDate}</p>
              </div>
            </div>

            {/* Time Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <FontAwesomeIcon 
                  icon={faClock} 
                  className="text-white text-xl" 
                />
              </div>
              <div>
                <p className="text-purple-100 text-sm">Jam</p>
                <div className="flex items-end">
                  <p className="text-white font-medium text-xl tracking-wider">
                    {formattedTime}
                  </p>
                  <span className="text-purple-100 text-sm ml-2 mb-0.5">WIB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;