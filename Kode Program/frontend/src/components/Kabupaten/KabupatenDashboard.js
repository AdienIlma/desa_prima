import React, { useState, useEffect } from "react";
import { useParams} from "react-router-dom";
import { Audio } from "react-loader-spinner";
import DashboardComponent from "../Dashboard/DashboardComponent";
import Header from "../Dashboard/HeaderDashboard";
import useProvinsiData from "../hooks/useProvinsiData";
import useUserData from "../hooks/useUserData";
import useDesaData from "../hooks/useDesaData";
import useKabupatenData from "./hook/useKabupatenData";

  // Fungsi untuk memetakan nama kabupaten
  const mapForKabupaten = (nama) => {
    const mapping = {
      "KAB. KULON PROGO": "Kulon Progo",
      "KAB. SLEMAN": "Sleman",
      "KAB. BANTUL": "Bantul",
      "KOTA YOGYAKARTA": "Kota Yogyakarta",
      "KAB. GUNUNGKIDUL": "Gunungkidul",
    };
    return mapping[nama] || nama;
  };
  
const KabupatenDashboard = () => {
  const { nama_kabupaten } = useParams();
 const { profil, loading: loadingProfil, error: errorProfil } = useUserData();
const { loading, error, provinsi } = useProvinsiData(nama_kabupaten);
const { loading: loadingDesa, error: errorDesa, desaList } = useDesaData(nama_kabupaten);
const { getKabupatenByName, loading: loadingKab, error: errorKab } = useKabupatenData();
  
  const [kabupaten, setKabupaten] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getKabupatenByName(nama_kabupaten);
        setKabupaten(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [nama_kabupaten, getKabupatenByName]);

  const combinedData = {
    ...provinsi,
    tanggal_awal: kabupaten?.tanggal_awal || provinsi.tanggal_awal,
    tanggal_akhir: kabupaten?.tanggal_akhir || provinsi.tanggal_akhir,
    desaList,
    namaKabupaten: mapForKabupaten(nama_kabupaten)
  };



  console.log('Jumlah desa:', provinsi.jumlah_desa);
console.log('Data gabungan:', provinsi.dataGabungan);

  const isLoading = loading || loadingProfil || loadingDesa || loadingKab;
    const hasError = error || errorProfil || errorDesa || errorKab;
  
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <Audio type="Bars" color="#542d48" height={80} width={80} />
        </div>
      );
    }
  
    if (hasError) {
      return <div className="text-center text-xl text-red-500">{hasError}</div>;
    }

  return (
    <>
      {profil.role === "Pendamping" && (
        <Header profil={profil} />
      )}
      <div className="p-5">
        <DashboardComponent
          data={combinedData}
          lineChartData={desaList}
          profil={profil}
          barChartData={provinsi.dataGabungan || []}
          dataPelaporan={provinsi.pelaporanData || []}
        />
      </div>
    </>
  );
};

export default KabupatenDashboard;