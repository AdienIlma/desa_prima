import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useLocation } from "react-router-dom";
import Modal from "../Modal/KelompokModal";
import { Audio } from "react-loader-spinner";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import useMediaQuery from "../useMediaQuery";
import FilterSection from "./FilterSection";
import SearchSection from "./SearchSection";
import ActiveFilters from "./ActiveFilters";
import DataTable from "./DataTable";
import useUserData from "../hooks/useUserData";
import useDesaData from "../hooks/useDesaData";
import ModalPreviewExcel from "../Modal/ModalPreviewExcel";
import {
  formatKabupatenName,
  formatRupiah,
  formatTanggal,
  formatAlamat,
} from "../utils/format";
import { importDesaFromExcel } from "../utils/excelUtils";
import { useHighlightRow } from "../hooks/useHighlightRow";
import { useAuth } from "../../context/AuthContext";

const columns = [
  { id: "no", label: "No" },
  { id: "nama", label: "Nama" },
  { id: "alamat", label: "Alamat" },
  { id: "tanggal_pembentukan", label: "Tanggal Bentuk" },
  { id: "jumlah_dana_sekarang", label: "Jumlah Dana" },
  { id: "jumlah_anggota_sekarang", label: "Jumlah Anggota" },
  { id: "kategori", label: "Kategori" },
];

const ListKelompokDesa = () => {
  const location = useLocation();
  const kabupatenName = new URLSearchParams(location.search).get("kabupaten");
  const { desaList, loading, fetchDesaData, produk, anggota } =
    useDesaData(kabupatenName);
  const [filteredDesaList, setFilteredDesaList] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDesa, setSelectedDesa] = useState(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { profil } = useUserData();
  const [isUploading, setIsUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [previewData, setPreviewData] = useState({
    columns: [],
    data: [],
  });
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const highlightedId = useHighlightRow();
  const { user } = useAuth();
  const normalizeKabupatenName = (kabupatenName) => {
    if (!kabupatenName) return "";

    return kabupatenName
      .toString()
      .toLowerCase()
      .replace(/kab\.?\s*/gi, "")
      .replace(/kabupaten\s*/gi, "")
      .replace(/kota\s*/gi, "")
      .trim();
  };

  const formattedKabupaten = normalizeKabupatenName(kabupatenName);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await importDesaFromExcel(
        file,
        setPreviewData,
        setFileToUpload,
        setShowPreviewModal
      );
    } catch (error) {
      toast.error(error.message || "Gagal membaca file Excel");
      e.target.value = ""; // Reset input file
    }
  };

  const handleConfirmUpload = async () => {
    setIsUploading(true);
    setShowPreviewModal(false);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Token tidak ditemukan, silakan login kembali");
      }

      const getKabupatenId = (namaKabupaten) => {
        if (!namaKabupaten) return null;

        // Normalisasi nama kabupaten
        const nama = namaKabupaten
          .toString()
          .toLowerCase()
          .replace(/kab\.?\s*/i, "")
          .replace(/kabupaten\s*/i, "")
          .replace(/kota\s*/i, "")
          .trim();

        // Mapping nama kabupaten ke ID
        const kabupatenMap = {
          bantul: 1,
          sleman: 2,
          "kulon progo": 3,
          gunungkidul: 4,
          yogyakarta: 5,
        };

        // Cari yang paling cocok
        for (const [key, id] of Object.entries(kabupatenMap)) {
          if (nama === key || nama.includes(key)) {
            return id;
          }
        }

        return null;
      };

      // Fungsi untuk format nama kabupaten ke format standar
      const formatKabupatenName = (namaKabupaten) => {
        if (!namaKabupaten) return "";

        // Normalisasi nama kabupaten
        const nama = namaKabupaten
          .toString()
          .toLowerCase()
          .replace(/kab\.?\s*/i, "")
          .replace(/kabupaten\s*/i, "")
          .replace(/kota\s*/i, "")
          .trim();

        // Mapping ke format standar
        const formatMap = {
          bantul: "KAB. BANTUL",
          sleman: "KAB. SLEMAN",
          "kulon progo": "KAB. KULON PROGO",
          gunungkidul: "KAB. GUNUNGKIDUL",
          yogyakarta: "KOTA YOGYAKARTA",
        };

        // Cari yang paling cocok dan return format standar
        for (const [key, standardFormat] of Object.entries(formatMap)) {
          if (nama === key || nama.includes(key)) {
            return standardFormat;
          }
        }

        // Jika tidak ditemukan, return input asli
        return namaKabupaten;
      };

      const userId = user?.id;
      if (!userId) {
        throw new Error("User ID tidak valid");
      }

      // Transformasi data dengan format yang sesuai backend
      const dataToSend = previewData.data.map((item) => {
        // Bersihkan dan format data
        const jumlahHibah = item["Jumlah Hibah Diterima"]
          ? parseInt(
              String(item["Jumlah Hibah Diterima"]).replace(/[^\d]/g, "")
            ) || 0
          : 0;

        // Format tanggal ke string ISO
        const formatDate = (dateInput) => {
          if (!dateInput) return new Date().toISOString();
          if (dateInput instanceof Date) return dateInput.toISOString();

          // Parse dari string Indonesia "1 Januari 2023"
          const months = {
            januari: 0,
            februari: 1,
            maret: 2,
            april: 3,
            mei: 4,
            juni: 5,
            juli: 6,
            agustus: 7,
            september: 8,
            oktober: 9,
            november: 10,
            desember: 11,
          };

          const parts = dateInput.toString().toLowerCase().split(" ");
          if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = months[parts[1]];
            const year = parseInt(parts[2]);
            return new Date(year, month, day).toISOString();
          }
          return new Date().toISOString();
        };

        return {
          Nama: item.Nama || "",
          "Kabupaten/Kota": formatKabupatenName(item["Kabupaten/Kota"]),
          Kecamatan: item.Kecamatan || "",
          Kelurahan: item.Kelurahan || "",
          "Tanggal Pembentukan": formatDate(item["Tanggal Pembentukan"]),
          "Jumlah Hibah Diterima": jumlahHibah,
          "Jumlah Anggota Awal": parseInt(item["Jumlah Anggota Awal"]) || 0,
          Longitude: item.Longitude || "0",
          Latitude: item.Latitude || "0",
          Kategori: item.Kategori || "Tumbuh",
          Status: item.Status || "Pending",
          KabupatenId: getKabupatenId(item["Kabupaten/Kota"]),
          userId: userId,
        };
      });

      const response = await axios.post(
        `https://backend-desa-prima-dev.student.stis.ac.id/kelompok/confirm-upload`,
        { data: dataToSend, userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      // Handle response
      if (response.data.errorCount > 0) {
        response.data.errors.forEach((error) => {
          toast.error(`Baris ${error.row}: ${error.error}`);
        });
      }

      if (response.data.successCount > 0) {
        toast.success(`Berhasil mengimpor ${response.data.successCount} data`);
        fetchDesaData();
      }
    } catch (error) {
      console.error("Upload error:", {
        message: error.message,
        response: error.response?.data,
        stack: error.stack,
      });

      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => {
          toast.error(`Baris ${err.row}: ${err.error}`);
        });
      } else {
        toast.error(error.message || "Terjadi kesalahan saat mengupload");
      }
    } finally {
      setIsUploading(false);
      setFileToUpload(null);
      setPreviewData({ columns: [], data: [] });
    }
  };

  const getDesaWithDetails = useCallback(() => {
    return desaList.map((desa) => ({
      ...desa,
      produk: produk.filter((p) => p.desaId === desa.id),
      anggota: anggota.filter((a) => a.desaId === desa.id),
    }));
  }, [desaList, produk, anggota]);

  const desaListWithDetails = getDesaWithDetails();

  const [search, setSearch] = useState({
    kategori: [], // Array untuk menyimpan kategori yang dipilih
    kecamatanNama: [], // Array untuk menyimpan kecamatan yang dipilih
    kabupatenNama: [],
    nama: "",
    kelurahanNama: "",
    anggotaDari: "",
    anggotaSampai: "",
    danaDari: "",
    danaSampai: "",
    keyword: "",
  });

  // Helper functions
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

  useEffect(() => {
    fetchDesaData();
  }, [fetchDesaData, location.search]);

  const filterDesaData = useCallback(() => {
    const filtered = desaListWithDetails.filter((desa) => {
      // Pastikan semua field yang akan diakses ada nilainya
      const desaNama = desa.nama ? desa.nama.toLowerCase() : "";
      const desaKategori = desa.kategori ? desa.kategori.toLowerCase() : "";
      const desaKelurahan = desa.kelurahan ? desa.kelurahan.toLowerCase() : "";
      const desaKecamatan = desa.kecamatan ? desa.kecamatan.toLowerCase() : "";
      const desaKabupaten = desa.kabupaten_kota
        ? desa.kabupaten_kota.toLowerCase()
        : "";

      const alamat = formatAlamat(
        desa.kelurahan,
        desa.kecamatan,
        desa.kabupaten_kota
      ).toLowerCase();

      const formattedDate = desa.tanggal_pembentukan
        ? formatTanggal(desa.tanggal_pembentukan).toLowerCase()
        : "";

      const keyword = search.keyword ? search.keyword.toLowerCase().trim() : "";

      // Filter by keyword jika ada
      if (keyword) {
        const matches = [
          desaNama,
          alamat,
          desaKategori,
          desa.jumlah_anggota_sekarang?.toString() || "",
          desa.jumlah_dana_sekarang?.toString() || "",
          formattedDate,
        ].some((field) => field.includes(keyword));

        if (!matches) return false;
      }

      // Filter berdasarkan parameter kabupaten dari URL
      if (kabupatenName) {
        const desaKabupatenNormalized = normalizeKabupatenName(
          desa.kabupaten_kota
        );
        const urlKabupatenNormalized = normalizeKabupatenName(kabupatenName);

        if (desaKabupatenNormalized !== urlKabupatenNormalized) {
          return false;
        }
      }

      // Filter lainnya dengan pengecekan null
      const result =
        (search.kategori.length === 0 ||
          (desa.kategori && search.kategori.includes(desa.kategori))) &&
        (search.kecamatanNama.length === 0 ||
          (desa.kecamatan && search.kecamatanNama.includes(desa.kecamatan))) &&
        (search.kabupatenNama.length === 0 ||
          (desa.kabupaten_kota &&
            search.kabupatenNama.includes(desa.kabupaten_kota))) &&
        (!search.nama ||
          (desa.nama &&
            desa.nama.toLowerCase().includes(search.nama.toLowerCase()))) &&
        (!search.kelurahanNama ||
          (desa.kelurahan &&
            desa.kelurahan
              .toLowerCase()
              .includes(search.kelurahanNama.toLowerCase()))) &&
        (!startDate ||
          (desa.tanggal_pembentukan &&
            new Date(startDate) <= new Date(desa.tanggal_pembentukan))) &&
        (!endDate ||
          (desa.tanggal_pembentukan &&
            new Date(desa.tanggal_pembentukan) <= new Date(endDate))) &&
        (!search.anggotaDari ||
          (desa.jumlah_anggota_sekarang != null &&
            desa.jumlah_anggota_sekarang >= search.anggotaDari)) &&
        (!search.anggotaSampai ||
          (desa.jumlah_anggota_sekarang != null &&
            desa.jumlah_anggota_sekarang <= search.anggotaSampai)) &&
        (!search.danaDari ||
          (desa.jumlah_dana_sekarang != null &&
            desa.jumlah_dana_sekarang >= search.danaDari)) &&
        (!search.danaSampai ||
          (desa.jumlah_dana_sekarang != null &&
            desa.jumlah_dana_sekarang <= search.danaSampai));

      return result;
    });

    return filtered;
  }, [desaListWithDetails, search, startDate, endDate, kabupatenName]);

  useEffect(() => {
    const filteredData = filterDesaData();
    setFilteredDesaList(filteredData);
  }, [filterDesaData]);

  // Format data untuk tabel
  const filteredDesa = useMemo(() => {
    return filteredDesaList.map((desa, index) => ({
      ...desa,
      no: index + 1,
      alamat: formatAlamat(desa.kelurahan, desa.kecamatan, desa.kabupaten_kota),
      tanggal_pembentukan: formatTanggal(desa.tanggal_pembentukan),
      jumlah_dana_sekarang: formatRupiah(desa.jumlah_dana_sekarang),
      jumlah_hibah_diterima: formatRupiah(desa.jumlah_hibah_diterima),
    }));
  }, [filteredDesaList]);

  const clearFilters = () => {
    setSearch({
      kategori: [],
      kecamatanNama: [],
      kabupatenNama: [],
      keyword: "",
      anggotaDari: "",
      anggotaSampai: "",
      danaDari: "",
      danaSampai: "",
    });
    setStartDate("");
    setEndDate("");
  };

  const toggleFilter = () => setIsFilterVisible(!isFilterVisible);
  const handleModalClose = (shouldRefresh = false) => {
    setIsModalOpen(false);
    setSelectedDesa(null);
    if (shouldRefresh) {
      fetchDesaData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Audio type="Bars" color="#542d48" height={80} width={80} />
      </div>
    );
  }

  return (
    <>
      <div
        className={`App py-7 px-5 flex flex-col md:flex-row w-full lg:100% justify-center ${
          isFilterVisible ? "w-full" : ""
        } `}
      >
        {isMobile && (
          <div
            className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40 ${
              isFilterVisible ? "block" : "hidden"
            }`}
            onClick={toggleFilter}
          ></div>
        )}

        <div
          className={`${isFilterVisible ? "hidden" : "md:block"}
              hidden h-fit bg-white p-3 rounded-sm hover:bg-inactive cursor-pointer transition-colors duration-300`}
          onClick={toggleFilter}
        >
          <FontAwesomeIcon icon={faFilter} style={{ color: "#A8A8A8" }} />
        </div>
        {/* Filter Section */}
        {isFilterVisible && (
          <FilterSection
            isFilterVisible={isFilterVisible}
            toggleFilter={toggleFilter}
            search={search}
            setSearch={setSearch}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            desaList={desaList}
            userRole={userRole}
            formatKabupatenName={formatKabupatenName}
          />
        )}

        {/* Main Content */}
        <div className={`ml-0 md:ml-4 bg-white w-full md:w-[80%]`}>
          <SearchSection
            profil={profil}
            search={search}
            setSearch={setSearch}
            toggleFilter={toggleFilter}
            isFilterVisible={isFilterVisible}
            kabupatenName={kabupatenName}
            userRole={userRole}
            setIsModalOpen={setIsModalOpen}
            handleFileUpload={handleFileUpload}
            isUploading={isUploading}
            filteredDesa={filteredDesa}
          />
          <ActiveFilters
            userRole={userRole}
            search={search}
            setSearch={setSearch}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            formatCurrency={formatRupiah}
            clearFilters={clearFilters}
          />

          <DataTable
            desaList={desaList || []}
            filteredDesa={filteredDesa}
            columns={columns}
            isMobile={isMobile}
            onUpdate={fetchDesaData}
            highlightedId={highlightedId}
          />
        </div>
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          selectedDesa={selectedDesa}
          kabupatenName={formattedKabupaten}
        />
      )}
      {showPreviewModal && (
        <ModalPreviewExcel
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setFileToUpload(null);
          }}
          previewData={previewData}
          onConfirmUpload={handleConfirmUpload}
          isLoading={isUploading}
        />
      )}
    </>
  );
};

export default ListKelompokDesa;
