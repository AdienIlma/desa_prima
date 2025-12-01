import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faUser,
  faCaretDown,
  faCaretUp,
  faTimes,
  faFileAlt,
  faSignOutAlt,
  faHome,
  faList,
  faMapLocation,
} from "@fortawesome/free-solid-svg-icons";
import { CSSTransition } from "react-transition-group";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useUserData from "../../components/hooks/useUserData";
import { useAuth } from "../../context/AuthContext";

const BerandaHeader = () => {
  const { profil } = useUserData();
  const [isDropdownOpen, setDropdownOpen] = useState(null);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobileProfileDropdownOpen, setMobileProfileDropdownOpen] =
    useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const profileDropdownRef = useRef(null);
  const mobileProfileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleDropdownToggle = (index) => {
    setDropdownOpen(isDropdownOpen === index ? null : index);
  };

  const handleProfileDropdownToggle = (e) => {
    e.stopPropagation();
    setProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleMobileProfileDropdownToggle = (e) => {
    e.stopPropagation();
    setMobileProfileDropdownOpen(!isMobileProfileDropdownOpen);
  };

  const handleClickOutside = (event) => {
    if (
      profileDropdownRef.current &&
      !profileDropdownRef.current.contains(event.target)
    ) {
      setProfileDropdownOpen(false);
    }
    if (
      mobileProfileDropdownRef.current &&
      !mobileProfileDropdownRef.current.contains(event.target) &&
      !mobileMenuRef.current?.contains(event.target)
    ) {
      setMobileProfileDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuItems = [
    {
      name: "Beranda",
      icon: faHome,
      allowedRoles: ["Admin", "Pegawai", "Pendamping"],
      href:
        profil.role === "Pendamping"
          ? `/kabupaten-dashboard/${encodeURIComponent(
              profil.nama_kabupaten.replace(/^KAB\.\s*/i, "")
            )}`
          : "/provinsi-dashboard",
    },
    {
      name: "User",
      href: "/daftar-user",
      icon: faUser,
      allowedRoles: ["Admin"],
    },
    {
      name: "Kab/Kota",
      href: "/daftar-kabupaten",
      icon: faFileAlt,
      allowedRoles: ["Pegawai", "Admin"],
    },
    {
      name: "Kelompok Desa",
      href:
        profil.role === "Pendamping"
          ? `/daftar-kelompok?kabupaten=${profil.nama_kabupaten}`
          : "/daftar-kelompok",
      icon: faList,
      allowedRoles: ["Admin", "Pendamping", "Pegawai"],
    },
    {
      name: "Pelaporan",
      href:
        profil.role === "Pendamping"
          ? `/pelaporan?kabupaten=${profil.nama_kabupaten}`
          : "/pelaporan",
      icon: faList,
      allowedRoles: ["Admin", "Pendamping", "Pegawai"],
    },
    {
      name: "Peta Sebaran",
      href: "/peta-sebaran",
      icon: faMapLocation,
      allowedRoles: ["Pegawai", "Admin"],
    },
  ];

  const filteredMenu = menuItems.filter((item) =>
    item.allowedRoles.includes(profil.role)
  );

  const handleLogout = () => {
    const redirectPath = logout();
    navigate(redirectPath);
  };

  return (
    <>
      <header className="bg-gradient-to-r from-purple-700 to-purple-900 fixed w-full z-50 shadow-lg border-b border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex-shrink-0 flex items-center">
              <Link
                to={
                  profil.role === "Pendamping"
                    ? `/kabupaten-dashboard/${encodeURIComponent(
                        profil.nama_kabupaten.replace(/^KAB\.\s*/i, "")
                      )}`
                    : "/provinsi-dashboard"
                }
                className="flex items-center space-x-2"
              >
                <img
                  src="/images/logo_diy.png"
                  alt="logo"
                  className="h-8 w-auto"
                />
                <div className="flex flex-col">
                  <span className="text-white font-bold text-lg leading-tight">
                    DESA PRIMA
                  </span>
                  <span className="text-purple-200 text-xs">DP3AP2 DIY</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                {filteredMenu.map((menu, index) => (
                  <div key={index} className="relative group">
                    <Link
                      to={menu.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                        location.pathname === menu.href
                          ? "bg-white/25 text-white"
                          : "text-purple-100 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <FontAwesomeIcon icon={menu.icon} className="mr-2" />
                      {menu.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Dropdown */}
            <div
              className="hidden md:block ml-4 relative"
              ref={profileDropdownRef}
            >
              <button
                onClick={handleProfileDropdownToggle}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-white">
                    {profil.name}
                  </span>
                  <span className="text-xs text-purple-200">{profil.role}</span>
                </div>
                <FontAwesomeIcon
                  icon={isProfileDropdownOpen ? faCaretUp : faCaretDown}
                  className="text-white ml-1"
                />
              </button>

              <CSSTransition
                in={isProfileDropdownOpen}
                timeout={200}
                classNames="dropdown"
                unmountOnExit
              >
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Link
                      to="/profil"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={(e) => e.stopPropagation()} // Tambahkan ini
                    >
                      <FontAwesomeIcon icon={faUser} className="mr-2" />
                      Profil
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Tambahkan ini
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                      Keluar
                    </button>
                  </div>
                </div>
              </CSSTransition>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={handleMobileMenuToggle}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-white/10 focus:outline-none"
              >
                <FontAwesomeIcon
                  icon={isMobileMenuOpen ? faTimes : faBars}
                  className="h-6 w-6"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <CSSTransition
          in={isMobileMenuOpen}
          timeout={300}
          classNames="mobile-menu"
          unmountOnExit
        >
          <div
            className="md:hidden bg-gradient-to-b from-purple-700 to-purple-900 shadow-xl"
            ref={mobileMenuRef}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <div
                className="flex items-center justify-between px-3 py-3 border-b border-white/20"
                onClick={handleMobileProfileDropdownToggle}
                ref={mobileProfileDropdownRef}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                      {profil.name}
                    </span>
                    <span className="text-xs text-purple-200">
                      {profil.role}
                    </span>
                  </div>
                </div>
                <FontAwesomeIcon
                  icon={isMobileProfileDropdownOpen ? faCaretUp : faCaretDown}
                  className="text-white"
                />
              </div>

              {isMobileProfileDropdownOpen && (
                <div className="px-2 py-2 space-y-1 bg-white/5 rounded-lg">
                  <Link
                    to="/profil"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    Profil
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogout();
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                    Keluar
                  </button>
                </div>
              )}

              {filteredMenu.map((menu, index) => (
                <Link
                  key={index}
                  to={menu.href}
                  className={`px-3 py-2 rounded-md text-base font-medium flex items-center ${
                    location.pathname === menu.href
                      ? "bg-white/10 text-white"
                      : "text-purple-100 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <FontAwesomeIcon icon={menu.icon} className="mr-3" />
                  {menu.name}
                </Link>
              ))}
            </div>
          </div>
        </CSSTransition>
      </header>

      <style jsx>{`
        .dropdown-enter {
          opacity: 0;
          transform: translateY(-10px);
        }
        .dropdown-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 200ms ease-out, transform 200ms ease-out;
        }
        .dropdown-exit {
          opacity: 1;
          transform: translateY(0);
        }
        .dropdown-exit-active {
          opacity: 0;
          transform: translateY(-10px);
          transition: opacity 200ms ease-in, transform 200ms ease-in;
        }

        .mobile-menu-enter {
          max-height: 0;
          opacity: 0;
        }
        .mobile-menu-enter-active {
          max-height: 500px;
          opacity: 1;
          transition: max-height 300ms ease-out, opacity 300ms ease-out;
        }
        .mobile-menu-exit {
          max-height: 500px;
          opacity: 1;
        }
        .mobile-menu-exit-active {
          max-height: 0;
          opacity: 0;
          transition: max-height 300ms ease-in, opacity 300ms ease-in;
        }
      `}</style>
    </>
  );
};

export default BerandaHeader;
