import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faArrowUp,
  faArrowDown,
  faEdit,
  faTrash,
  faUserAlt,
  faFileAlt,
  faEnvelopeOpen,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";

const UserTable = ({
  columns,
  sortedData,
  sortConfig,
  requestSort,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
  setItemToDelete,
  setIsDeleteModalOpen,
  isMobile,
}) => {
  const isAdminUser = (row) => row.role === "Admin";
  const renderPageNumbers = () => {
    const totalPages = Math.ceil(sortedData.length / rowsPerPage);
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

  if (isMobile) {
    return (
      <div className="w-full mt-5">
        {sortedData.length > 0 ? (
          sortedData
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="mb-4 border rounded-md p-4 bg-white"
              >
                <p className="text-sm text-gray-600 text-left font-bold">
                  {row.name}
                </p>
                <div className="flex items-center text-sm text-gray-600 mt-2">
                  <FontAwesomeIcon icon={faUserAlt} className="mr-1" />
                  <p className="text-left">{row.role}</p>
                </div>
                {row.nip && (
                  <div className="flex items-center text-sm text-gray-600 mt-2">
                    <FontAwesomeIcon icon={faFileAlt} className="mr-1" />
                    <p className="text-left">{row.nip}</p>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600 mt-2">
                  <FontAwesomeIcon icon={faEnvelopeOpen} className="mr-1" />
                  <p className="text-left">{row.email}</p>
                </div>

                <div className="flex items-center text-sm text-gray-600 mt-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                  <p className="text-left">{row.akses || "-"}</p>
                </div>

                <div className="text-sm text-gray-600 mt-3 flex justify-end space-x-3">
                  {!isAdminUser(row) && (
                    <>
                      <button
                        className="w-3/12 lg:w-2/12 text-sm lg:text-lg bg-blue-200 text-blue-600 font-semibold py-1 px-2 rounded-md shadow-sm hover:bg-blue-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        onClick={() => handleEdit(row)}
                      >
                        Edit
                      </button>
                      <button
                        className="w-3/12 lg:w-2/12 text-sm lg:text-lg bg-red-200 mr-2 text-red-600 font-semibold py-1 px-2 rounded-md shadow-sm hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        onClick={() => {
                          setItemToDelete(row);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        Hapus
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-white text-gray-600">
            <p>
              Data Tidak Ditemukan, silahkan hapus beberapa filter atau ganti
              kata pencarian
            </p>
          </div>
        )}
        <div className="flex flex-col justify-between items-center p-4 bg-white text-sm">
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
  }

  return (
    <>
      <div className="p-4 overflow-x-auto relative">
        <table className="w-full min-w-full bg-white border-collapse text-sm">
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
                        className={`ml-${column.id !== "actions" ? "6" : "0"}`}
                      >
                        {column.label}
                      </span>
                    </div>
                  </div>
                </th>
              ))}
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
                  <tr key={index} className="hover:bg-gray-100 rounded-full">
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className="py-2 px-4 border-b-8 font-light border-base whitespace-nowrap"
                      >
                        {row[column.id]?.toString() || "-"}
                      </td>
                    ))}
                    <td
                      className="py-2 px-4 text-center border-b-8 font-light border-base sticky right-0 bg-white"
                      style={{ zIndex: 1 }}
                    >
                      {!isAdminUser(row) && (
                        <>
                          <button
                            className="bg-blue-500 text-white py-1 px-2 rounded-md mr-2"
                            onClick={() => handleEdit(row)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            className="bg-red-500 text-white py-1 px-2 rounded-md"
                            onClick={() => {
                              setItemToDelete(row);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 3}
                  className="text-center py-3 px-4"
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
          {Math.min((page + 1) * rowsPerPage, sortedData.length)} dari{" "}
          {sortedData.length} data
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
    </>
  );
};

export default UserTable;
