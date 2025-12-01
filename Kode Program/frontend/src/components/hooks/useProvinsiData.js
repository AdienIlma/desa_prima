import { useState, useEffect } from "react";
import axios from "axios";
import { formatKabupatenPendek } from "../utils/format";
import useDesaData from "./useDesaData";
import { formatNamaWilayah } from "../utils/format";

const useProvinsiData = (filterKabupaten = null) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    kelompokDesa: [],
    provinsi: {
      desaMaju: 0,
      desaBerkembang: 0,
      desaTumbuh: 0,
      jumlah_desa: 0,
      tanggal_awal: new Date(),
      tanggal_akhir: new Date(),
      jumlahAnggota: 0,
      totalJumlahKelompok: 0,
      produkPerDesa: {},
      dataGabungan: [],
      dataGabunganLengkap: [],
      pelaporanData: [],
      semuaAnggota: [],
    },
    kabupatenData: [],
    kecamatanList: [],
    kelurahanList: [],
  });
  const {
    desaList,
    jumlahDesa,
    loading: loadingDesa,
  } = useDesaData(formatNamaWilayah(filterKabupaten));

  const fetchKabupatenData = async () => {
    try {
      const response = await axios.get(
        `/data/kabupaten/34.json`
      );
      return response.data;
    } catch (err) {
      console.error("Gagal memuat data kabupaten:", err);
      return [];
    }
  };

  const fetchKecamatan = async (kabupatenId) => {
    try {
      const response = await axios.get(
        `/data/kecamatan/${kabupatenId}.json`
      );
      return response.data;
    } catch (err) {
      console.error("Gagal memuat data kecamatan:", err);
      return [];
    }
  };

  const fetchKelurahan = async (kecamatanId) => {
    try {
      const res = await axios.get(
        `/data/kelurahan/${kecamatanId}.json`
      );
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Token tidak ditemukan");

      const headers = { Authorization: `Bearer ${token}` };
      const pelaporanUrl = filterKabupaten
        ? `https://backend-desa-prima-dev.student.stis.ac.id/pelaporan/all?kabupaten=${encodeURIComponent(
            filterKabupaten
          )}`
        : `https://backend-desa-prima-dev.student.stis.ac.id/pelaporan/all`;
      const anggotaUrl = filterKabupaten
        ? `https://backend-desa-prima-dev.student.stis.ac.id/komponen-anggota/all?kabupaten=${encodeURIComponent(
            filterKabupaten
          )}`
        : `https://backend-desa-prima-dev.student.stis.ac.id/komponen-anggota/all`;
      const produkUrl = filterKabupaten
        ? `https://backend-desa-prima-dev.student.stis.ac.id/komponen-produk/total-produk?kabupaten=${encodeURIComponent(
            filterKabupaten
          )}`
        : `https://backend-desa-prima-dev.student.stis.ac.id/komponen-produk/total-produk`;

      // Fetch data secara parallel
      const [
        kabupatenResponse,
        pelaporanResponse,
        anggotaResponse,
        produkResponse,
        ibnuKabupatenData,
      ] = await Promise.all([
        axios.get(
          `https://backend-desa-prima-dev.student.stis.ac.id/kabupaten`,
          {
            headers,
          }
        ),
        axios.get(pelaporanUrl, { headers }),
        axios.get(anggotaUrl, { headers }),
        axios.get(produkUrl, { headers }),
        fetchKabupatenData(),
      ]);

      // Proses data kabupaten
      let kabupatenData = kabupatenResponse.data || [];
      let selectedKabupaten = null;

      // Jika ada filter kabupaten, cari kabupaten yang sesuai
      if (filterKabupaten) {
        const normalizedFilter = formatKabupatenPendek(filterKabupaten);

        selectedKabupaten = kabupatenData.find((k) => {
          const normalizedKabName = formatKabupatenPendek(k.nama_kabupaten);
          return (
            k.id == filterKabupaten ||
            normalizedKabName === normalizedFilter ||
            normalizedKabName.includes(normalizedFilter)
          );
        });

        kabupatenData = selectedKabupaten ? [selectedKabupaten] : [];
      }
      const totalJumlahDesa =
        filterKabupaten && selectedKabupaten
          ? selectedKabupaten.jumlah_desa
          : kabupatenData.reduce((sum, k) => sum + (k.jumlah_desa || 0), 0);

      const kelompokDesaData = desaList || [];
      const pelaporanData = Array.isArray(pelaporanResponse.data)
        ? pelaporanResponse.data
        : pelaporanResponse.data?.data || [];

      const semuaAnggota = Array.isArray(anggotaResponse.data)
        ? anggotaResponse.data
        : anggotaResponse.data?.data || [];
      const totalAnggota = semuaAnggota.length;

      const dataGabunganPelaporanDesa = pelaporanData.map((pelaporan) => {
        const kelompok = kelompokDesaData.find(
          (k) => k.id === pelaporan.kelompokId
        );
        return {
          ...pelaporan,
          ...kelompok,
          kategori: kelompok ? kelompok.kategori : "Tidak Diketahui",
        };
      });

      const dataGabunganLengkap = semuaAnggota.map((anggota) => {
        const pelaporan = pelaporanData.find(
          (p) => p.id === anggota.pelaporanId
        );
        const kelompok = kelompokDesaData.find(
          (k) => k.id === (pelaporan?.kelompokId || anggota.kelompokId)
        );
        return {
          ...anggota,
          ...(pelaporan || {}),
          ...(kelompok || {}),
          kategori: kelompok?.kategori || "Tidak Diketahui",
        };
      });

      const jumlahMaju = kelompokDesaData.filter(
        (d) => d.kategori === "Maju"
      ).length;
      const jumlahBerkembang = kelompokDesaData.filter(
        (d) => d.kategori === "Berkembang"
      ).length;
      const jumlahTumbuh = kelompokDesaData.filter(
        (d) => d.kategori === "Tumbuh"
      ).length;

      // Proses tanggal
      const validDates = kelompokDesaData
        .map((d) =>
          d.tanggal_pembentukan ? new Date(d.tanggal_pembentukan) : null
        )
        .filter((date) => date !== null && !isNaN(date.getTime()));

      const startDate =
        validDates.length > 0
          ? new Date(Math.min(...validDates.map((date) => date.getTime())))
          : new Date();
      const endDate =
        validDates.length > 0
          ? new Date(Math.max(...validDates.map((date) => date.getTime())))
          : new Date();

      // Proses data produk
      const produkData = produkResponse.data?.data || produkResponse.data;
      const produkPerDesa = Number(produkData?.total) || 0;
      console.log("Produk data:", produkPerDesa);

      // Update state
      setData({
        kelompokDesa: kelompokDesaData,
        provinsi: {
          desaMaju: jumlahMaju,
          desaBerkembang: jumlahBerkembang,
          desaTumbuh: jumlahTumbuh,
          jumlah_desa: totalJumlahDesa,
          tanggal_awal: startDate,
          tanggal_akhir: endDate,
          jumlahAnggota: totalAnggota,
          totalJumlahKelompok: jumlahMaju + jumlahBerkembang + jumlahTumbuh,
          produkPerDesa,
          dataGabungan: dataGabunganPelaporanDesa,
          dataGabunganLengkap,
          pelaporanData,
          semuaAnggota,
        },
        kabupatenData: ibnuKabupatenData,
        kecamatanList: [],
        kelurahanList: [],
      });
    } catch (err) {
      console.error("Gagal memuat data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectKabupaten = async (kabupatenId) => {
    try {
      const kecamatanData = await fetchKecamatan(kabupatenId);
      setData((prev) => ({
        ...prev,
        kecamatanList: kecamatanData,
        kelurahanList: [], // Reset kelurahan saat ganti kabupaten
        selectedKabupaten: kabupatenId,
        selectedKecamatan: null,
      }));
    } catch (err) {
      console.error("Gagal memuat data kecamatan:", err);
    }
  };

  const handleSelectKecamatan = async (kecamatanId) => {
    try {
      const kelurahanData = await fetchKelurahan(kecamatanId);
      setData((prev) => ({
        ...prev,
        kelurahanList: kelurahanData,
        selectedKecamatan: kecamatanId,
      }));
    } catch (err) {
      console.error("Gagal memuat data kelurahan:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [filterKabupaten, desaList]);

  return {
    loading,
    error,
    ...data,
    selectKabupaten: handleSelectKabupaten,
    selectKecamatan: handleSelectKecamatan,
    refetch: fetchAllData,
  };
};

export default useProvinsiData;
