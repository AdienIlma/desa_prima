import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint, faUsers, faMapMarkerAlt, faCalendarAlt, faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import ReportDashboard from "./ReportDashboard";
import { useLocation, useParams } from "react-router-dom";
import { formatTanggal } from "../utils/format";
import toast from "react-hot-toast";

const Informasi = ({
  data = [],
  profil = [],
  chartImages, onCaptureCharts
}) => {
  const location = useLocation();
  const { nama_kabupaten } = useParams();
  const isDashboard = location.pathname === "/provinsi-dashboard";
  const isKabupaten = location.pathname.startsWith("/kabupaten-dashboard/");
  const [isGenerating, setIsGenerating] = useState(false);
  const [readyForDownload, setReadyForDownload] = useState(false);
  const [localChartImages, setLocalChartImages] = useState(chartImages);

  const handleDownloadPDF = async () => {
  const toastId = toast.loading('Mempersiapkan dokumen...', {
    style: { minWidth: '250px' },
  });

  try {
    // Capture grafik 
    toast.loading('Mengambil gambar grafik...', { id: toastId });
    const images = await onCaptureCharts();
    setLocalChartImages(images);
    
    // Render PDF
    toast.loading('Membuat dokumen PDF...', { id: toastId });
    const pdfDoc = (
      <ReportDashboard
        page="provinsi"
        profil={profil}
        data={data}
        barChartImage={images.barChart}
        doughnutChartImage={images.doughnutChart}
        barChartVerticalImage={images.barChartVertical}
        barChartAnggotaImage={images.barChartAnggota}
        barChartProdukImage={images.barChartProduk}
      />
    );

    // Konversi ke Blob
    const { pdf } = await import('@react-pdf/renderer');
    const blob = await pdf(pdfDoc).toBlob();
    const url = URL.createObjectURL(blob);

    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-desa-prima-${new Date().toISOString().slice(0,10)}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // feedback sukses
    toast.success('PDF berhasil diunduh!', { id: toastId });

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 1000);

  } catch (error) {
    toast.error(`Gagal mengunduh: ${error.message}`, { id: toastId });
    console.error('Download error:', error);
  }
};

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-600 p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {isDashboard
                ? "Program Desa Prima Provinsi D.I. Yogyakarta"
                : isKabupaten
                ? `Program Desa Prima ${nama_kabupaten.includes("Yogyakarta") ? "" : "Kabupaten "}${nama_kabupaten}`
                : "Program Desa Prima"}
            </h1>
            <p className="text-purple-100">Ringkasan informasi program</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">

<div className="flex flex-wrap gap-3 mt-4 md:mt-0">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center px-4 py-2 bg-white text-purple-600 rounded-lg shadow hover:bg-purple-50 transition-colors"
          disabled={isGenerating}
        >
          <FontAwesomeIcon icon={faPrint} className="mr-2" />
          Unduh PDF
        </button>
      </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-4">
    <div className="flex items-start">
      <div className="w-12 mr-3 flex justify-center"> {/* Fixed width container */}
        <FontAwesomeIcon icon={faCalendarAlt} className="mt-2 text-3xl text-purple-600" />
      </div>
      <div className="flex-1">
        <h3 className="text-gray-500 text-sm font-medium">Periode Pembentukan</h3>
        <p className="text-gray-800 font-semibold">
          {formatTanggal(data.tanggal_awal)} - {formatTanggal(data.tanggal_akhir)}
        </p>
      </div>
    </div>

    <div className="flex items-start">
      <div className="w-12 mr-3 flex justify-center">
        <FontAwesomeIcon icon={faUsers} className="mt-2 text-3xl text-purple-600" />
      </div>
      <div className="flex-1">
        <h3 className="text-gray-500 text-sm font-medium">Jumlah Pelaku Usaha</h3>
        <p className="text-gray-800 font-semibold">{data.jumlahAnggota}</p>
      </div>
    </div>

    <div className="flex items-start">
      <div className="w-12 mr-3 flex justify-center">
        <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-2 text-3xl text-purple-600" />
      </div>
      <div className="flex-1">
        <h3 className="text-gray-500 text-sm font-medium">Total Kelompok Desa Prima</h3>
        <p className="text-gray-800 font-semibold">{data.totalJumlahKelompok}</p>
      </div>
    </div>

    <div className="flex items-start">
      <div className="w-12 mr-3 flex justify-center">
        <FontAwesomeIcon icon={faBoxOpen} className="mt-2 text-3xl text-purple-600" />
      </div>
      <div className="flex-1">
        <h3 className="text-gray-500 text-sm font-medium">Jumlah Produk</h3>
        <p className="text-gray-800 font-semibold">
  {data.produkPerDesa || 0}
</p>
      </div>
    </div>
  </div>

          {/* Right Column - Status Kelompok */}
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Kelompok Maju</h3>
                  <p className="text-gray-800 font-semibold">{data.desaMaju}</p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Maju
                </span>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Kelompok Berkembang</h3>
                  <p className="text-gray-800 font-semibold">{data.desaBerkembang}</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  Berkembang
                </span>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Kelompok Tumbuh</h3>
                  <p className="text-gray-800 font-semibold">{data.desaTumbuh}</p>
                </div>
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  Tumbuh
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Informasi;