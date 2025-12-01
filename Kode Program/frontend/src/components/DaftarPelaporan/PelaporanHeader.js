import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import PelaporanActiveFilters from "./PelaporanActiveFilters";

const PelaporanHeader = ({
  kabupaten,
  filters,
  setFilters,
  toggleFilter,
  isMobile,
  normalizeKabupaten,
  clearFilters
}) => {
  return (
    <div className="ml-0 p-2 bg-white w-full shadow-md rounded-lg">
      <div className="flex flex-col md:items-start bg-white px-2 w-full">
        <div className="border-b-2 border-grey items-start md:border-none lg:ml-3">
          <h1 className="text-lg lg:text-xl font-medium text-gray-800">
            {kabupaten
              ? `Daftar Pelaporan ${decodeURIComponent(kabupaten)}`
              : "Daftar Pelaporan"}
          </h1>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full mt-4 gap-2 lg:ml-3">
          <div className="flex w-full md:w-auto">
            <div className="relative flex-1 pr-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari pelaporan..."
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {isMobile && (
              <button
                onClick={toggleFilter}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm hover:bg-gray-300 flex items-center gap-2 justify-center"
              >
                <FontAwesomeIcon icon={faFilter} />
                {(filters.jenis.length > 0 ||
                  filters.kabupaten.length > 0 ||
                  filters.kecamatan.length > 0 ||
                  filters.kelompokDesa.length > 0) && (
                  <span className="bg-purple-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {filters.jenis.length +
                      filters.kabupaten.length +
                      filters.kecamatan.length +
                      filters.kelompokDesa.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
        <div className="w-full mt-2">
          <PelaporanActiveFilters
            filters={filters}
            setFilters={setFilters}
            formatKabupatenName={normalizeKabupaten}
            clearFilters={clearFilters}
          />
        </div>
      </div>
    </div>
  );
};

export default PelaporanHeader;