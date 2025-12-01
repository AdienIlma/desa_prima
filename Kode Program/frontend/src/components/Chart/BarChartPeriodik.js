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

const BarChartVertical = ({ data = [] }) => {
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
    if (!Array.isArray(data)) return [];

    const uniqueGroups = new Set();
    const result = [];

    data.forEach((item) => {
      if (!item) return;

      if (filters.kabupaten_kota !== "Semua" && item.kabupaten_kota !== filters.kabupaten_kota) {
        return;
      }
      
      if (filters.kecamatan !== "Semua" && item.kecamatan !== filters.kecamatan) {
        return;
      }
      
      if (filters.tahun !== "Semua") {
        const date = new Date(item.tgl_lapor);
        const year = date.getFullYear();
        if (!year || year.toString() !== filters.tahun) return;
      }

      if (item.kelompokId && !uniqueGroups.has(item.kelompokId)) {
        uniqueGroups.add(item.kelompokId);
        result.push(item);
      }
    });

    return result;
  }, [data, filters]);

  // Fungsi untuk mengelompokkan data per tahun
  const groupByYear = useCallback(() => {
    const filteredData = filterData();
    if (!Array.isArray(filteredData) || filteredData.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Get all unique years
    const allYears = [
      ...new Set(
        filteredData
          .map((item) => {
            const date = item.tanggal_pembentukan || item.tgl_lapor;
            const year = new Date(date).getFullYear();
            return isNaN(year) ? null : year;
          })
          .filter((year) => year !== null)
      ),
    ].sort((a, b) => a - b);

    if (allYears.length === 0) return { labels: [], datasets: [] };

    // Calculate cumulative data
    const cumulativeData = {
      maju: {},
      berkembang: {},
      tumbuh: {},
      total: {},
    };

    let cumulativeMaju = 0;
    let cumulativeBerkembang = 0;
    let cumulativeTumbuh = 0;
    let cumulativeTotal = 0;

    allYears.forEach((year) => {
      const yearlyData = filteredData.filter((item) => {
        const date = item.tanggal_pembentukan || item.tgl_lapor;
        return new Date(date).getFullYear() === year;
      });

      const majuThisYear = yearlyData.filter((d) => d.kategori === "Maju").length;
      const berkembangThisYear = yearlyData.filter((d) => d.kategori === "Berkembang").length;
      const tumbuhThisYear = yearlyData.filter((d) => d.kategori === "Tumbuh").length;
      const totalThisYear = majuThisYear + berkembangThisYear + tumbuhThisYear;

      cumulativeMaju += majuThisYear;
      cumulativeBerkembang += berkembangThisYear;
      cumulativeTumbuh += tumbuhThisYear;
      cumulativeTotal += totalThisYear;

      cumulativeData.maju[year] = cumulativeMaju;
      cumulativeData.berkembang[year] = cumulativeBerkembang;
      cumulativeData.tumbuh[year] = cumulativeTumbuh;
      cumulativeData.total[year] = cumulativeTotal;
    });

    const labels = allYears.map((year) => year.toString());
    const datasets = [];

    datasets.push({
      label: "Maju",
      data: labels.map((year) => cumulativeData.maju[year] || 0),
      backgroundColor: "rgba(40, 167, 69, 0.6)",
      borderColor: "rgba(40, 167, 69, 1)",
      borderWidth: 1,
    });

    datasets.push({
      label: "Berkembang",
      data: labels.map((year) => cumulativeData.berkembang[year] || 0),
      backgroundColor: "rgba(255, 206, 86, 0.6)",
      borderColor: "rgba(255, 206, 86, 1)",
      borderWidth: 1,
    });

    datasets.push({
      label: "Tumbuh",
      data: labels.map((year) => cumulativeData.tumbuh[year] || 0),
      backgroundColor: "rgba(220, 53, 69, 0.6)",
      borderColor: "rgba(220, 53, 69, 1)",
      borderWidth: 1,
    });

    datasets.push({
      label: "Total",
      data: labels.map((year) => cumulativeData.total[year] || 0),
      backgroundColor: "rgba(54, 162, 235, 0.6)",
      borderColor: "rgba(54, 162, 235, 1)",
      borderWidth: 1,
    });

    return { labels, datasets };
  }, [filterData]);

  const chartData = groupByYear();

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw} Desa`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Tahun",
        },
      },
      y: {
        title: {
          display: true,
          text: "Jumlah Desa (Kumulatif)",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <ChartContainer 
      title="Perkembangan Kumulatif Desa per Tahun"
      description="Data perkembangan kumulatif desa berdasarkan tahun pembentukan"
      downloadFileName="bar-chart-kumulatif.png"
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

export default BarChartVertical;