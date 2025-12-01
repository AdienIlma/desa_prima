import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTimes,
  faEllipsisV,
  faDownload,
  faTrash,
  faSquare,
  faSquareCheck,
  faFilePdf,
  faEdit,
  faSearch,
  faFilter,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { formatTanggal } from "../../utils/format";

const Laporan = ({
  laporan = [],
  onAdd,
  onEdit,
  onDeleteMultiple,
  onDelete,
  onSelect,
  onDownload,
  onDownloadMultiple,
  selectedItems = [],
  toggleOption,
  toggleSelectItem,
  toggleSelectAll,
  visibleOptionId,
  optionsRef = { current: {} },
  desa,
  highlightId,
  hasAccess,
}) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [filteredLaporan, setFilteredLaporan] = useState([]);

  const highlightedRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (highlightId && highlightedRef.current && isInitialLoad) {
      setTimeout(() => {
        highlightedRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setIsInitialLoad(false);
      }, 500);
    }
  }, [highlightId, laporan]);

  // Filter laporan based on search term and date range
  useEffect(() => {
    const laporanArray = Array.isArray(laporan) ? laporan : [];

    let results = laporanArray;

    // Filter by search term (nama_laporan)
    if (searchTerm) {
      results = results.filter(
        (item) =>
          item.nama_laporan &&
          item.nama_laporan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (startDate || endDate) {
      results = results.filter((item) => {
        const itemDate = new Date(item.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        const afterStart = !start || itemDate >= start;
        const beforeEnd =
          !end || itemDate <= new Date(end.setHours(23, 59, 59, 999));

        return afterStart && beforeEnd;
      });
    }

    setFilteredLaporan(results);
  }, [laporan, searchTerm, startDate, endDate]);

  const isHighlighted = (item) => {
    return highlightId && item.id.toString() === highlightId.toString();
  };

  const handleClearSelection = (e) => {
    e.stopPropagation();
    toggleSelectItem([]);
  };

  const handleSelectAll = (e) => {
    e.stopPropagation();
    toggleSelectAll();
  };

  const handleDeleteMultiple = (e) => {
    e.stopPropagation();
    onDeleteMultiple();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Search and Filter Section */}
      <div className="sticky top-0 bg-white p-2 border-b z-0">
        <div className="flex items-center mb-2">
          <div className="relative flex-grow mr-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari laporan..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="p-2 text-gray-600 hover:text-gray-800"
            onClick={() => setShowDateFilter(!showDateFilter)}
            title="Filter Tanggal"
          >
            <FontAwesomeIcon icon={faCalendarAlt} />
          </button>
        </div>

        {showDateFilter && (
          <div className="bg-gray-50 p-3 rounded-lg mb-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Filter Tanggal</h3>
              <button
                className="text-xs text-blue-500 hover:text-blue-700"
                onClick={handleClearFilters}
              >
                Reset Filter
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate || undefined}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || undefined}
                />
              </div>
            </div>
          </div>
        )}

        {/* Selected items actions */}
        {selectedItems.length > 0 && (
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center space-x-4">
              <button className="text-gray-500" onClick={handleClearSelection}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
              <span className="text-gray-500">
                {selectedItems.length} selected
              </span>
              <button className="text-gray-500" onClick={handleSelectAll}>
                <FontAwesomeIcon
                  icon={
                    selectedItems.length === laporan.length
                      ? faSquareCheck
                      : faSquare
                  }
                />
                <span className="ml-1">Select All</span>
              </button>
              <button
                className="text-gray-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadMultiple();
                }}
              >
                <FontAwesomeIcon icon={faDownload} />
              </button>
              {hasAccess && (
                <button
                  className="text-gray-500"
                  onClick={handleDeleteMultiple}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Laporan Grid */}
      <div className="flex flex-wrap justify-center md:justify-start p-2 flex-grow overflow-y-auto">
        {/* Add Laporan Button */}
        {hasAccess && (
          <button
            className="w-1/3 lg:w-1/6 border border-dashed border-gray-500 h-36 lg:h-36 lg:mr-1 mt-1 p-1 flex flex-col justify-center items-center cursor-pointer"
            onClick={() => onAdd("laporan", desa)}
          >
            <FontAwesomeIcon
              icon={faPlus}
              className="w-1/2 h-1/2 lg:w-10 text-gray-400"
            />
            <div className="w-full text-xs lg:text-sm text-center text-gray-500">
              Unggah
            </div>
          </button>
        )}

        {/* No laporan message */}
        {filteredLaporan.length === 0 && (
          <div className="w-full text-center text-gray-500 mt-3">
            {laporan.length === 0
              ? "Tidak ada laporan ditemukan"
              : "Tidak ada laporan yang sesuai dengan kriteria pencarian"}
          </div>
        )}

        {/* Laporan List */}
        {Array.isArray(filteredLaporan) &&
          filteredLaporan.map((file) => (
            <div
              ref={isHighlighted(file) ? highlightedRef : null}
              key={file.id}
              className={`relative w-2/5 lg:w-1/5 p-1 ${
                isHighlighted(file) ? "border-2 border-red-500 bg-red-50" : ""
              }`}
              onClick={() => onSelect(file)}
            >
              <div
                className={`border cursor-pointer ${
                  selectedItems.some((item) => item.id === file.id)
                    ? "border-secondary"
                    : "border-gray-400"
                }`}
              >
                <div className="h-6 bg-gray-300 flex justify-between">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectItem(file);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={
                        selectedItems.some((item) => item.id === file.id)
                          ? faSquareCheck
                          : faSquare
                      }
                      className={`${
                        selectedItems.some((item) => item.id === file.id)
                          ? "text-secondary"
                          : "text-white"
                      } h-5 w-5 lg:h-5 lg:w-5`}
                    />
                  </div>

                  <div className="relative z-100">
                    <button
                      className="text-gray-500 pr-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOption(file.id);
                      }}
                    >
                      <FontAwesomeIcon icon={faEllipsisV} />
                    </button>
                    {visibleOptionId === file.id && (
                      <div
                        ref={(el) => {
                          if (optionsRef.current) {
                            optionsRef.current[file.id] = el;
                          }
                        }}
                        className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-20 border border-gray-200"
                      >
                        <button
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              `https://backend-desa-prima-dev.student.stis.ac.id/uploads/${file.file}`,
                              "_blank"
                            );
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faDownload}
                            className="mr-2 text-gray-500"
                          />
                          Download
                        </button>
                        {hasAccess && (
                          <>
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(file, "laporan");
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faEdit}
                                className="mr-2 text-gray-500"
                              />
                              Edit
                            </button>
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(file, "laporan");
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="mr-2 text-gray-500"
                              />
                              Hapus
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-grow flex flex-col bg-white">
                  <div className="flex-grow flex items-center justify-center p-2 bg-gray-100">
                    <FontAwesomeIcon
                      icon={faFilePdf}
                      className="text-red-500 text-4xl p-3"
                    />
                  </div>
                  <div className="p-1 border-t flex-shrink-0 bg-white">
                    <h3 className="font-medium text-xs text-gray-800 text-center truncate px-1">
                      {file.nama_laporan}
                    </h3>
                    <p className="text-xs text-gray-500 text-center mt-1">
                      {formatTanggal(file.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Laporan;
