import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faFilter,
  faFileExcel,
  faFileExport,
} from "@fortawesome/free-solid-svg-icons";
import { Audio } from "react-loader-spinner";
import toast from "react-hot-toast";
import { exportDesaToExcel } from "../utils/excelUtils";

const SearchSection = ({
  search,
  profil,
  setSearch,
  toggleFilter,
  kabupatenName,
  userRole,
  setIsModalOpen,
  handleFileUpload,
  isUploading,
  filteredDesa,
}) => {
 const [localKeyword, setLocalKeyword] = useState(search.keyword || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(prev => ({
        ...prev,
        keyword: localKeyword ? localKeyword.toLowerCase().trim() : ""
      }));
    }, 300);
    
    return () => clearTimeout(timer);
  }, [localKeyword, setSearch]);

  const handleExport = async () => {
    try {
      await exportDesaToExcel(filteredDesa);
      toast.success("Kelompok berhasil diunduh", {
        position: "top-right",
        duration: 3000,
      });
    } catch (error) {
      toast.error("Gagal mengunduh data", {
        position: "top-right",
        duration: 3000,
      });
      console.error("Export error:", error);
    }
  };

  return (
    <>
      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center">
            <Audio type="Bars" color="#542d48" height={80} width={80} />
            <p className="mt-4 text-lg font-semibold">
              Sedang mengunggah file...
            </p>
          </div>
        </div>
      )}

      <div className="bg-white px-6 py-5 w-full rounded-lg shadow-sm">
        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            {userRole === "Ketua Forum"
              ? `Daftar Kelompok Desa - ${kabupatenName}`
              : "Daftar Kelompok Desa"}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-2">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {/* Excel Upload Button - hanya untuk Pendamping */}
            {profil && profil.role === "Pendamping" && (
              <label className="bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-500 cursor-pointer flex items-center gap-2 flex-1 md:flex-none">
                <FontAwesomeIcon icon={faFileExcel} />
                Upload Excel
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            )}

            <button
              onClick={handleExport}
              className="bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-500 flex items-center justify-center gap-2 min-w-[120px] h-[40px]"
              disabled={isUploading}
            >
              <FontAwesomeIcon icon={faFileExport} />
              <span>Unduh Excel</span>
            </button>

            {profil && profil.role === "Pendamping" && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-purple-700 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-500 flex-1 md:flex-none"
                disabled={isUploading}
              >
                Tambah Kelompok
              </button>
            )}
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="text-gray-400"
                />
              </div>
              <input
                type="text"
                placeholder="Cari kelompok desa..."
                value={localKeyword}
                onChange={(e) => setLocalKeyword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isUploading}
              />
            </div>

            <button
              onClick={toggleFilter}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              aria-label="Filter"
              disabled={isUploading}
            >
              <FontAwesomeIcon icon={faFilter} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="text-gray-400"
                />
              </div>
              <input
                type="text"
                placeholder="Cari kelompok desa..."
                value={localKeyword}
                onChange={(e) => setLocalKeyword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isUploading}
              />
            </div>

            <button
              onClick={toggleFilter}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              aria-label="Filter"
              disabled={isUploading}
            >
              <FontAwesomeIcon icon={faFilter} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchSection;