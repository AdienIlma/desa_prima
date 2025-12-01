import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEllipsisV,
  faEdit,
  faSquare,
  faDownload,
  faSquareCheck,
  faTrash,
  faTimes,
  faSearch,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import useHighlightScroll from "../../hooks/useHighlightScroll";
import { useFileHandlers } from "../hooks/useSelectionHandling";

const Produk = ({
  produk,
  profil,
  onAdd,
  onDeleteMultiple,
  onDelete,
  onSelect,
  onEdit,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [filteredProduk, setFilteredProduk] = useState(produk);
  const { highlightedRef, isHighlighted } = useHighlightScroll(
    highlightId,
    produk
  );
  const { downloadAllData } = useFileHandlers();

  const [isDownloading, setIsDownloading] = useState(false);

  // Fungsi untuk handle download lengkap
  const handleDownloadComplete = async () => {
    setIsDownloading(true);
    try {
      // Pastikan selectedItems memiliki struktur yang benar
      const itemsToDownload = selectedItems.map((item) => ({
        ...item,
        nama: item.nama,
        harga: item.harga || item.harga_awal,
        pelaku_usaha: item.pelaku_usaha || item.Anggota?.nama,
        deskripsi: item.deskripsi,
        foto: item.foto,
      }));

      await downloadAllData(itemsToDownload, "Produk");
      toast.success("Download produk berhasil!");
    } catch (error) {
      toast.error(`Gagal mendownload: ${error.message}`);
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    let results = produk;
    if (searchTerm) {
      results = results.filter(
        (item) =>
          item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.Anggota?.nama &&
            item.Anggota.nama.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (minPrice || maxPrice) {
      results = results.filter((item) => {
        const hargaAwal = item.harga_awal || 0;
        const hargaAkhir = item.harga_akhir || 0;

        const meetsMin =
          !minPrice ||
          hargaAwal >= Number(minPrice) ||
          hargaAkhir >= Number(minPrice);
        const meetsMax =
          !maxPrice ||
          hargaAwal <= Number(maxPrice) ||
          hargaAkhir <= Number(maxPrice);

        return meetsMin && meetsMax;
      });
    }

    setFilteredProduk(results);
  }, [produk, searchTerm, minPrice, maxPrice]);

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
    setMinPrice("");
    setMaxPrice("");
  };

  const isKetuaForum = profil?.role === "Ketua Forum";

  const formatHarga = (angka) => {
    return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <>
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
                placeholder="Cari produk..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="p-2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowPriceFilter(!showPriceFilter)}
              title="Filter Harga"
            >
              <FontAwesomeIcon icon={faFilter} />
            </button>
          </div>

          {showPriceFilter && (
            <div className="bg-gray-50 p-3 rounded-lg mb-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Filter Harga</h3>
                <button
                  className="text-xs text-blue-500 hover:text-blue-700"
                  onClick={handleClearFilters}
                >
                  Reset Filter
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Harga Minimal
                  </label>
                  <input
                    type="number"
                    placeholder="Rp. Min"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Harga Maksimal
                  </label>
                  <input
                    type="number"
                    placeholder="Rp. Max"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Selected items actions */}
          {selectedItems.length > 0 && (
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center space-x-4">
                <button
                  className="text-gray-500"
                  onClick={handleClearSelection}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
                <span className="text-gray-500">
                  {selectedItems.length} selected
                </span>
                <button className="text-gray-500" onClick={handleSelectAll}>
                  <FontAwesomeIcon
                    icon={
                      selectedItems.length === produk.length
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

        {/* Products Grid */}
        <div className="flex flex-wrap justify-center md:justify-start p-2 flex-grow overflow-y-auto">
          {hasAccess && (
            <button
              className="w-1/3 lg:w-1/6 border border-dashed border-gray-500 h-36 lg:h-36 lg:mr-1 mt-1 p-1 flex flex-col justify-center items-center cursor-pointer"
              onClick={() => onAdd("produk", desa)}
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

          {/* No products message */}
          {filteredProduk.length === 0 && (
            <div className="w-full text-center text-gray-500 mt-3">
              {produk.length === 0
                ? "Tidak ada produk ditemukan"
                : "Tidak ada produk yang sesuai dengan kriteria pencarian"}
            </div>
          )}

          {/* Products List */}
          {filteredProduk.map((produk) => (
            <div
              ref={isHighlighted(produk) ? highlightedRef : null}
              key={produk.id}
              className={`relative w-2/5 lg:w-1/5 p-1 ${
                isHighlighted(produk) ? "border-2 border-red-500 bg-red-50" : ""
              }`}
              onClick={() => onSelect(produk)}
            >
              <div
                className={`border cursor-pointer ${
                  selectedItems.some((item) => item.id === produk.id)
                    ? "border-secondary"
                    : "border-gray-400"
                }`}
              >
                <div className="h-6 bg-gray-300 flex justify-between">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectItem(produk);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={
                        selectedItems.some((item) => item.id === produk.id)
                          ? faSquareCheck
                          : faSquare
                      }
                      className={`${
                        selectedItems.some((item) => item.id === produk.id)
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
                          toggleOption(produk.id);
                        }}
                      >
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </button>

                      {visibleOptionId === produk.id && (
                        <div
                          ref={(el) => {
                            if (optionsRef.current) {
                              optionsRef.current[produk.id] = el;
                            }
                          }}
                          className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-20 border border-gray-200"
                        >
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            onClick={() => onEdit(produk, "produk")}
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
                              onDelete(produk, "produk");
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

                {produk.foto ? (
                  <>
                    <div className="w-full h-20 flex justify-center items-center bg-gray-100 overflow-hidden">
                      <img
                        src={`https://backend-desa-prima-dev.student.stis.ac.id${produk.foto}`}
                        alt={produk.nama}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-0.5 bg-white">
                      <h3 className="font-normal text-sm text-gray-800 text-center truncate">
                        {produk.nama}
                      </h3>
                      <p className="text-xs text-gray-500 text-center">
                        Rp. {formatHarga(produk.harga_awal)} - ....
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="h-23 border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center items-center">
                    <span className="text-gray-400 italic">No Image</span>
                    <div className="p-1 border-t w-full">
                      <h3 className="font-light text-gray-800 text-center truncate">
                        {produk.nama}
                      </h3>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Produk;
