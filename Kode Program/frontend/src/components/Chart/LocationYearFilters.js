const LocationYearFilters = ({
  filters,
  filterOptions,
  isSingleKabupaten,
  isSingleKecamatan,
  onFilterChange,
  className = '',
  size = 'md' 
}) => {
  const sizes = {
    sm: {
      label: 'text-xs',
      select: 'text-xs p-1',
      container: 'gap-2'
    },
    md: {
      label: 'text-sm',
      select: 'text-sm p-2',
      container: 'gap-3'
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 ${sizes[size].container} ${className}`}>
      <div>
        <label className={`block ${sizes[size].label} font-medium text-gray-700 mb-1`}>
          Kabupaten/Kota
        </label>
        <select
          value={filters.kabupaten_kota}
          onChange={(e) => onFilterChange("kabupaten_kota", e.target.value)}
          className={`w-full border border-gray-300 rounded ${sizes[size].select}`}
          disabled={isSingleKabupaten}
        >
          {filterOptions.kabupaten_kota.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className={`block ${sizes[size].label} font-medium text-gray-700 mb-1`}>
          Kecamatan
        </label>
        <select
          value={filters.kecamatan}
          onChange={(e) => onFilterChange("kecamatan", e.target.value)}
          className={`w-full border border-gray-300 rounded ${sizes[size].select}`}
          disabled={isSingleKecamatan}
        >
          {filterOptions.kecamatan.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className={`block ${sizes[size].label} font-medium text-gray-700 mb-1`}>
          Tahun
        </label>
        <select
          value={filters.tahun}
          onChange={(e) => onFilterChange("tahun", e.target.value)}
          className={`w-full border border-gray-300 rounded ${sizes[size].select}`}
        >
          {filterOptions.tahun.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LocationYearFilters;