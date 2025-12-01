import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  
  faAngleLeft, 
  faAngleUp, 
  faAngleDown,
  faFilter,
  faCalendarAlt,
  faUsers,
  faMoneyBillWave
} from "@fortawesome/free-solid-svg-icons";
import useMediaQuery from "../useMediaQuery";

const FilterSection = ({
  isFilterVisible,
  toggleFilter,
  search,
  setSearch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  desaList,
  userRole,
  formatKabupatenName,
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Fungsi untuk memfilter data berdasarkan pilihan yang sudah dipilih
  const getFilteredData = () => {
    let filtered = [...desaList];
    
    // Filter berdasarkan kategori jika ada
    if (search.kategori.length > 0) {
      filtered = filtered.filter(desa => search.kategori.includes(desa.kategori));
    }
    
    // Filter berdasarkan kabupaten jika ada
    if (search.kabupatenNama.length > 0) {
      filtered = filtered.filter(desa => search.kabupatenNama.includes(desa.kabupaten_kota));
    }
    
    return filtered;
  };

  const filteredData = getFilteredData();

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearch(prev => ({ ...prev, [name]: value }));
  };

  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  // Reset kecamatan jika kabupaten diubah
  useEffect(() => {
    if (search.kabupatenNama.length === 0) {
      setSearch(prev => ({ ...prev, kecamatanNama: [] }));
    }
  }, [search.kabupatenNama, setSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`fixed top-28 md:top-0 left-auto md:relative w-11/12 md:w-80 bg-white shadow-xl rounded-lg p-4 z-40 transform transition-all duration-300 max-h-[80vh] overflow-y-auto ${isMobile ? "translate-x-0" : "translate-x-0"}`}>
      {/* Header */}
      <div className="flex justify-between items-center pb-4">
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon icon={faFilter} className="text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filter Data</h3>
        </div>
        <button
          onClick={toggleFilter}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <FontAwesomeIcon
            icon={isFilterVisible ? faAngleLeft : faAngleLeft}
            className="text-gray-500"
          />
        </button>
      </div>

      {/* Filter Sections */}
      <div className="space-y-4">
        {/* Kategori */}
        <div className="dropdown-container">
          <button
            className="w-full flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => toggleDropdown('kategori')}
          >
            <div className="flex items-center">
        <span className="font-medium text-gray-700">Kategori</span>
        {search.kategori.length > 0 && (
          <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
            {search.kategori.length}
          </span>
        )}
      </div>
            <FontAwesomeIcon
              icon={activeDropdown === 'kategori' ? faAngleUp : faAngleDown}
              className="text-gray-500"
            />
          </button>
          {activeDropdown === 'kategori' && (
            <div className="mt-1 bg-gray-50 rounded-lg p-1">
              {["Maju", "Tumbuh", "Berkembang"].map((kategori) => {

              const isChecked = search.kategori.includes(kategori);
              return(
                <label key={kategori} className={`flex space-x-3 p-2 rounded transition-colors ${isChecked ? 'bg-indigo-50' : 'hover:bg-gray-100'}`}>
                  <input
                    type="checkbox"
                    name="kategori"
                    value={kategori}
                    checked={search.kategori.includes(kategori)}
                    onChange={(e) => {
                      const value = e.target.value;
                      const isChecked = e.target.checked;
                      setSearch((prev) => ({
                        ...prev,
                        kategori: isChecked
                          ? [...prev.kategori, value]
                          : prev.kategori.filter((item) => item !== value),
                      }));
                    }}
                    className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-gray-700">{kategori}</span>
                </label>
             );
})}
            </div>
          )}
        </div>

                {/* Kabupaten */}
{(userRole === "Pegawai" || userRole === "Admin") && (
  <div className="dropdown-container">
    <button
      className="w-full flex justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      onClick={() => toggleDropdown('kabupaten')}
    >
      <div className="flex items-center">
        <span className="font-medium text-gray-700">Kabupaten</span>
        {search.kabupatenNama.length > 0 && (
          <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
            {search.kabupatenNama.length}
          </span>
        )}
      </div>
      <FontAwesomeIcon
        icon={activeDropdown === 'kabupaten' ? faAngleUp : faAngleDown}
        className="text-gray-500"
      />
    </button>
    
    {activeDropdown === 'kabupaten' && (
      <div className="mt-1 p-1 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
  {/* Checkbox Items */}
  {Array.from(new Set(desaList.map(desa => desa.kabupaten_kota)))
    .sort((a, b) => a.localeCompare(b))
    .map(kabupaten_kota => {
      const formattedName = formatKabupatenName(kabupaten_kota);
      const isChecked = search.kabupatenNama.includes(kabupaten_kota);
      
      return (
        <label 
          key={kabupaten_kota} 
          className={`flex items-center space-x-3 p-2 rounded transition-colors ${isChecked ? 'bg-indigo-50' : 'hover:bg-gray-100'}`}
        >
          <input
            type="checkbox"
            className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
            checked={isChecked}
            onChange={() => {
              setSearch(prev => {
                const newKabupatenNama = isChecked
                  ? prev.kabupatenNama.filter(k => k !== kabupaten_kota)
                  : [...prev.kabupatenNama, kabupaten_kota];
                
                return {
                  ...prev,
                  kabupatenNama: newKabupatenNama,
                  kecamatanNama: [] // Reset kecamatan
                };
              });
            }}
          />
          <span className={`text-left w-full text-gray-700 ${isChecked ? 'font-medium' : ''}`}>
            {formattedName}
          </span>
        </label>
      );
    })}
</div>
    )}
  </div>
)}

        {/* Kecamatan */}
        <div className="dropdown-container">
          <button
            className="w-full flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => toggleDropdown('kecamatan')}
          >
            <span className="font-medium text-gray-700">Kecamatan</span>
            {search.kecamatanNama.length > 0 && (
          <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
            {search.kecamatanNama.length}
          </span>
        )}
            <FontAwesomeIcon
              icon={activeDropdown === 'kecamatan' ? faAngleUp : faAngleDown}
              className="text-gray-500"
            />
          </button>
          {activeDropdown === 'kecamatan' && (
            <div className="mt-1 p-1 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
              {filteredData
                .filter(desa => 
                  search.kabupatenNama.length === 0 || 
                  search.kabupatenNama.includes(desa.kabupaten_kota)
                )
                .map((desa) => desa.kecamatanNama)
                .filter((value, index, self) => self.indexOf(value) === index)
                .map((kecamatan) => {
                  const isChecked = search.kecamatanNama.includes(kecamatan);
                  return(
                  <label key={kecamatan} className={`flex space-x-3 p-2 rounded transition-colors ${isChecked ? 'bg-indigo-50' : 'hover:bg-gray-100'}`}>
                    <input
                      type="checkbox"
                      name="kecamatanNama"
                      value={kecamatan}
                      checked={search.kecamatanNama.includes(kecamatan)}
                      onChange={(e) => {
                        const value = e.target.value;
                        const isChecked = e.target.checked;
                        setSearch((prev) => ({
                          ...prev,
                          kecamatanNama: isChecked
                            ? [...prev.kecamatanNama, value]
                            : prev.kecamatanNama.filter((item) => item !== value),
                        }));
                      }}
                      className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">{kecamatan}</span>
                  </label>
                  );
})}
            </div>
          )}
        </div>

        {/* Tanggal */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-indigo-600" />
            <span className="font-medium text-gray-700">Tanggal Bentuk</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex flex-col">
              <label className="text-left text-sm text-gray-500 mb-1">Dari</label>
              <input
                type="date"
                name="startDate"
                value={startDate}
                onChange={handleStartDateChange}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-left text-sm text-gray-500 mb-1">Sampai</label>
              <input
                type="date"
                name="endDate"
                value={endDate}
                onChange={handleEndDateChange}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Jumlah Anggota */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faUsers} className="text-indigo-600" />
            <span className="font-medium text-gray-700">Jumlah Anggota</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="text-sm text-gray-500 mb-1">Dari</label>
              <input
                type="number"
                name="anggotaDari"
                value={search.anggotaDari}
                onChange={handleSearchChange}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-500 mb-1">Sampai</label>
              <input
                type="number"
                name="anggotaSampai"
                value={search.anggotaSampai}
                onChange={handleSearchChange}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Jumlah Dana */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faMoneyBillWave} className="text-indigo-600" />
            <span className="font-medium text-gray-700">Jumlah Dana</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex flex-col">
              <label className="text-left text-sm text-gray-500 mb-1">Dari</label>
              <input
                type="number"
                name="danaDari"
                value={search.danaDari}
                onChange={handleSearchChange}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-left text-sm text-gray-500 mb-1">Sampai</label>
              <input
                type="number"
                name="danaSampai"
                value={search.danaSampai}
                onChange={handleSearchChange}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;