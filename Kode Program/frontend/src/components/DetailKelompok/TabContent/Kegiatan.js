import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTimes,
  faEllipsisV,
  faTrash,
  faSquare,
  faSquareCheck,
  faEdit,
  faDownload,
  faSearch,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import useHighlightScroll from "../../hooks/useHighlightScroll";
import { useFileHandlers } from "../hooks/useSelectionHandling";

const Kegiatan = ({
  kegiatan,
  onAdd,
  onDeleteMultiple,
  onDelete,
  onSelect,
  onEdit,
  selectedItems = [],
  toggleOption,
  toggleSelectItem,
  toggleSelectAll,
  visibleOptionId,
  highlightId,
  optionsRef = { current: {} },
  desa,
  hasAccess,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [filteredKegiatan, setFilteredKegiatan] = useState(kegiatan);
  const { highlightedRef, isHighlighted } = useHighlightScroll(
    highlightId,
    kegiatan
  );

  const { downloadAllData } = useFileHandlers();

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadComplete = async () => {
    setIsDownloading(true);
    try {
      const itemsToDownload = selectedItems.map((item) => ({
        // Data dasar
        id: item.id,
        nama_kegiatan: item.nama_kegiatan || "-",
        tanggal: item.tanggal || "-",
        uraian: item.uraian || "-",
        lokasi: item.lokasi || "-",
        peserta: item.peserta || "-",

        // File dan dokumen
        file_materi: item.file_materi || null,
        file_notulensi: item.file_notulensi || null,

        // Foto kegiatan
        FotoKegiatan:
          item.FotoKegiatan?.map((foto) => ({
            id: foto.id,
            gambar: foto.gambar,
          })) || [],
      }));

      await downloadAllData(itemsToDownload, "Kegiatan");
      toast.success("Download data kegiatan berhasil!");
    } catch (error) {
      toast.error(`Gagal mendownload: ${error.message}`);
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Filter kegiatan based on search term and date range
  useEffect(() => {
    let results = kegiatan;

    // Filter by search term (nama_kegiatan)
    if (searchTerm) {
      results = results.filter((item) =>
        item.nama_kegiatan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (startDate || endDate) {
      results = results.filter((item) => {
        const itemDate = new Date(item.tanggal);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        const afterStart = !start || itemDate >= start;
        const beforeEnd =
          !end || itemDate <= new Date(end.setHours(23, 59, 59, 999));

        return afterStart && beforeEnd;
      });
    }

    setFilteredKegiatan(results);
  }, [kegiatan, searchTerm, startDate, endDate]);

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

  // Fungsi untuk mendapatkan foto utama (dengan ID terkecil)
  const getMainPhoto = (fotoKegiatan) => {
    if (!fotoKegiatan || fotoKegiatan.length === 0) return null;
    const sorted = [...fotoKegiatan].sort((a, b) => a.id - b.id);
    return sorted[0].gambar;
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
              placeholder="Cari kegiatan..."
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
                    selectedItems.length === kegiatan.length
                      ? faSquareCheck
                      : faSquare
                  }
                />
                <span className="ml-1">Select All</span>
              </button>
              <button
                className="text-gray-500"
                onClick={handleDownloadComplete}
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

      {/* Kegiatan Grid */}
      <div className="flex flex-wrap justify-center md:justify-start p-2 flex-grow overflow-y-auto">
        {/* Tombol Unggah */}
        {hasAccess && (
          <button
            className="w-1/3 lg:w-1/6 border border-dashed border-gray-500 h-36 lg:h-36 lg:mr-1 mt-1 p-1 flex flex-col justify-center items-center cursor-pointer"
            onClick={() => onAdd("kegiatan", desa)}
          >
            <FontAwesomeIcon
              icon={faPlus}
              className="w-1/2 h-1/2 lg:w-10 lg:h-10 text-gray-400"
            />
            <div className="w-full text-xs lg:text-sm text-center text-gray-500">
              Unggah
            </div>
          </button>
        )}

        {/* Pesan jika tidak ada file */}
        {filteredKegiatan.length === 0 && (
          <div className="w-full text-center text-gray-500 mt-3">
            {kegiatan.length === 0
              ? "Tidak ada kegiatan ditemukan"
              : "Tidak ada kegiatan yang sesuai dengan kriteria pencarian"}
          </div>
        )}

        {/* Daftar Kegiatan */}
        {filteredKegiatan.map((kegiatanItem) => {
          const mainPhoto = getMainPhoto(kegiatanItem.FotoKegiatan);

          return (
            <div
              ref={isHighlighted(kegiatanItem) ? highlightedRef : null}
              key={kegiatanItem.id}
              className={`relative w-2/5 lg:w-1/5 p-1 ${
                isHighlighted(kegiatanItem)
                  ? "border-2 border-red-500 bg-red-50"
                  : ""
              }`}
            >
              <div
                className={`border cursor-pointer ${
                  selectedItems.some((item) => item.id === kegiatanItem.id)
                    ? "border-secondary"
                    : "border-gray-400"
                }`}
                onClick={() => onSelect(kegiatanItem)}
              >
                {/* Header dengan checkbox dan options */}
                <div className="h-6 bg-gray-300 flex justify-between">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectItem(kegiatanItem);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={
                        selectedItems.some(
                          (item) => item.id === kegiatanItem.id
                        )
                          ? faSquareCheck
                          : faSquare
                      }
                      className={`${
                        selectedItems.some(
                          (item) => item.id === kegiatanItem.id
                        )
                          ? "text-secondary"
                          : "text-white"
                      } h-5 w-5 lg:h-5 lg:w-5`}
                    />
                  </div>

                  {hasAccess && (
                    <div className="relative z-100">
                      <button
                        className="text-gray-500 pr-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOption(kegiatanItem.id);
                        }}
                      >
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </button>
                      {visibleOptionId === kegiatanItem.id && (
                        <div
                          ref={(el) => {
                            if (optionsRef.current) {
                              optionsRef.current[kegiatanItem.id] = el;
                            }
                          }}
                          className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-20 border border-gray-200"
                        >
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(kegiatanItem, "kegiatan");
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
                              onDelete(kegiatanItem, "kegiatan");
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="mr-2 text-gray-500"
                            />
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Foto Kegiatan */}
                <div className="w-full h-20 flex justify-center items-center bg-gray-100 overflow-hidden">
                  {mainPhoto ? (
                    <img
                      src={`https://backend-desa-prima-dev.student.stis.ac.id/uploads/${mainPhoto}`}
                      alt={`Kegiatan ${kegiatanItem.id}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-500 italic text-sm">No Photo</div>
                  )}
                </div>

                {/* Nama Kegiatan */}
                <div className="p-0.5 bg-white">
                  <p className="text-sm font-medium text-center truncate">
                    {kegiatanItem.nama_kegiatan}
                  </p>
                  <p className="text-xs text-gray-500 text-center">
                    {new Date(kegiatanItem.tanggal).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Kegiatan;
