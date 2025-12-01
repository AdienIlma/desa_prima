import React, { useRef, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { useLocationYearFilters } from "./hooks/useLocationYearFilter";
import LocationYearFilters from "./LocationYearFilters"
import ChartContainer from "./ChartContainer";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BarChartAnggotaKumulatif = ({ data }) => {
 
  const chartRef = useRef(null);
  const {
    filters,
    filterOptions,
    isSingleKabupaten,
    isSingleKecamatan,
    handleFilterChange
  } = useLocationYearFilters(data, 'anggotaId', 'tgl_lapor');

   // Fungsi untuk memfilter data
  const filterData = useCallback(() => {
    if (!data || data.length === 0) return [];
    
    return data.filter(item => {
      if (!item.anggotaId || !item.tgl_lapor) return false;
      
      const date = new Date(item.tgl_lapor);
      if (isNaN(date.getTime())) return false;
      
      if (filters.tahun !== "Semua" && date.getFullYear().toString() !== filters.tahun) {
        return false;
      }
      
      if (filters.kabupaten_kota !== "Semua" && item.kabupaten_kota !== filters.kabupaten_kota) {
        return false;
      }
      
      if (filters.kecamatan !== "Semua" && item.kecamatan !== filters.kecamatan) {
        return false;
      }
      
      return true;
    });
  }, [data, filters]);

const hitungKumulatifAnggota = useCallback(() => {
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
        anggotaUnik: new Set()
      };
    }
    
    acc[periodeKey].anggotaUnik.add(item.anggotaId);
    return acc;
  }, {});

  const periodeArray = Object.values(dataPerPeriode)
    .sort((a, b) => a.tahun - b.tahun || a.bulan - b.bulan);

  let kumulatif = 0;
  const labels = [];
  const dataKumulatif = [];

  periodeArray.forEach(periode => {
    kumulatif += periode.anggotaUnik.size;
    labels.push(
      new Date(periode.tahun, periode.bulan, 1)
        .toLocaleString('default', { month: 'short', year: 'numeric' })
    );
    dataKumulatif.push(kumulatif);
  });

  return {
    labels,
    datasets: [{
      label: `Jumlah Anggota (Kumulatif) ${filters.tahun !== "Semua" ? filters.tahun : ''}`,
      data: dataKumulatif,
      backgroundColor: "rgba(75, 192, 192, 0.6)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1
    }]
  };
}, [filterData, filters.tahun]);

const chartData = hitungKumulatifAnggota(); 

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
            return `Total anggota: ${context.raw}`;
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
          text: "Jumlah anggota (Kumulatif)"
        },
        beginAtZero: true
      }
    }
  };

  return (
    <ChartContainer 
      title="Perkembangan Kumulatif Jumlah Pelaku Usaha"
      description="Data perkembangan kumulatif jumlah pelaku usaha berdasarkan periode laporan"
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

export default BarChartAnggotaKumulatif;