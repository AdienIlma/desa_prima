import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { API_CONFIG } from "../../config/apiConfig";

const useDesaData = (kabupatenName) => {
  const { id } = useParams();
  const [desa, setDesa] = useState({ nama: [] });
  const [loading, setLoading] = useState(true);
  const [kegiatan, setKegiatan] = useState([]);
  const [produk, setProduk] = useState([]);
  const [anggota, setAnggota] = useState([]);
  const [kas, setKas] = useState([]);
  const [laporan, setLaporan] = useState([]);
  const [error, setError] = useState(null);
  const [desaList, setDesaList] = useState([]);

  const handleError = useCallback((err, context) => {
    console.error(`Error in ${context}:`, err);
    setError(err.response?.data?.message || `Gagal memuat ${context}`);
    return null;
  }, []);

  const fetchData = useCallback(
    async (endpoint, setter) => {
      if (!id) return false;

      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("Token tidak ditemukan");
          return false;
        }

        const url = `https://backend-desa-prima-dev.student.stis.ac.id/komponen-${endpoint}/${id}/${endpoint}`;

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setter(response.data);
        return true;
      } catch (err) {
        handleError(err, endpoint);
        return false;
      }
    },
    [id, handleError]
  );

  const fetchDesaData = useCallback(async (kabupaten_kota) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      if (!token) {
        setError("Token tidak ditemukan");
        return;
      }

      // Gunakan parameter kabupaten_kota jika ada
      let url = `https://backend-desa-prima-dev.student.stis.ac.id/kelompok`;
      if (kabupaten_kota) {
        url += `?kabupaten=${encodeURIComponent(kabupaten_kota)}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDesaList(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data desa");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      fetchDesaData(kabupatenName);
    }
  }, [id, kabupatenName, fetchDesaData]);

  const fetchDesaDetail = useCallback(async () => {
    try {
      if (!id) return;

      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Token tidak ditemukan");
        return;
      }

      const [
        desaResponse,
        kegiatanResponse,
        produkResponse,
        anggotaResponse,
        kasResponse,
        laporanResponse,
      ] = await Promise.all([
        axios.get(
          `https://backend-desa-prima-dev.student.stis.ac.id/kelompok/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        axios.get(
          `https://backend-desa-prima-dev.student.stis.ac.id/komponen-kegiatan/${id}/kegiatan`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        axios.get(
          `https://backend-desa-prima-dev.student.stis.ac.id/komponen-produk/${id}/produk`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        axios.get(
          `https://backend-desa-prima-dev.student.stis.ac.id/komponen-anggota/${id}/anggota`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        axios.get(
          `https://backend-desa-prima-dev.student.stis.ac.id/komponen-kas/${id}/kas`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        axios.get(
          `https://backend-desa-prima-dev.student.stis.ac.id/komponen-laporan/${id}/laporan`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      setDesa({
        ...desaResponse.data,
        nama: desaResponse.data.nama || [],
      });
      setKegiatan(kegiatanResponse.data);
      setProduk(produkResponse.data);
      setAnggota(anggotaResponse.data);
      setKas(kasResponse.data);
      setLaporan(laporanResponse.data);
    } catch (err) {
      handleError(err, "detail desa");
      setDesa({ nama: [] });
      setKegiatan([]);
      setProduk([]);
      setAnggota([]);
      setKas([]);
      setLaporan([]);
    }
  }, [id, handleError]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (id) {
          await fetchDesaDetail();
        } else if (kabupatenName) {
          await fetchDesaData(kabupatenName);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id !== undefined) {
      loadData();
    }
  }, [id, kabupatenName, fetchDesaDetail, fetchDesaData]);

  return {
    desa,
    desaList,
    kegiatan,
    produk,
    anggota,
    kas,
    laporan,
    loading,
    error,
    fetchDesaData,
    fetchDesaDetail,
    fetchKegiatan: () => fetchData("kegiatan", setKegiatan),
    fetchProduk: () => fetchData("produk", setProduk),
    fetchAnggota: () => fetchData("anggota", setAnggota),
    fetchKas: () => fetchData("kas", setKas),
    fetchLaporan: () => fetchData("laporan", setLaporan),
    refetchAll: id ? fetchDesaDetail : () => fetchDesaData(kabupatenName),
  };
};

export default useDesaData;
