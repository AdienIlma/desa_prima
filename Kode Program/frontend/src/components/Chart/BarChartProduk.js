import React, { useRef, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { useLocationYearFilters } from "./hooks/useLocationYearFilter";
import LocationYearFilters from "./LocationYearFilters"
import ChartContainer from "./ChartContainer";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BarChartprodukKumulatif = ({ data }) => {
  const chartRef = useRef(null);
  const {
      filters,
      filterOptions,
      isSingleKabupaten,
      isSingleKecamatan,
      handleFilterChange
    } = useLocationYearFilters(data, 'produkId', 'tgl_lapor');

         // Fungsi untuk memfilter data
       const filterData = useCallback(() => {
         if (!data || data.length === 0) return [];
         
         return data.filter(item => {
           // Validasi dasar
           if (!item.produkId || !item.tgl_lapor) return false;
           
           // Parse tanggal
           const date = new Date(item.tgl_lapor);
           if (isNaN(date.getTime())) return false;
           
           // Filter tahun (perbaikan utama)
           if (filters.tahun !== "Semua") {
             const itemYear = date.getFullYear();
             if (itemYear.toString() !== filters.tahun) return false;
           }
           
           // Filter kabupaten
           if (filters.kabupaten_kota !== "Semua" && item.kabupaten_kota !== filters.kabupaten_kota) {
             return false;
           }
           
           // Filter kecamatan
           if (filters.kecamatan !== "Semua" && item.kecamatan !== filters.kecamatan) {
             return false;
           }
           
           return true;
         });
       }, [data, filters]);

  // Fungsi untuk menghitung kumulatif produk per periode
  const hitungKumulatifproduk = () => {
    const filteredData = filterData();
  if (!filteredData || filteredData.length === 0) {
    return { labels: [], datasets: [] };
  }
  
    const dataPerPeriode = filteredData.reduce((acc, item) => {
     const date = new Date(item.tgl_lapor);
    const tahun = date.getFullYear();
    const bulan = date.getMonth();
    const periodeKey = `${tahun}-${bulan}`;
    
    if (!acc[periodeKey]) {
      acc[periodeKey] = {
        tahun,
        bulan,
        produkUnik: new Set()
      };
    }
    
    acc[periodeKey].produkUnik.add(item.produkId);
    return acc;
    }, {});

    // Konversi ke array dan urutkan berdasarkan tanggal
    const periodeArray = Object.values(dataPerPeriode)
      .sort((a, b) => {
        if (a.tahun !== b.tahun) return a.tahun - b.tahun;
        return a.bulan - b.bulan;
      });

    // Hitung kumulatif
    let kumulatif = 0;
    const labels = [];
    const dataKumulatif = [];

    periodeArray.forEach(periode => {
      const jumlahProdukBaru = periode.produkUnik.size;
      kumulatif += jumlahProdukBaru;
      
      const namaBulan = new Date(periode.tahun, periode.bulan, 1)
        .toLocaleString('default', { month: 'short', year: 'numeric' });
      
      labels.push(namaBulan);
      dataKumulatif.push(kumulatif);
    });

    return {
      labels,
      datasets: [{
        label: "Jumlah Produk (Kumulatif)",
        data: dataKumulatif,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1
      }]
    };
  };

  const chartData = hitungKumulatifproduk();

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Total Produk: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Periode Laporan"
        }
      },
      y: {
        title: {
          display: true,
          text: "Jumlah Produk (Kumulatif)"
        },
        beginAtZero: true
      }
    }
  };

  return (
        <ChartContainer 
      title="Perkembangan Kumulatif Jumlah Jenis Usaha (Produk)"
      description="Data perkembangan kumulatif jumlah jenis usaha berdasarkan periode laporan"
      downloadFileName="bar-chart-anggota-kumulatif.png"
    >
      <LocationYearFilters
        filters={filters}
        filterOptions={filterOptions}
        isSingleKabupaten={isSingleKabupaten}
        isSingleKecamatan={isSingleKecamatan}
        onFilterChange={handleFilterChange}
        className="mb-4"
      />
      
      <div className="relative h-[400px]">
        {chartData.labels.length > 0 ? (
          <Bar 
            ref={chartRef}
            data={chartData} 
            options={chartOptions} 
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Tidak ada data yang sesuai dengan filter</p>
          </div>
        )}
      </div>
    </ChartContainer>
  );
};

export default BarChartprodukKumulatif;