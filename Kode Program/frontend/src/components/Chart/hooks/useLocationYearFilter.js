import { useState, useEffect, useCallback } from 'react';

export const useLocationYearFilters = (data, idField = 'id', dateField = 'tgl_lapor') => {
  const [isSingleKabupaten, setIsSingleKabupaten] = useState(false);
  const [isSingleKecamatan, setIsSingleKecamatan] = useState(false);
  
  const [filters, setFilters] = useState({
    kabupaten_kota: "Semua",
    kecamatan: "Semua",
    tahun: "Semua",
  });

  const [filterOptions, setFilterOptions] = useState({
    kabupaten_kota: [],
    kecamatan: [],
    tahun: [],
  });

  const getKecamatanByKabupaten = useCallback((kabupaten_kota) => {
    if (!data || data.length === 0) return ["Semua"];
    
    let filteredData = data.filter(item => {
      if (!item[idField] || !item[dateField]) return false;
      
      if (filters.tahun !== "Semua") {
        const date = new Date(item[dateField]);
        const itemYear = date.getFullYear().toString();
        if (itemYear !== filters.tahun) return false;
      }
      
      if (kabupaten_kota !== "Semua" && item.kabupaten_kota !== kabupaten_kota) {
        return false;
      }
      
      return true;
    });
    
    const kecamatanList = [...new Set(filteredData.map(item => item.kecamatan).filter(Boolean))];
    return kecamatanList.length > 0 ? ["Semua", ...kecamatanList] : ["Semua"];
  }, [data, filters.tahun, idField, dateField]);

  // Initialize filter options
  useEffect(() => {
    if (data && data.length > 0) {
      const tahunOptions = [...new Set(
        data
          .filter(item => item[idField] && item[dateField])
          .map(item => {
            const date = new Date(item[dateField]);
            return isNaN(date.getTime()) ? null : date.getFullYear().toString();
          })
          .filter(Boolean)
      )].sort((a, b) => parseInt(b) - parseInt(a));

      const kabupatenOptions = [...new Set(data.map(item => item.kabupaten_kota).filter(Boolean))];
      const singleKabupaten = kabupatenOptions.length === 1;
      setIsSingleKabupaten(singleKabupaten);
      
      setFilterOptions({
        kabupaten_kota: singleKabupaten ? kabupatenOptions : ["Semua", ...kabupatenOptions],
        kecamatan: ["Semua"],
        tahun: tahunOptions.length > 0 ? ["Semua", ...tahunOptions] : ["Semua"]
      });
      
      setFilters({
        kabupaten_kota: singleKabupaten ? kabupatenOptions[0] : "Semua",
        kecamatan: "Semua",
        tahun: "Semua"
      });
    }
  }, [data, idField, dateField]);

  // Update kecamatan options
  useEffect(() => {
    const newKecamatanOptions = getKecamatanByKabupaten(filters.kabupaten_kota);
    const singleKecamatan = newKecamatanOptions.length === 1;
    
    setFilterOptions(prev => ({
      ...prev,
      kecamatan: newKecamatanOptions
    }));
    
    setIsSingleKecamatan(singleKecamatan);

    if (filters.kabupaten_kota === "Semua" || 
        !newKecamatanOptions.includes(filters.kecamatan) ||
        singleKecamatan) {
      setFilters(prev => ({
        ...prev,
        kecamatan: singleKecamatan ? newKecamatanOptions[0] : "Semua"
      }));
    }
  }, [filters.kabupaten_kota, filters.tahun, getKecamatanByKabupaten]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return {
    filters,
    filterOptions,
    isSingleKabupaten,
    isSingleKecamatan,
    handleFilterChange
  };
};