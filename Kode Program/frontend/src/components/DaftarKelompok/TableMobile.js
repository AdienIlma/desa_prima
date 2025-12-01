import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom"; 
import {
  faChevronLeft,
  faChevronRight,
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faCheck,
  faBan,
  faClock,
  faPenToSquare,
  faCalendarAlt,
  faMoneyBill,
  faPeopleGroup,
  faStar,
  faMagnifyingGlass 
} from "@fortawesome/free-solid-svg-icons";
import { truncateText } from "../utils/format"; 

const TableMobile = ({
  sortedData,
  page,
  rowsPerPage,
  profil,
  openStatusModal,
  openNoteModal,
  isHighlighted,
  highlightedRef,
  highlightedId,
  highlightedClassName,
  handleChangePage, 
  handleChangeRowsPerPage, 
  data
}) => {
     const renderPageNumbers = () => {
    const totalPages = Math.ceil(data.length / rowsPerPage);
    return (
      <div className="flex items-center mt-4 space-x-2">
        <button
          onClick={() => handleChangePage(0)}
          disabled={page === 0}
          className="py-1 px-3 border rounded-md bg-gray-100 hover:bg-gray-300 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faAngleDoubleLeft} />
        </button>
        <button
          onClick={() => handleChangePage(page - 1)}
          disabled={page === 0}
          className="py-1 px-3 border rounded-md bg-gray-100 hover:bg-gray-300 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <span className="px-2">
          Halaman {page + 1} dari {totalPages}
        </span>
        <button
          onClick={() => handleChangePage(page + 1)}
          disabled={page >= totalPages - 1}
          className="py-1 px-3 border rounded-md bg-gray-100 hover:bg-gray-300 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        <button
          onClick={() => handleChangePage(totalPages - 1)}
          disabled={page >= totalPages - 1}
          className="py-1 px-3 border rounded-md bg-gray-100 hover:bg-gray-300 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faAngleDoubleRight} />
        </button>
      </div>
    );
  };
  return (
    <div className="w-full px-4">
              {/* Card Grid View */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {sortedData.length > 0 ? (
                  sortedData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <div
                        id={`mobile-row-${row.id}`}
                        key={`${row.id}-${index}`}
                        ref={isHighlighted(row) ? highlightedRef : null}
                        className={`hover:bg-gray-100 relative ${
                          isHighlighted(row) ? "bg-red-100 animate-pulse" : ""
                        } ${
                          highlightedId === row.id.toString()
                            ? highlightedClassName
                            : ""
                        }`}
                      >
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-bold text-gray-800">
                              {truncateText(row.nama, 30)}
                            </h3>
                            <div>
                              {profil?.role === "Admin" ||
                              profil?.role === "Pegawai" ? (
                                <div className="flex justify-center space-x-2">
                                  <button
                                    className={`py-1 px-2 rounded-md ${
                                      row.status === "disetujui"
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-300"
                                    }`}
                                    onClick={() =>
                                      openStatusModal(row, "disetujui")
                                    }
                                  >
                                    <FontAwesomeIcon icon={faCheck} />
                                  </button>
                                  <button
                                    className={`py-1 px-2 rounded-md ${
                                      row.status === "ditolak"
                                        ? "bg-red-500 text-white"
                                        : "bg-gray-300"
                                    }`}
                                    onClick={() => openStatusModal(row, "ditolak")}
                                  >
                                    <FontAwesomeIcon icon={faBan} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-center space-x-2">
                                  {row.status === "disetujui" && (
                                    <FontAwesomeIcon
                                      icon={faCheck}
                                      className="bg-green-500 text-white p-1 rounded-full w-4 h-4 flex items-center justify-center"
                                    />
                                  )}
                                  {row.status === "ditolak" && (
                                    <FontAwesomeIcon
                                      icon={faBan}
                                      className="bg-red-500 text-white p-1 rounded-full w-4 h-4 flex items-center justify-center"
                                    />
                                  )}
                                  {row.status === "" || row.status === "pending" ? (
                                    <FontAwesomeIcon
                                      icon={faClock}
                                     className="bg-gray-500 text-white p-1 rounded-full w-4 h-4 flex items-center justify-center"
                                    />
                                  ) : null}
                                </div>
                              )}
                            </div>
                          </div>
    
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <span>{truncateText(row.alamat, 32)}</span>
                            </div>
                            <div className="flex items-center">
                              <FontAwesomeIcon
                                icon={faCalendarAlt}
                                className="mr-2 text-gray-400"
                              />
                              <span>
                                Tanggal Bentuk : {row.tanggal_pembentukan || "-"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <FontAwesomeIcon
                                icon={faMoneyBill}
                                className="mr-2 text-gray-400"
                              />
                              <span>
                                Jumlah Dana : {row.jumlah_dana_sekarang || "-"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <FontAwesomeIcon
                                icon={faPeopleGroup}
                                className="mr-2 text-gray-400"
                              />
                              <span>
                                Jumlah Anggota :{" "}
                                {row.jumlah_anggota_sekarang || "-"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <FontAwesomeIcon
                                icon={faStar}
                                className="mr-2 text-gray-400"
                              />
                              <span>Kategori : {row.kategori || "-"}</span>
                            </div>
                          </div>
    
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="flex items-center text-sm">
                              <FontAwesomeIcon
                                icon={faPenToSquare}
                                className="mr-2 text-gray-400"
                              />
                              {profil.role === "Pegawai" ? (
                                <button
                                  onClick={() => openNoteModal(row)}
                                  className="text-purple-600 hover:text-purple-800 text-sm"
                                >
                                  {row.catatan ? "Edit Catatan" : "Tambah Catatan"}
                                </button>
                              ) : (
                                <span className="text-gray-600">
                                  {truncateText(row.catatan, 60) ||
                                    "Tidak ada catatan"}
                                </span>
                              )}
                            </div>
                          </div>
    
                          <div className="mt-4 flex justify-end">
                            <Link
                              to={`/kelompok-desa/${row.id}`}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-800 hover:bg-secondary-dark focus:outline-none"
                            >
                              Lihat Detail
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-sm text-gray-500">
                    <FontAwesomeIcon
                      icon={faMagnifyingGlass}
                      className="text-gray-400 mb-3"
                      size="2x"
                    />
                    <p className="text-center max-w-md">
                      Data tidak ditemukan. Silakan coba dengan filter atau kata
                      pencarian yang berbeda.
                    </p>
                  </div>
                )}
              </div>
    
              {/* Pagination */}
              <div className="flex flex-col justify-between items-center pb-4 bg-white text-sm">
                <div>
                  Menampilkan {page * rowsPerPage + 1} -{" "}
                  {Math.min((page + 1) * rowsPerPage, sortedData.length)} dari{" "}
                  {sortedData.length} data
                </div>
                <div className="flex items-center mt-4">
                  <div>
                    <p>Tampilkan: </p>
                  </div>
                  <div>
                    <select
                      value={rowsPerPage}
                      onChange={handleChangeRowsPerPage}
                      className="mr-4 py-1 px-3 border rounded-md"
                    >
                      {[10, 25, 50].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4">{renderPageNumbers()}</div>
              </div>
            </div>
  );
};

export default TableMobile;