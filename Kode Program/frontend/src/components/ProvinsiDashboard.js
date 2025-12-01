import React, { useEffect, useState } from "react";
import { Audio } from "react-loader-spinner";
import Header from "./Dashboard/HeaderDashboard";
import DashboardComponent from "./Dashboard/DashboardComponent";
import useProvinsiData from "./hooks/useProvinsiData";
import useUserData from "./hooks/useUserData";
import useDesaData from "./hooks/useDesaData";

const ProvinsiDashboard = () => {
  const { profil, loading: loadingProfil, error: errorProfil } = useUserData();
  const { loading: loadingDesa, error: errorDesa, desaList } = useDesaData();
  const { loading, error, provinsi } = useProvinsiData();

  // Gunakan state untuk menampung status loading gabungan
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // Jika semua loading selesai, sembunyikan loader
    if (!loading && !loadingProfil && !loadingDesa) {
      setShowLoader(false);
    }
  }, [loading, loadingProfil, loadingDesa]);

  const hasError = error || errorProfil || errorDesa;

  useEffect(() => {
    if (hasError) {
      console.error('Error occurred:', { error, errorProfil, errorDesa });
      setShowLoader(false);
    }
  }, [hasError]);

  if (showLoader) {
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
      <Header profil={profil} />
      <div className="p-5">
        <DashboardComponent
          data={provinsi}
          lineChartData={desaList}
          profil={profil}
          barChartData={provinsi.dataGabungan}
          dataPelaporan={provinsi.pelaporanData}
          dataAnggotaChart={provinsi.dataGabunganLengkap}
        />
      </div>
    </>
  );
};

export default ProvinsiDashboard;