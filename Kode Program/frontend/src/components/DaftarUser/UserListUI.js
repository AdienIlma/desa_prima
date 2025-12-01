import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileExcel,
  faFileArrowDown,
  faMagnifyingGlass,
  faFilter,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { Audio } from "react-loader-spinner";
import UserTable from "./UserTable";

const UserListUI = ({
  // Props untuk data dan state
  columns,
  loading,
  filteredUsers,
  sortedData,
  search,
  roleFilters,
  kabupatenFilters,
  availableRoles,
  availableKabupatens,
  showFilters,
  isMobile,
  page,
  rowsPerPage,
  sortConfig,
  previewData,
  showPreviewModal,
  isUploading,
  
  // Props untuk handlers
  setSearch,
  toggleRoleFilter,
  toggleKabupatenFilter,
  clearAllFilters,
  setShowFilters,
  requestSort,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
  setItemToDelete,
  setIsDeleteModalOpen,
  handleFileUpload,
  handleExportExcel,
  handleConfirmUpload,
  onClosePreviewModal,
  onOpenAddUserModal,
}) => {
  return (
    <div className="p-4 sm:p-7">
      <div className={`ml-0 p-3 bg-white w-full shadow-md rounded-lg`}>
        <div className="flex flex-col md:items-start bg-white p-3 w-full">
          {/* Header */}
          <div className="border-b-2 border-grey items-start md:border-none pb-2 md:pb-0 lg:ml-3">
            <h1 className="text-lg lg:text-xl font-medium text-gray-800">
              Daftar User
            </h1>
          </div>

          {/* Action Buttons and Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full mt-4 gap-2 lg:ml-3">
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {/* Tambah User Button */}
              <button
                onClick={onOpenAddUserModal}
                className="bg-purple-700 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-500 flex-1 md:flex-none"
              >
                Tambah User
              </button>

              {/* Unggah Excel Button */}
              <label className="bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-500 cursor-pointer flex items-center gap-2 flex-1 md:flex-none">
                {isUploading ? (
                  <>
                    <Audio height={20} width={20} color="white" /> Mengunggah...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faFileExcel} />
                    Unggah Excel
                  </>
                )}
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>

              {/* Unduh Excel Button */}
              <button
                onClick={handleExportExcel}
                disabled={isUploading}
                className="bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-500 flex items-center gap-2 flex-1 md:flex-none"
              >
                {isUploading ? (
                  <>
                    <Audio height={20} width={20} color="white" /> Mengunduh...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faFileArrowDown} />
                    Unduh Excel
                  </>
                )}
              </button>
            </div>

            {/* Search and Filter Section */}
            <div className="flex flex-col md:flex-row w-full md:w-auto gap-2 mt-2 lg:mt-0 lg:pr-8">
              <div className="flex flex-row w-full gap-2">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon
                      icon={faMagnifyingGlass}
                      className="text-gray-400"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari user..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Filter Button - Mobile */}
                {isMobile && (
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm hover:bg-gray-300 flex items-center gap-2 justify-center w-auto"
                  >
                    <FontAwesomeIcon icon={faFilter} />
                    {(roleFilters.length > 0 || kabupatenFilters.length > 0) && (
                      <span className="bg-purple-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {roleFilters.length + kabupatenFilters.length}
                      </span>
                    )}
                  </button>
                )}
              </div>

              {/* Filter Button - Desktop */}
              {!isMobile && (
                <div className="relative">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-gray-200 text-gray-800 py-3 px-4 rounded-md text-sm hover:bg-gray-300 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faFilter} />
                    {(roleFilters.length > 0 || kabupatenFilters.length > 0) && (
                      <span className="bg-purple-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {roleFilters.length + kabupatenFilters.length}
                      </span>
                    )}
                  </button>

                  {/* Filter Dropdown - Desktop */}
                  {showFilters && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 p-4 border border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium">Filter</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={clearAllFilters}
                            className="text-xs text-purple-700 hover:text-purple-900"
                          >
                            Clear All
                          </button>
                          <button
                            onClick={() => setShowFilters(false)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Role</h4>
                        <div className="space-y-2">
                          {availableRoles.map((role) => (
                            <label
                              key={role}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={roleFilters.includes(role)}
                                onChange={() => toggleRoleFilter(role)}
                                className="rounded text-purple-700"
                              />
                              <span className="text-sm">{role}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Kabupaten</h4>
                        <div className="space-y-2">
                          {availableKabupatens.map((kabupaten) => (
                            <label
                              key={kabupaten}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={kabupatenFilters.includes(kabupaten)}
                                onChange={() => toggleKabupatenFilter(kabupaten)}
                                className="rounded text-purple-700"
                              />
                              <span className="text-sm">{kabupaten}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Filter Panel */}
          {isMobile && showFilters && (
            <div className="w-full mt-3 bg-white p-4 rounded-md shadow-md border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Filter</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-purple-700 hover:text-purple-900"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Role</h4>
                <div className="grid grid-cols-2 gap-2">
                  {availableRoles.map((role) => (
                    <label key={role} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={roleFilters.includes(role)}
                        onChange={() => toggleRoleFilter(role)}
                        className="rounded text-purple-700"
                      />
                      <span className="text-sm">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Kabupaten</h4>
                <div className="grid gap-2">
                  {availableKabupatens.map((kabupaten) => (
                    <label
                      key={kabupaten}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={kabupatenFilters.includes(kabupaten)}
                        onChange={() => toggleKabupatenFilter(kabupaten)}
                        className="rounded text-purple-700"
                      />
                      <span className="text-sm">{kabupaten}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* User Table */}
          <div className="w-full overflow-x-auto mt-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Audio type="Bars" color="#542d48" height={80} width={80} />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="pt-5 text-center text-lg text-gray-500">
                Tidak ada data user.
              </p>
            ) : (
              <UserTable
                columns={columns}
                sortedData={sortedData}
                sortConfig={sortConfig}
                requestSort={requestSort}
                page={page}
                rowsPerPage={rowsPerPage}
                handleChangePage={handleChangePage}
                handleChangeRowsPerPage={handleChangeRowsPerPage}
                handleEdit={handleEdit}
                setItemToDelete={setItemToDelete}
                setIsDeleteModalOpen={setIsDeleteModalOpen}
                isMobile={isMobile}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserListUI;