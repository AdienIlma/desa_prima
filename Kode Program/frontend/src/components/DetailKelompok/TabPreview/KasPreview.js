import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMoneyBillWave, 
  faPlus,
  faFilter,
  faEdit,
  faTrash,
  faSearch,
  faEllipsisVertical,
  faFileExcel,
  faChevronLeft,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import { formatTanggal, formatRupiah } from "../../utils/format";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

const KasPreview = ({
  desa,
  kas,
  searchTerm,
  setSearchTerm,
  onEdit,
  onDelete,
  onAdd,
  isHighlighted,
  highlightedRef,
  hasAccess
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [openMenuId, setOpenMenuId] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [amountFilter, setAmountFilter] = useState({
    min: '',
    max: ''
  });
  const menuRef = useRef(null);

  const formatNamaFile = (item) => {
  if (!item.file) return null;
  
  const jenis = item.jenis_transaksi || 'transaksi';
  const tgl = formatTanggal(item.tgl_transaksi, 'DDMMYYYY');
  const ext = item.file.split('.').pop();
  
  return `${jenis.toLowerCase()}_${tgl}.${ext}`;
};

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const resetFilters = () => {
    setSearchTerm('');
    setDateFilter({ from: '', to: '' });
    setTypeFilter('');
    setAmountFilter({ min: '', max: '' });
    setCurrentPage(1); 
  };

  const filteredKas = kas.filter(item => {
    // Search term filter
    const matchesSearch = 
      (item.nama_transaksi?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.jenis_transaksi?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      item.total_transaksi?.toString().includes(searchTerm);
    
    // Date filter
    const itemDate = new Date(item.tgl_transaksi);
    const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
    const toDate = dateFilter.to ? new Date(dateFilter.to) : null;
    
    const matchesDate = 
      (!fromDate || itemDate >= fromDate) && 
      (!toDate || itemDate <= new Date(toDate.getTime() + 86400000)); // Add 1 day to include the end date
    
    // Type filter
    const matchesType = !typeFilter || item.jenis_transaksi === typeFilter;
    
    // Amount filter
    const amount = item.total_transaksi || 0;
    const matchesAmount = 
      (!amountFilter.min || amount >= Number(amountFilter.min)) && 
      (!amountFilter.max || amount <= Number(amountFilter.max));
    
    return matchesSearch && matchesDate && matchesType && matchesAmount;
  });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredKas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredKas.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter, typeFilter, amountFilter, itemsPerPage]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const exportToExcel = () => {
    const excelData = filteredKas.map((item, index) => ({
      No: index + 1,
      Tanggal: formatTanggal(item.tgl_transaksi),
      Jenis: item.jenis_transaksi,
      Transaksi: item.nama_transaksi,
      Jumlah: item.total_transaksi,
      'Jumlah (Rp)': formatRupiah(item.total_transaksi)
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Kas");
    
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Data_Kas_${desa}_${dateStr}.xlsx`;
    
    XLSX.writeFile(wb, fileName);
    toast.success("Data kas berhasil terunduh");
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white rounded-lg md:rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2 sm:mb-0">
          <FontAwesomeIcon
            icon={faMoneyBillWave}
            className="text-green-500 text-xl"
          />
          Manajemen Kas
        </h2>
        <div className="flex gap-2">
  <button
    onClick={exportToExcel}
    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:opacity-90 shadow-md text-sm min-w-[80px]"
    title="Unduh Excel"
  >
    <FontAwesomeIcon icon={faFileExcel} className="text-xs" />
    <span>Unduh</span>
  </button>
  {hasAccess && (
    <button
      onClick={() => onAdd("kas", desa)}
      className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:opacity-90 shadow-md text-sm min-w-[80px]"
    >
      <FontAwesomeIcon icon={faPlus} className="text-xs" />
      <span>Tambah</span>
    </button>
  )}
</div>
      </div>

      {/* Search and Filter Section */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-sm" />
            </div>
            <input
              type="text"
              placeholder="Cari transaksi..."
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter and Reset Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
            >
              <FontAwesomeIcon icon={faFilter} className="text-xs" />
              <span>Filter</span>
              {Object.values({...dateFilter, ...amountFilter, typeFilter}).some(val => val) && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  !
                </span>
              )}
            </button>
            <button
              onClick={resetFilters}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-1 gap-2">
              {/* Type Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Jenis Transaksi</label>
                <select
                  className="block w-full pl-2 pr-8 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">Semua Jenis</option>
                  <option value="Pemasukan">Pemasukan</option>
                  <option value="Pengeluaran">Pengeluaran</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Dari</label>
                  <input
                    type="date"
                    className="block w-full pl-2 pr-2 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    value={dateFilter.from}
                    onChange={(e) => setDateFilter({...dateFilter, from: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Sampai</label>
                  <input
                    type="date"
                    className="block w-full pl-2 pr-2 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    value={dateFilter.to}
                    onChange={(e) => setDateFilter({...dateFilter, to: e.target.value})}
                  />
                </div>
              </div>

              {/* Amount Range Filter */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Min</label>
                  <input
                    type="number"
                    placeholder="Minimum"
                    className="block w-full pl-2 pr-2 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    value={amountFilter.min}
                    onChange={(e) => setAmountFilter({...amountFilter, min: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Max</label>
                  <input
                    type="number"
                    placeholder="Maksimum"
                    className="block w-full pl-2 pr-2 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    value={amountFilter.max}
                    onChange={(e) => setAmountFilter({...amountFilter, max: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Items per page selector */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 px-4 py-2 bg-gray-50 border-b">
 
  <div className="flex items-center space-x-2 w-full sm:w-auto">
    <span className="text-sm text-gray-600 whitespace-nowrap">Items per page:</span>
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

  <div className="text-sm text-gray-600 text-center sm:text-right w-full sm:w-auto">
    Showing <span className="font-medium">{indexOfFirstItem + 1}</span>-
    <span className="font-medium">{Math.min(indexOfLastItem, filteredKas.length)}</span> of{' '}
    <span className="font-medium">{filteredKas.length}</span> items
  </div>
</div>

      {/* Desktop Table View */}
      <div className="pt-3 hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jenis
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaksi
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jumlah
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        File
      </th>
              {hasAccess && (
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50">
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
                  className={`hover:bg-gray-50 transition-colors ${isHighlighted(item) ? "bg-red-50" : ""}`}
                >
                  <td className={`px-3 py-4 whitespace-nowrap text-sm ${isHighlighted(item) ? "text-red-600 font-bold" : "text-gray-500"}`}>
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTanggal(item.tgl_transaksi)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.jenis_transaksi === "Pemasukan"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.jenis_transaksi}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.nama_transaksi}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={
                        item.jenis_transaksi === "Pemasukan"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {formatRupiah(item.total_transaksi)}
                    </span>
                  </td>
                   <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
            {item.file ? (
              <a 
                href={`https://backend-desa-prima-dev.student.stis.ac.id/uploads/${item.file}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
                title={item.file}
              >
                {formatNamaFile(item)}
              </a>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </td>
                  {hasAccess && (
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item, "kas");
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item, "kas");
                          }}
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
                  Tidak ada data transaksi kas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden p-2 space-y-2">
        {currentItems.length > 0 ? (
          currentItems.map((item, index) => (
            <div
              ref={isHighlighted(item) ? highlightedRef : null}
              key={item.id}
              className={`bg-white rounded-lg p-3 border border-gray-200 shadow-sm ${
                isHighlighted(item) ? "border-2 border-red-500 bg-red-50" : ""
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium text-sm truncate ${
                    isHighlighted(item) ? "text-red-600" : "text-gray-900"
                  }`}>
                    {indexOfFirstItem + index + 1}. {item.nama_transaksi}
                  </h3>
                  <div className="mt-2 space-y-2 text-sm text-gray-600">
                    <div className="flex">
                      <span className="font-medium w-16">Tanggal</span>
                      <span>: {formatTanggal(item.tgl_transaksi)}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-16">Jenis</span>
                      <span className="flex-1 min-w-0">
                        : <span className={`ml-1 px-1.5 py-0.5 rounded-full ${
                          item.jenis_transaksi === "Pemasukan"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {item.jenis_transaksi}
                        </span>
                      </span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-16">Jumlah</span>
                      <span className={
                        item.jenis_transaksi === "Pemasukan"
                          ? "text-green-600"
                          : "text-red-600"
                      }>
                        : {formatRupiah(item.total_transaksi)}
                      </span>
                    </div>
                    <div className="flex">
                <span className="font-medium w-16">File</span>
                <span className="flex-1 min-w-0">
                  : {item.file ? (
                    <a 
                      href={`https://backend-desa-prima-dev.student.stis.ac.id/uploads/${item.file}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                      title={item.file}
                    >
                      {formatNamaFile(item)}
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </span>
              </div>
                  </div>
                </div>
                {hasAccess && (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === item.id ? null : item.id);
                      }}
                      className="action-menu-button text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                      title="Aksi"
                    >
                      <FontAwesomeIcon icon={faEllipsisVertical} className="text-sm" />
                    </button>
                    
                    {/* Menu dropdown */}
                    {openMenuId === item.id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(item, "kas");
                              setOpenMenuId(null);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <FontAwesomeIcon icon={faEdit} className="mr-2 text-blue-500" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item, "kas");
                              setOpenMenuId(null);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-2 text-red-500" />
                            Hapus
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm">
            Tidak ada data transaksi kas
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredKas.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
          <div>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          </div>
          
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === number
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {number}
              </button>
            ))}
          </div>
          
          <div>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KasPreview;