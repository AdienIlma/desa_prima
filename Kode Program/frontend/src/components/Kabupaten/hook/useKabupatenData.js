import { useState, useEffect } from "react";
import axios from "axios";

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

const mapKabupatenName = (nama_kabupaten) => {
  const kabupatenMapping = {
    "Kulon Progo": "KAB. KULON PROGO",
    Sleman: "KAB. SLEMAN",
    Bantul: "KAB. BANTUL",
    "Kota Yogyakarta": "KOTA YOGYAKARTA",
    Gunungkidul: "KAB. GUNUNGKIDUL",
  };

  return kabupatenMapping[nama_kabupaten] || nama_kabupaten;
};

const useKabupatenData = () => {
  const [allKabupaten, setAllKabupaten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const calculatePeriod = (desaData) => {
    const validDates = desaData
      .map((desa) => {
        try {
          return desa.tanggal_pembentukan
            ? new Date(desa.tanggal_pembentukan)
            : null;
        } catch {
          return null;
        }
      })
      .filter((date) => date && !isNaN(date.getTime()));

    if (validDates.length === 0) return { start: null, end: null };

    const formatDate = (date) =>
      date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    return {
      start: formatDate(
        new Date(Math.min(...validDates.map((d) => d.getTime())))
      ),
      end: formatDate(
        new Date(Math.max(...validDates.map((d) => d.getTime())))
      ),
    };
  };

  const fetchAllKabupaten = async () => {
    try {
      setLoading(true);

      const kabupatenResponse = await axios.get(
        `https://backend-desa-prima-dev.student.stis.ac.id/kabupaten`
      );
      const kabupatenList = kabupatenResponse.data;
      const kabupatenWithStatus = await Promise.all(
        kabupatenList.map(async (kab) => {
          try {
            const mappedName = mapKabupatenName(kab.nama_kabupaten);
            const desaResponse = await axios.get(
              `https://backend-desa-prima-dev.student.stis.ac.id/kelompok?kabupaten=${mappedName}`
            );
            let status = "disetujui";
            const kelompokDesa = desaResponse.data || [];
            const period = calculatePeriod(kelompokDesa);

            for (const desa of kelompokDesa) {
              if (desa.status === "Ditolak") {
                status = "perlu-perhatian";
                break;
              } else if (desa.status === "Pending") {
                status = "perlu-ditinjau";
              }
            }

            return {
              ...kab,
              status,
              tanggal_awal: period.start, // Pastikan ini ditambahkan
              tanggal_akhir: period.end,
              jumlahKelompok: kelompokDesa.length,
              jumlahMaju: kelompokDesa.filter((d) => d.kategori === "Maju")
                .length,
              jumlahBerkembang: kelompokDesa.filter(
                (d) => d.kategori === "Berkembang"
              ).length,
              jumlahTumbuh: kelompokDesa.filter((d) => d.kategori === "Tumbuh")
                .length,
            };
          } catch (err) {
            console.error(
              `Error processing kabupaten ${kab.nama_kabupaten}:`,
              err
            );
            return {
              ...kab,
              status: "tidak-diketahui",
              tanggal_awal: null,
              tanggal_akhir: null,
              jumlahKelompok: 0,
              jumlahMaju: 0,
              jumlahBerkembang: 0,
              jumlahTumbuh: 0,
            };
          }
        })
      );

      setAllKabupaten(kabupatenWithStatus);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching kabupaten data:", err);
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  const getKabupatenByName = async (nama_kabupaten) => {
    try {
      setLoading(true);
      const cachedKabupaten = allKabupaten.find(
        (k) => k.nama_kabupaten.toLowerCase() === nama_kabupaten.toLowerCase()
      );

      if (cachedKabupaten) {
        return cachedKabupaten;
      }
      const response = await axios.get(
        `https://backend-desa-prima-dev.student.stis.ac.id/kabupaten/detail/${encodeURIComponent(
          nama_kabupaten
        )}`
      );

      const mappedName = mapKabupatenName(response.data.nama_kabupaten);
      const desaResponse = await axios.get(
        `https://backend-desa-prima-dev.student.stis.ac.id/kabupaten?kabupaten=${mappedName}`
      );

      const period = calculatePeriod(desaResponse.data);

      const kabupatenWithPeriod = {
        ...response.data,
        tanggal_awal: period.start,
        tanggal_akhir: period.end,
      };

      setAllKabupaten((prev) => [...prev, kabupatenWithPeriod]);

      return kabupatenWithPeriod;
    } catch (error) {
      console.error("Error fetching kabupaten by name:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllKabupaten();
  }, []);

  return {
    allKabupaten,
    loading,
    error,
    getKabupatenByName,
    refetch: fetchAllKabupaten,
  };
};

export default useKabupatenData;
