import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserTie,
  faFileExcel,
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import ModalPreviewExcel from "../../Modal/ModalPreviewExcel";
import toast from "react-hot-toast";
import { handleExcelUploadAnggota } from "../../utils/excelUtils";
import { previewExcelAnggota } from "../../utils/excelUtils";

const AnggotaPreview = ({
  desa,
  profil,
  anggota,
  searchTerm,
  setSearchTerm,
  onEdit,
  onDelete,
  onAdd,
  isHighlighted,
  highlightedRef,
  fetchAnggota,
  hasAccess,
}) => {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter anggota based on search term
  const filteredAnggota = anggota.filter(
    (member) =>
      member.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.sertifikasi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAnggota.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAnggota.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const [previewData, setPreviewData] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const VALID_JAWABAN = ["ketua", "sekretaris", "bendahara", "anggota"];
  const VALID_SERTIFIKASI = ["", "NIB", "PIRT", "Halal", "BPOM"];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validExtensions = [".xlsx", ".xls"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!validExtensions.includes(`.${fileExtension}`)) {
      toast.error("Hanya file Excel (.xlsx, .xls) yang diizinkan");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    try {
      setIsLoading(true);
      const preview = await previewExcelAnggota(file);

      const validationErrors = [];
      preview.data.forEach((row, index) => {
        const rowNumber = index + 2;

        if (
          !row.Jabatan ||
          !VALID_JAWABAN.includes(row.Jabatan.toLowerCase())
        ) {
          validationErrors.push(
            `Baris ${rowNumber}: Jabatan "${
              row.Jabatan
            }" tidak valid. Harus salah satu dari: ${VALID_JAWABAN.join(", ")}`
          );
        } else {
          row.Jabatan = row.Jabatan.toLowerCase();
        }

        if (row.Nohp && !/^\d+$/.test(row.Nohp)) {
          validationErrors.push(
            `Baris ${rowNumber}: Nomor HP harus berupa angka`
          );
        }

        if (row.Sertifikasi && !VALID_SERTIFIKASI.includes(row.Sertifikasi)) {
          validationErrors.push(
            `Baris ${rowNumber}: Sertifikasi "${
              row.Sertifikasi
            }" tidak valid. Harus salah satu dari: ${VALID_SERTIFIKASI.filter(
              (s) => s
            ).join(", ")}`
          );
        }
      });

      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join("\n"));
      }

      setPreviewData({
        ...preview,
        columns: preview.columns || ["Nama", "Jabatan", "Nohp", "Sertifikasi"],
        data: preview.data || [],
      });
      setShowPreviewModal(true);
    } catch (error) {
      toast.error(error.message || "Gagal memproses file");
      e.target.value = "";
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmUpload = async () => {
    try {
      setIsLoading(true);
      setShowPreviewModal(false);
      const fileInput = document.getElementById("excel-upload");
      const file = fileInput.files[0];

      if (!file) return;

      setUploadProgress(0);

      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      };

      await handleExcelUploadAnggota(file, desa.id, fetchAnggota, config);
      toast.success("Data anggota berhasil diunggah");
    } catch (error) {
      toast.error(error.message || "Gagal mengupload file");
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
      const fileInput = document.getElementById("excel-upload");
      fileInput.value = "";
    }
  };

  const handleDownloadData = async () => {
    try {
      setIsLoading(true);

      // Tambahkan timestamp untuk menghindari cache
      const timestamp = new Date().getTime();
      const downloadUrl = `https://backend-desa-prima-dev.student.stis.ac.id/komponen-anggota/${desa.id}/anggota/download?timestamp=${timestamp}`;

      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        credentials: "include",
      });

      // Handle response error
      if (!response.ok) {
        // Baca response sebagai text biasa
        const errorText = await response.text();

        // Tampilkan pesan error langsung ke user
        throw new Error(errorText || "Gagal mengunduh data");
      }

      // Periksa content type
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("spreadsheet")) {
        throw new Error("Format file tidak valid");
      }

      // Proses download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Data_Anggota_${desa.nama.replace(/\s+/g, "_")}.xlsx`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Data anggota berhasil diunduh");
    } catch (error) {
      console.error("Download error:", error);

      // Tampilkan pesan error langsung
      toast.error(error.message || "Gagal mengunduh data anggota");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header dan tombol aksi */}
      <div className="flex flex-col items-start gap-4 p-1">
        {/* Judul */}
        <h2 className="px-2 text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FontAwesomeIcon
            icon={faUserTie}
            className="text-purple-400 text-2xl"
          />
          Daftar Anggota
        </h2>

        {/* Container untuk tombol-tombol */}
        <div className="flex flex-wrap justify-start gap-2 w-full">
          {/* Tombol Tambah */}
          {hasAccess && (
            <button
              onClick={() => onAdd("anggota", desa)}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:opacity-90 shadow-md min-w-[120px]"
            >
              <FontAwesomeIcon icon={faPlus} className="text-sm" />
              <span className="text-sm whitespace-nowrap">Tambah</span>
            </button>
          )}

          {/* Tombol Unggah */}
          {hasAccess && (
            <label
              htmlFor="excel-upload"
              className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 shadow-md min-w-[120px] cursor-pointer"
            >
              <FontAwesomeIcon icon={faFileExcel} className="text-sm" />
              <span className="text-sm whitespace-nowrap">Unggah</span>
              <input
                id="excel-upload"
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          )}

          {/* Tombol Unduh */}
          <button
            onClick={handleDownloadData}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 shadow-md min-w-[120px]"
          >
            <FontAwesomeIcon icon={faFileExcel} className="text-sm" />
            <span className="text-sm whitespace-nowrap">Unduh Data</span>
          </button>
        </div>
      </div>

      {/* Search input */}
      <div className="p-3 border-b border-gray-200 bg-white">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari anggota..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Items per page selector */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 px-4 py-2 bg-gray-50 border-b">
        {/* Items per page selector - akan berada di atas di mobile */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-sm text-gray-600 whitespace-nowrap">
            Items per page:
          </span>
          <select
            className="border rounded px-2 py-1 text-sm w-full sm:w-auto"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[5, 10, 15, 20].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Page info - akan berada di bawah di mobile */}
        <div className="text-sm text-gray-600 text-center sm:text-right w-full sm:w-auto">
          Showing <span className="font-medium">{indexOfFirstItem + 1}</span>-
          <span className="font-medium">
            {Math.min(indexOfLastItem, filteredAnggota.length)}
          </span>{" "}
          of <span className="font-medium">{filteredAnggota.length}</span> items
        </div>
      </div>

      {/* Tabel dan daftar anggota */}
      <div className="py-3">
        {filteredAnggota ? (
          <>
            <div
              className="hidden md:block overflow-auto"
              style={{ maxHeight: "calc(100vh - 220px)" }}
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="sticky top-0 z-10 bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      No
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Nama
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Jabatan
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      No HP
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Sertifikasi
                    </th>
                    {hasAccess && (
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50"
                      >
                        Aksi
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((item, index) => (
                      <tr
                        ref={isHighlighted(item) ? highlightedRef : null}
                        key={item.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          isHighlighted(item) ? "bg-red-50" : ""
                        }`}
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.nama}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {item.jabatan}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {item.nohp}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {item.sertifikasi || "Tidak Ada"}
                        </td>
                        {hasAccess && (
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium sticky right-0 bg-white">
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => onEdit(item, "anggota")}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                                title="Edit"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                onClick={(e) => onDelete(item, "anggota")}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                                title="Hapus"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={hasAccess ? 6 : 5}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        Data anggota tidak ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Tampilan mobile */}
            <div
              className="md:hidden overflow-auto"
              style={{ maxHeight: "calc(100vh - 220px)" }}
            >
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <div
                    ref={isHighlighted(item) ? highlightedRef : null}
                    key={item.id}
                    className={`bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow mb-2 ${
                      isHighlighted(item)
                        ? "border-2 border-red-500 bg-red-50"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3
                          className={`font-medium ${
                            isHighlighted(item)
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {indexOfFirstItem + index + 1}. {item.nama}
                        </h3>
                        <div className="mt-1 space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="font-medium w-20">Jabatan</span>
                            <span>: {item.jabatan}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium w-20">No HP</span>
                            <span>: {item.nohp}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium w-20">
                              Sertifikasi
                            </span>
                            <span>: {item.sertifikasi || "Tidak Ada"}</span>
                          </div>
                        </div>
                      </div>
                      {hasAccess && (
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(item, "anggota");
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100 transition-colors"
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item, "anggota");
                            }}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors"
                            title="Hapus"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Data anggota tidak ditemukan
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Tidak ada data anggota
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredAnggota.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Tombol Previous */}
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-full ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            {/* Nomor Halaman */}
            <div className="flex-1 flex justify-center">
              <div className="flex space-x-1 overflow-x-auto py-1 max-w-full">
                {(() => {
                  const maxVisiblePages = 5;
                  const pages = [];

                  if (totalPages <= maxVisiblePages) {
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    const half = Math.floor(maxVisiblePages / 2);
                    let start = Math.max(1, currentPage - half);
                    let end = Math.min(totalPages, start + maxVisiblePages - 1);

                    if (end - start < maxVisiblePages - 1) {
                      start = Math.max(1, end - maxVisiblePages + 1);
                    }

                    if (start > 1) pages.push(1);
                    if (start > 2) pages.push("...");

                    for (let i = start; i <= end; i++) {
                      pages.push(i);
                    }

                    if (end < totalPages - 1) pages.push("...");
                    if (end < totalPages) pages.push(totalPages);
                  }

                  return pages.map((page, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        typeof page === "number" ? paginate(page) : null
                      }
                      disabled={page === "..."}
                      className={`min-w-[2.5rem] h-10 rounded-md flex items-center justify-center mx-1 ${
                        currentPage === page
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      } ${
                        page === "..." ? "bg-transparent cursor-default" : ""
                      }`}
                    >
                      {page}
                    </button>
                  ));
                })()}
              </div>
            </div>

            {/* Tombol Next */}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-full ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      )}

      {/* Modal Preview Excel */}
      <ModalPreviewExcel
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          const fileInput = document.getElementById("excel-upload");
          if (fileInput) fileInput.value = "";
        }}
        previewData={previewData}
        onConfirmUpload={handleConfirmUpload}
        isLoading={isLoading}
      />

      {/* Progress Bar */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded shadow-lg border border-gray-200 w-64">
          <p className="text-sm font-medium mb-1">Mengupload data...</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-right mt-1">{uploadProgress}%</p>
        </div>
      )}
    </div>
  );
};

export default AnggotaPreview;
