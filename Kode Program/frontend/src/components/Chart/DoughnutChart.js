import React from "react";
import { Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const DoughnutChart = ({ data, chartRef }) => {
  const {
    desaMaju,
    desaBerkembang,
    desaTumbuh,
    jumlah_desa,
    totalJumlahKelompok,
  } = data;

  const colors = {
    maju: "#10B981",
    berkembang: "#F59E0B",
    tumbuh: "#EF4444",
    proses: "#94A3B8",
    textDark: "#1E293B",
    textLight: "#64748B"
  };

  const desaDalamProses = jumlah_desa - totalJumlahKelompok;
  const percentageKelompok = ((totalJumlahKelompok / jumlah_desa) * 100).toFixed(1);

  const doughnutChartData = {
    labels: ["Maju", "Berkembang", "Tumbuh", "Dalam Proses"],
    datasets: [
      {
        data: [desaMaju, desaBerkembang, desaTumbuh, desaDalamProses],
        backgroundColor: [
          colors.maju,
          colors.berkembang,
          colors.tumbuh,
          colors.proses
        ],
        borderWidth: 0,
        borderRadius: desaDalamProses > 0 ? 4 : 0, 
        spacing: 2,
      },
    ],
  };

  const doughnutChartOptions = {
    cutout: "60%", 
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateScale: true,
      animateRotate: true,
    },
    plugins: {
      tooltip: {
        enabled: true,
        backgroundColor: colors.textDark,
        titleFont: {
          size: 14,
          weight: "bold"
        },
        bodyFont: {
          size: 12
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} desa (${percentage}%)`;
          },
          title: () => null // Remove title
        }
      },
      legend: {
        position: "bottom",
        align: "center",
        labels: {
          boxWidth: 16,
          boxHeight: 16,
          padding: 16,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          color: colors.textDark,
          usePointStyle: true,
          pointStyle: "circle"
        },
        onHover: (e) => (e.native.target.style.cursor = "pointer"),
        onLeave: (e) => (e.native.target.style.cursor = "default"),
      },
      datalabels: {
        display: (context) => {
          // Only display labels for segments larger than 5% of the chart
          const value = context.dataset.data[context.dataIndex];
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = (value / total) * 100;
          return percentage > 5;
        },
        color: "#fff",
        font: {
          size: 15,
          weight: "bold",
          family: "'Inter', sans-serif"
        },
        padding: 2,
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return `${percentage}%`;
        },
      },
    },
  };

  // Center text component
  const CenterText = () => (
    <div className="mb-12 absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span className="text-3xl font-bold" style={{ color: colors.textDark }}>
        {percentageKelompok}%
      </span>
      <span className="text-sm" style={{ color: colors.textLight }}>
        Kelompok Desa
      </span>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <h2 className="text-lg font-semibold text-center mb-4" style={{ color: colors.textDark }}>
        Distribusi Desa Berdasarkan Kategori
      </h2>
      <div className="relative w-full h-[300px] lg:h-[350px]">
        <Doughnut
          ref={chartRef}
          data={doughnutChartData}
          options={doughnutChartOptions}
        />
        <CenterText />
      </div>
      <div className="mt-2 text-xs text-center" style={{ color: colors.textLight }}>
        Total {jumlah_desa} desa | {totalJumlahKelompok} desa terkategori
      </div>
    </div>
  );
};

export default DoughnutChart;