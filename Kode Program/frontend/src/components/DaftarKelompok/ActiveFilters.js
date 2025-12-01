import { useLocation } from "react-router-dom";
import { formatDaftarKabupaten } from "../utils/format";

const ActiveFilters = ({
  search,
  setSearch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  formatCurrency,
  clearFilters
}) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const kabupatenFromURL = queryParams.get('kabupaten');

  const isKabupatenFromUI = search.kabupatenNama.length > 0 && 
                           !kabupatenFromURL;

  return (
    <div className="flex flex-wrap gap-2 text-sm ml-3 p-3">
            {/* filter kategori yang aktif */}
            {search.kategori.map((kategori) => (
              <div
                key={kategori}
                className="bg-gray-200 text-black px-2 py-1 rounded"
              >
                {kategori}
                <button
                  className="ml-2 text-gray-500"
                  onClick={() =>
                    setSearch((prev) => ({
                      ...prev,
                      kategori: prev.kategori.filter((k) => k !== kategori),
                    }))
                  }
                >
                  x
                </button>
              </div>
            ))}

            {/* filter kabupaten yang aktif */}
            {isKabupatenFromUI && search.kabupatenNama.map((kabupaten) => {
              const formattedName = formatDaftarKabupaten(kabupaten);
              return (
                <div
                  key={formattedName}
                  className="bg-gray-200 text-black px-2 py-1 rounded"
                >
                  {kabupaten}
                  <button
                    className="ml-2 text-gray-500"
                    onClick={() =>
                      setSearch((prev) => ({
                        ...prev,
                        kabupatenNama: prev.kabupatenNama.filter(
                          (k) => k !== kabupaten
                        ),
                      }))
                    }
                  >
                    x
                  </button>
                </div>
               );
              })}


            {/* filter kecamatan yang aktif */}
            {search.kecamatanNama.map((kecamatan) => (
              <div
                key={kecamatan}
                className="bg-gray-200 text-black px-2 py-1 rounded"
              >
                {kecamatan}
                <button
                  className="ml-2 text-gray-500"
                  onClick={() =>
                    setSearch((prev) => ({
                      ...prev,
                      kecamatanNama: prev.kecamatanNama.filter(
                        (k) => k !== kecamatan
                      ),
                    }))
                  }
                >
                  x
                </button>
              </div>
            ))}

            {/* filter tanggal */}
            {startDate && (
              <div className="bg-gray-200 text-black px-2 py-1 rounded">
                Mulai: {startDate}
                <button
                  className="ml-2 text-gray-500"
                  onClick={() => setStartDate("")}
                >
                  x
                </button>
              </div>
            )}
            {endDate && (
              <div className="bg-gray-200 text-black px-2 py-1 rounded">
                Selesai: {endDate}
                <button
                  className="ml-2 text-gray-500"
                  onClick={() => setEndDate("")}
                >
                  x
                </button>
              </div>
            )}

            {/* filter keyword pencarian */}
            {search.keyword && (
              <div className="bg-gray-200 text-black px-2 py-1 rounded">
                {search.keyword}
                <span
                  className="cursor-pointer ml-2 text-gray-500"
                  onClick={() =>
                    setSearch((prev) => ({ ...prev, keyword: "" }))
                  }
                >
                  x
                </span>
              </div>
            )}

            {/* filter jumlah anggota */}
  {(search.anggotaDari || search.anggotaSampai) && (
    <div className="bg-gray-200 text-black px-2 py-1 rounded">
      Anggota: {search.anggotaDari || 'min'} - {search.anggotaSampai || 'max'}
      <button
        className="ml-2 text-gray-500"
        onClick={() => setSearch(prev => ({
          ...prev,
          anggotaDari: "",
          anggotaSampai: ""
        }))}
      >
        x
      </button>
    </div>
  )}

  {/* filter jumlah dana */}
  {(search.danaDari || search.danaSampai) && (
    <div className="bg-gray-200 text-black px-2 py-1 rounded">
      Dana: {formatCurrency(search.danaDari || 0)} - {formatCurrency(search.danaSampai)|| 'tak hingga'}
      <button
        className="ml-2 text-gray-500"
        onClick={() => setSearch(prev => ({
          ...prev,
          danaDari: "",
          danaSampai: ""
        }))}
      >
        x
      </button>
    </div>
  )}

{(search.kategori.length > 0 ||
        isKabupatenFromUI ||
        search.kecamatanNama.length > 0 ||
        startDate ||
        endDate ||
        search.anggotaDari ||
        search.anggotaSampai ||
        search.danaDari ||
        search.danaSampai) && (
        <div
          className="bg-red-200 text-red-700 px-2 py-1 rounded cursor-pointer"
          onClick={clearFilters}
        >
          Bersihkan Semua x
        </div>
      )}
          </div>
  );
};

export default ActiveFilters;