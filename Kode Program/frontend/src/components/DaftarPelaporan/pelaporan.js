import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faAngleDoubleLeft,
  faAngleDoubleRight,
} from "@fortawesome/free-solid-svg-icons";
import { Box, Typography, Button, Divider, Chip } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import useMediaQuery from "../useMediaQuery";
import { Audio } from "react-loader-spinner";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatTanggal } from "../utils/format";

import PelaporanHeader from "./PelaporanHeader";
import PelaporanContent from "./PelaporanContent";
import PelaporanDialog from "./PelaporanDialog";
import PelaporanFilterSection from "./PelaporanFilterSection";
import PelaporanDetailContent from "./PelaporanDetailContent";

const normalizeKabupatenFrontend = (name) => {
  if (!name) return "";
  
  // Decode URL encoding
  const decoded = decodeURIComponent(name);
  const cleaned = decoded.toString().trim().toUpperCase().replace(/\s+/g, " ");
  
  // Handle special case untuk Yogyakarta
  if (cleaned === "KOTA YOGYAKARTA" || cleaned === "YOGYAKARTA") {
    return "KOTA YOGYAKARTA";
  }
  
  // Untuk kabupaten lainnya, pastikan format KAB. PREFIX untuk display
  if (cleaned.startsWith("KAB. ")) {
    return cleaned;
  } else {
    return `KAB. ${cleaned}`;
  }
};

// Fungsi untuk mengkonversi kabupaten ke format API
const getKabupatenForAPI = (kabupatenParam) => {
  if (!kabupatenParam) return "";
  
  // Decode URL encoding
  const decoded = decodeURIComponent(kabupatenParam);
  let cleaned = decoded.toString().trim();
  
  console.log("getKabupatenForAPI - decoded:", decoded); // Debug log
  console.log("getKabupatenForAPI - cleaned:", cleaned); // Debug log
  
  // Handle special case untuk Kota Yogyakarta
  if (cleaned.toUpperCase() === "KOTA YOGYAKARTA" || cleaned.toUpperCase() === "YOGYAKARTA") {
    return "Kota Yogyakarta";
  }
  
  // Untuk kabupaten lainnya, hilangkan prefix KAB. jika ada
  if (cleaned.toUpperCase().startsWith("KAB. ")) {
    cleaned = cleaned.substring(5); // Hilangkan "KAB. "
  }
  
  // Return format yang sesuai untuk API (title case)
  const result = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  console.log("getKabupatenForAPI - result:", result); // Debug log
  return result;
};

const Pelaporan = () => {
  const [pelaporan, setPelaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [kabupaten, setKabupaten] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [showDesktopFilter, setShowDesktopFilter] = useState(false);

  const [filters, setFilters] = useState({
    jenis: [],
    kabupaten: [],
    kecamatan: [],
    kelompokDesa: [],
    startDate: null,
    endDate: null,
    keyword: "",
  });

  const getCreatorName = (item) => {
    return `${item.User?.name || "Unknown"} (${item.User?.role || "No role"})`;
  };

  const { kabupatenList, kecamatanList, kelompokDesaList } = useMemo(() => {
    if (!Array.isArray(pelaporan)) {
      return {
        kabupatenList: [],
        kecamatanList: [],
        kelompokDesaList: [],
      };
    }
    const kabupatenSet = new Set();
    const kecamatanMap = new Map();
    const kelompokDesaMap = new Map();

    pelaporan.forEach((item) => {
      if (item.KelompokDesa) {
        kabupatenSet.add(item.KelompokDesa.kabupaten_kota);

        kecamatanMap.set(item.KelompokDesa.kecamatanNama, {
          nama: item.KelompokDesa.kecamatanNama,
          kabupaten: item.KelompokDesa.kabupaten_kota,
        });

        kelompokDesaMap.set(item.KelompokDesa.id, {
          id: item.KelompokDesa.id,
          nama: item.KelompokDesa.nama,
          kecamatan: item.KelompokDesa.kecamatanNama,
        });
      }
    });

    return {
      kabupatenList: Array.from(kabupatenSet).sort(),
      kecamatanList: Array.from(kecamatanMap.values()).sort((a, b) =>
        a.nama.localeCompare(b.nama)
      ),
      kelompokDesaList: Array.from(kelompokDesaMap.values()).sort((a, b) =>
        a.nama.localeCompare(b.nama)
      ),
    };
  }, [pelaporan]);

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const renderPageNumbers = () => {
    const totalPages = Math.ceil(filteredPelaporan.length / rowsPerPage);
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

  const clearFilters = () => {
    setFilters({
      jenis: [],
      kabupaten: [],
      kecamatan: [],
      kelompokDesa: [],
      startDate: null,
      endDate: null,
      keyword: "",
    });
  };

  const toggleFilter = () => {
    if (isMobile) {
      setIsFilterVisible(!isFilterVisible);
    } else {
      setShowDesktopFilter(!showDesktopFilter);
    }
  };

  const getUserRole = () => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;
    try {
      return jwtDecode(token).role;
    } catch (error) {
      console.error("Token tidak valid:", error);
      return null;
    }
  };

  const userRole = getUserRole();

  const normalizeKabupaten = (name) => {
    if (!name) return "";
    return name.toString().trim().toUpperCase().replace(/\s+/g, " ");
  };

 useEffect(() => {
    const fetchPelaporan = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem("authToken");

    if (!token) {
      throw new Error("Token not found");
    }

    const params = new URLSearchParams(location.search);
    let kabupatenParam = params.get("kabupaten") || "";

    // Normalisasi kabupaten untuk display
    const normalizedForDisplay = normalizeKabupatenFrontend(kabupatenParam);
    setKabupaten(normalizedForDisplay);

    // Konversi ke format API
    const kabupatenForAPI = getKabupatenForAPI(kabupatenParam);

    // Build API URL - tambahkan error handling
    const fetchParams = new URLSearchParams();
    
    if (kabupatenForAPI) {
      fetchParams.set("kabupaten", encodeURIComponent(kabupatenForAPI));
    }

    // Add date filters
    if (filters.startDate && filters.endDate) {
      fetchParams.set("startDate", format(filters.startDate, "yyyy-MM-dd"));
      fetchParams.set("endDate", format(filters.endDate, "yyyy-MM-dd"));
    }

    const apiUrl = `https://backend-desa-prima-dev.student.stis.ac.id/pelaporan/all?${fetchParams.toString()}`;
    
    const response = await fetch(apiUrl, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setPelaporan(Array.isArray(data) ? data : []);
    
  } catch (err) {
    console.error("Fetch error:", err);
    setError(err.message || "Gagal memuat data pelaporan");
    setPelaporan([]);
  } finally {
    setLoading(false);
  }
};

    fetchPelaporan();
  }, [location.search, userRole, filters.startDate, filters.endDate, navigate]);

  // Diubah untuk menampilkan dialog saat card diklik
  const handleItemClick = (item) => {
    setSelectedItem(item);
    setOpenDialog(true);
  };

  // Fungsi baru untuk navigasi ke detail
  const handleNavigateToDetail = (item) => {
    let tab = "";
    let highlightId = "";

    if (item.Produk) {
      tab = "Produk";
      highlightId = item.produkId || "";
    } else if (item.Anggota) {
      tab = "Anggota";
      highlightId = item.anggotaId || "";
    } else if (item.kas) {
      tab = "Kas";
      highlightId = item.kasId || "";
    } else if (item.Laporan) {
      tab = "Laporan";
      highlightId = item.laporanId || "";
    } else if (item.Kegiatan) {
      tab = "Kegiatan";
      highlightId = item.kegiatanId || "";
    } else if (item.KelompokDesa) {
      const userRole = getUserRole();
      const isPengurus = userRole === "Pengurus";

      if (isPengurus) {
        return navigate(
          `/daftar-kelompok?kabupaten=${encodeURIComponent(
            item.KelompokDesa.kabupaten_kota
          )}&highlight=${item.kelompokId}`
        );
      }

      return navigate(`/daftar-kelompok?highlight=${item.kelompokId}`);
    }

    navigate(
      `/kelompok-desa/${item.kelompokId}?tab=${tab}&highlight=${highlightId}`
    );
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Fungsi untuk mendapatkan label jenis pelaporan
  const getJenisPelaporan = (item) => {
    if (item.Produk) return "Produk";
    if (item.Anggota) return "Anggota";
    if (item.kas) return "Kas";
    if (item.Laporan) return "Laporan";
    if (item.Kegiatan) return "Kegiatan";
    if (item.KelompokDesa) return "Kelompok Desa";
    return "Pelaporan";
  };

  // Render konten ringkas untuk card
  const renderShortContent = (item) => {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Chip
          label={getJenisPelaporan(item)}
          size="small"
          sx={{
            mb: 1,
            alignSelf: "flex-start",
            fontSize: "0.7rem",
            height: "24px",
          }}
        />
        {item.KelompokDesa && (
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                width: "100%",
              }}
            >
              {/* Item Kelompok */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "baseline",
                  gap: 0.5,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "bold",
                    minWidth: { xs: "70px", sm: "80px" },
                    flexShrink: 0,
                  }}
                >
                  Kelompok
                </Typography>
                <Typography variant="body2">
                  {item.KelompokDesa.nama}
                </Typography>
              </Box>

              {/* Item Lokasi */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 0.5,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "bold",
                    minWidth: { xs: "70px", sm: "80px" },
                    flexShrink: 0,
                    pt: 0.5,
                  }}
                >
                  Lokasi
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  {item.KelompokDesa.kecamatanNama},{" "}
                  {item.KelompokDesa.kabupaten_kota}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Box>
    );
  };

  const filteredPelaporan = useMemo(() => {
    return pelaporan.filter((item) => {
      // Filter berdasarkan jenis
      if (filters.jenis.length > 0) {
        const itemType = item.Produk
          ? "Produk"
          : item.Anggota
          ? "Anggota"
          : item.kas
          ? "Kas"
          : item.Laporan
          ? "Laporan"
          : item.Kegiatan
          ? "Kegiatan"
          : item.KelompokDesa
          ? "Kelompok Desa"
          : "";

        if (!filters.jenis.includes(itemType)) return false;
      }

      // Filter berdasarkan kabupaten
      if (filters.kabupaten.length > 0 && item.KelompokDesa) {
        if (!filters.kabupaten.includes(item.KelompokDesa.kabupaten_kota)) {
          return false;
        }
      }

      // Filter berdasarkan kecamatan
      if (filters.kecamatan.length > 0 && item.KelompokDesa) {
        if (!filters.kecamatan.includes(item.KelompokDesa.kecamatanNama)) {
          return false;
        }
      }

      // Filter berdasarkan kelompok
      if (filters.kelompokDesa.length > 0 && item.KelompokDesa) {
        if (!filters.kelompokDesa.some((k) => k.id === item.KelompokDesa.id)) {
          return false;
        }
      }

      // Filter berdasarkan tanggal
      if (filters.startDate || filters.endDate) {
        const itemDate = new Date(item.tgl_lapor);
        const start = filters.startDate ? new Date(filters.startDate) : null;
        const end = filters.endDate ? new Date(filters.endDate) : null;

        if (start && itemDate < start) return false;
        if (end && itemDate > end) return false;
      }

      // Filter berdasarkan kata kunci pencarian
      if (filters.keyword.trim() !== "") {
        const keyword = filters.keyword.toLowerCase().trim();
        const searchFields = [
          item.deskripsi?.toLowerCase(),
          item.KelompokDesa?.nama?.toLowerCase(),
          item.KelompokDesa?.kabupaten_kota?.toLowerCase(),
          item.KelompokDesa?.kecamatanNama?.toLowerCase(),
          item.Produk?.nama?.toLowerCase(),
          item.Produk?.pelaku_usaha?.toLowerCase(),
          item.Anggota?.nama?.toLowerCase(),
          item.Anggota?.jabatan?.toLowerCase(),
          item.kas?.nama_transaksi?.toLowerCase(),
          item.Laporan?.nama_laporan?.toLowerCase(),
          item.Kegiatan?.nama_kegiatan?.toLowerCase(),
          item.kas?.total_transaksi?.toString(),
          item.Produk?.harga_awal?.toString(),
          item.Produk?.harga_akhir?.toString(),
          format(new Date(item.tgl_lapor), "dd MMMM yyyy HH:mm", {
            locale: id,
          }).toLowerCase(),
        ];

        if (!searchFields.some((field) => field && field.includes(keyword))) {
          return false;
        }
      }

      return true;
    });
  }, [pelaporan, filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Audio type="Bars" color="#542d48" height={80} width={80} />
      </div>
    );
  }

  if (error)
    return (
      <Box p={3}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
      <div className="p-4 sm:p-7">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          {!isMobile && (
            <div className="hidden md:block w-full md:w-1/4 lg:w-1/5">
              <PelaporanFilterSection
                isFilterVisible={isFilterVisible}
                toggleFilter={toggleFilter}
                filters={filters}
                setFilters={setFilters}
                kabupatenList={kabupatenList}
                kecamatanList={kecamatanList}
                kelompokDesaList={kelompokDesaList}
                userRole={userRole}
              />
            </div>
          )}

          <div className="w-full md:w-3/4 lg:w-4/5">
            <PelaporanHeader
              kabupaten={kabupaten}
              filters={filters}
              setFilters={setFilters}
              toggleFilter={toggleFilter}
              isMobile={isMobile}
              normalizeKabupaten={normalizeKabupaten}
              clearFilters={clearFilters}
            />

            <PelaporanContent
              loading={loading}
              error={error}
              pelaporan={pelaporan}
              filteredPelaporan={filteredPelaporan}
              page={page}
              rowsPerPage={rowsPerPage}
              handleItemClick={handleItemClick}
              getJenisPelaporan={getJenisPelaporan}
              renderShortContent={renderShortContent}
              getCreatorName={getCreatorName}
              renderPageNumbers={renderPageNumbers}
              handleChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </div>
        </div>
      </div>

      <PelaporanDialog
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        selectedItem={selectedItem}
        getJenisPelaporan={getJenisPelaporan}
        renderDetailContent={(item) => <PelaporanDetailContent item={item} />}
        handleNavigateToDetail={handleNavigateToDetail}
      />
    </LocalizationProvider>
  );
};

export default Pelaporan;
