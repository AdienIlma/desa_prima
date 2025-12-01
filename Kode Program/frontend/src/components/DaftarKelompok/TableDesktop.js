import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom"; 
import {
  faChevronLeft,
  faChevronRight,
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faArrowUp,
  faArrowDown,
  faCheck,
  faBan,
  faClock,
  faPenToSquare
} from "@fortawesome/free-solid-svg-icons";
import { truncateText } from "../utils/format"; // Import the utility function

const TableDesktop = ({
  columns,
  sortedData,
  page,
  rowsPerPage,
  sortConfig,
  requestSort,
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
    const pageNumbers = [];
    const maxPageNumbers = 4;

    if (totalPages <= maxPageNumbers) {
      for (let i = 0; i < totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(0, page - 2);
      let endPage = Math.min(totalPages - 1, page + 2);

      if (page <= 2) {
        endPage = maxPageNumbers - 1;
      } else if (page >= totalPages - 3) {
        startPage = totalPages - maxPageNumbers;
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return (
      <>
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
        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => handleChangePage(pageNumber)}
            className={`py-1 px-3 border rounded-md ${
              page === pageNumber
                ? "bg-secondary text-white"
                : "bg-gray-100 hover:bg-gray-300"
            }`}
          >
            {pageNumber + 1}
          </button>
        ))}
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
      </>
    );
  };
  return (
     <div>
              <div className="overflow-x-auto relative">
                <table className="min-w-full bg-white border-collapse text-sm">
                  <thead className="bg-white">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column.id}
                          className="text-center py-3 px-4 font-semibold border-b-8 border-base cursor-pointer whitespace-nowrap relative"
                          onClick={() => {
                            if (column.id !== "actions") requestSort(column.id);
                          }}
                        >
                          <div className="flex items-center justify-start">
                            {column.id !== "actions" && (
                              <FontAwesomeIcon
                                icon={
                                  sortConfig.key === column.id
                                    ? sortConfig.direction === "ascending"
                                      ? faArrowUp
                                      : faArrowDown
                                    : faArrowUp
                                }
                                className={`absolute left-4 ${
                                  sortConfig.key === column.id
                                    ? "text-black"
                                    : "text-gray-400"
                                }`}
                              />
                            )}
                            <div className="ml-4">
                              <span
                                className={`ml-${
                                  column.id !== "actions" ? "6" : "0"
                                }`}
                              >
                                {column.label}
                              </span>
                            </div>
                          </div>
                        </th>
                      ))}
                      <th className="py-3 px-4 font-semibold border-b-8 border-base text-center">
                        Catatan
                      </th>
                      <th
                        className="py-3 px-4 font-semibold border-b-8 border-base bg-white text-center sticky right-20 z-10"
                        style={{ zIndex: 1 }}
                      >
                        Status
                      </th>
                      <th
                        className="py-3 px-4 font-semibold border-b-8 border-base text-center sticky right-0 bg-white"
                        style={{ zIndex: 1 }}
                      >
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.length > 0 ? (
                      sortedData
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row, index) => (
                          <tr
                            id={`row-${row.id}`}
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
                            {columns.map((column) => {
                              const alignment =
                                column.id === "nama" || column.id === "alamat"
                                  ? "text-left"
                                  : "text-center";
    
                              return (
                                <td
                                  key={column.id}
                                  className={`py-2 px-4 border-b-8 font-light border-base whitespace-nowrap ${alignment}`}
                                >
                                  {truncateText(
                                    row[column.id]?.toString() || "",
                                    30
                                  )}
                                </td>
                              );
                            })}
    
                            <td className="py-2 px-4 text-center border-b-8 font-light border-base whitespace-nowrap">
                              {profil?.role === "Admin" ||
                              profil?.role === "Pegawai" ? (
                                <button
                                  onClick={() => openNoteModal(row)}
                                  className="text-purple-600 hover:text-purple-800 text-sm"
                                >
                                  {row.catatan ? "Edit Catatan" : "Tambah Catatan"}
                                </button>
                              ) : (
                                <div className="py-2 px-4 text-center font-light">
                                  {row.catatan || "Tidak ada catatan"}
                                </div>
                              )}
                            </td>
    
                            <td
                              className="py-2 px-4 text-center border-b-8 font-light border-base bg-white sticky right-20 z-10"
                              style={{ zIndex: 1 }}
                            >
                              {profil.role === "Pegawai" ||
                              profil.role === "Admin" ? (
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
  {(row.status === "" || row.status === "pending") && (
    <FontAwesomeIcon
      icon={faClock}
      className="bg-gray-300 text-gray-600 p-2 rounded-full w-4 h-4 flex items-center justify-center"
    />
  )}
</div>
                              )}
                            </td>
    
                            <td
                              className="py-2 px-4 text-center border-b-8 font-light border-base sticky right-0 bg-white"
                              style={{ zIndex: 1 }}
                            >
                              <Link to={`/kelompok-desa/${row.id}`}>
                                <button className="bg-purple-700 text-white py-1 px-2 rounded-md">
                                  Detail
                                </button>
                              </Link>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td
                          colSpan={columns.length + 3}
                          className="text-center py-5 px-4"
                        >
                          Data Tidak Ditemukan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
    
              <div className="flex justify-between items-center p-4 bg-white text-sm">
                <div>
                  Menampilkan {page * rowsPerPage + 1} -{" "}
                  {Math.min((page + 1) * rowsPerPage, data.length)} dari{" "}
                  {data.length} data
                </div>
                <div className="flex items-center">
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
                  {renderPageNumbers()}
                </div>
              </div>
            </div>
  );
};

export default TableDesktop;