import React, { useRef, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartContainer from "./ChartContainer";
import LocationYearFilters from "./LocationYearFilters";
import { useLocationYearFilters } from "./hooks/useLocationYearFilter";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BarChart = ({ data }) => {
  const chartRef = useRef(null);
  const {
    filters,
    filterOptions,
    isSingleKabupaten,
    isSingleKecamatan,
    handleFilterChange
  } = useLocationYearFilters(data, 'kelompokId', 'tgl_lapor');

  // Fungsi untuk memfilter data
  const filterData = useCallback(() => {
    if (!data || data.length === 0) return [];
    
    return data.filter(item => {
      if (!item.kelompokId || !item.tgl_lapor) return false;
      
      const date = new Date(item.tgl_lapor);
      if (isNaN(date.getTime())) return false;
      
      if (filters.tahun !== "Semua") {
        const itemYear = date.getFullYear();
        if (itemYear.toString() !== filters.tahun) return false;
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

  const calculateCategoryCounts = () => {
    const filteredData = filterData();
    const latestDataPerDesa = {};
    
    filteredData.forEach(item => {
      if (!latestDataPerDesa[item.kelompokId] || 
          new Date(item.tgl_lapor) > new Date(latestDataPerDesa[item.kelompokId].tgl_lapor)) {
        latestDataPerDesa[item.kelompokId] = item;
      }
    });
    
    const latestData = Object.values(latestDataPerDesa);
    
    const counts = {
      maju: latestData.filter(item => item.kategori === "Maju").length,
      berkembang: latestData.filter(item => item.kategori === "Berkembang").length,
      tumbuh: latestData.filter(item => item.kategori === "Tumbuh").length,
    };
    
    counts.total = counts.maju + counts.berkembang + counts.tumbuh;
    
    return counts;
  };

  const categoryCounts = calculateCategoryCounts();

  const chartData = {
    labels: ["Maju", "Berkembang", "Tumbuh", "Total"],
    datasets: [{
      label: "Jumlah Desa",
      data: [
        categoryCounts.maju,
        categoryCounts.berkembang,
        categoryCounts.tumbuh,
        categoryCounts.total
      ],
      backgroundColor: [
        "rgba(40, 167, 69, 0.6)",
        "rgba(255, 206, 86, 0.6)",
        "rgba(220, 53, 69, 0.6)",
        "rgba(54, 162, 235, 0.6)"
      ],
      borderColor: [
        "rgba(40, 167, 69, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(220, 53, 69, 1)",
        "rgba(54, 162, 235, 1)"
      ],
      borderWidth: 1
    }]
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw} Desa`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Jumlah Desa",
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      },
      y: {
        title: {
          display: true,
          text: "Kategori Desa",
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      }
    }
  };

  return (
    <ChartContainer 
      title="Jumlah Desa per Kategori"
      description="Data jumlah desa per kategori berdasarkan filter yang dipilih"
      downloadFileName="bar-chart-desa.png"
    >
      <LocationYearFilters
        filters={filters}
        filterOptions={filterOptions}
        isSingleKabupaten={isSingleKabupaten}
        isSingleKecamatan={isSingleKecamatan}
        onFilterChange={handleFilterChange}
        className="mb-4"
        size="sm"
      />
      
      <div className="relative h-[400px]">
        <Bar 
          ref={chartRef}
          data={chartData} 
          options={chartOptions} 
        />
      </div>
    </ChartContainer>
  );
};

export default BarChart;