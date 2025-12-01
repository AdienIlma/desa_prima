import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { format } from 'date-fns'; 

const PelaporanActiveFilters = ({
  filters,
  setFilters,
  formatKabupatenName,
  clearFilters
}) => {
  return (
    <div className="flex flex-wrap gap-2 text-sm ml-3 p-3">
      {/* Filter jenis pelaporan */}
      {filters.jenis.map((jenis) => (
        <div
          key={jenis}
          className="bg-gray-200 text-black px-2 py-1 rounded"
        >
          {jenis}
          <button
            className="ml-2 text-gray-500"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                jenis: prev.jenis.filter((k) => k !== jenis),
              }))
            }
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      ))}

      {/* Filter kabupaten */}
      {filters.kabupaten.map((kabupaten) => {
        const formattedName = formatKabupatenName(kabupaten);
        return (
          <div
            key={kabupaten}
            className="bg-gray-200 text-black px-2 py-1 rounded"
          >
            Kabupaten: {formattedName}
            <button
              className="ml-2 text-gray-500"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  kabupaten: prev.kabupaten.filter(
                    (k) => k !== kabupaten
                  ),
                }))
              }
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        );
      })}

      {/* Filter kecamatan */}
      {filters.kecamatan.map((kecamatan) => (
        <div
          key={kecamatan}
          className="bg-gray-200 text-black px-2 py-1 rounded"
        >
          Kecamatan: {kecamatan}
          <button
            className="ml-2 text-gray-500"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                kecamatan: prev.kecamatan.filter(
                  (k) => k !== kecamatan
                ),
              }))
            }
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      ))}

      {/* Filter kelompok */}
      {filters.kelompokDesa.map((kelompok) => (
        <div key={kelompok.id} className="bg-gray-200 text-black px-2 py-1 rounded">
          Kelompok Desa: {kelompok.nama}
          <button
            className="ml-2 text-gray-500"
            onClick={() =>
              setFilters(prev => ({
                ...prev,
                kelompokDesa: prev.kelompokDesa.filter(k => k.id !== kelompok.id)
              }))
            }
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      ))}

      {/* Filter tanggal */}
      {filters.startDate && (
        <div className="bg-gray-200 text-black px-2 py-1 rounded">
          Mulai: {format(filters.startDate, 'dd MMM yyyy')}
          <button
            className="ml-2 text-gray-500"
            onClick={() => setFilters(prev => ({ ...prev, startDate: null }))}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}
      {filters.endDate && (
        <div className="bg-gray-200 text-black px-2 py-1 rounded">
          Selesai: {format(filters.endDate, 'dd MMM yyyy')}
          <button
            className="ml-2 text-gray-500"
            onClick={() => setFilters(prev => ({ ...prev, endDate: null }))}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}

      {(filters.jenis.length > 0 ||
        filters.kabupaten.length > 0 ||
        filters.kecamatan.length > 0 ||
        filters.kelompokDesa.length > 0 ||
        filters.startDate ||
        filters.endDate) && (
        <div
          className="bg-red-200 text-red-700 px-2 py-1 rounded cursor-pointer"
          onClick={clearFilters}
        >
          Bersihkan Semua <FontAwesomeIcon icon={faTimes} />
        </div>
      )}
    </div>
  );
};

export default PelaporanActiveFilters;