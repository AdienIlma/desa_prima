import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  DoughnutController,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import html2canvas from "html2canvas";
import DoughnutChart from "../Chart/DoughnutChart";
import BarChart from "../Chart/BarChartHorizontal";
import BarChartPeriodik from "../Chart/BarChartPeriodik";
import BarChartAnggotaKumulatif from "../Chart/BarChartAnggota";
import BarChartprodukKumulatif from "../Chart/BarChartProduk";
import Informasi from "./Informasi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  DoughnutController,
  ChartDataLabels
);

const DashboardComponent = ({
  data,
  barChartData = [],
  profil,
  dataAnggotaChart,
  dataPelaporan
}) => {
  const [chartImages, setChartImages] = useState({
    barChart: null,
    doughnutChart: null,
    barChartVertical: null,
    barChartAnggota: null,
    barChartProduk: null
  });

  const captureCharts = async () => {
  try {
    const images = {};
    const charts = [
      { ref: 'barChart', selector: '.bar-chart-container canvas' },
      { ref: 'doughnutChart', selector: '.doughnut-chart-container canvas' },
      { ref: 'barChartVertical', selector: '.bar-chart-vertical-container canvas' },
      { ref: 'barChartAnggota', selector: '.bar-chart-anggota-container canvas' },
      { ref: 'barChartProduk', selector: '.bar-chart-produk-container canvas' }
    ];

    // Tambahkan delay antara capture
    for (const chart of charts) {
      const canvas = document.querySelector(chart.selector);
      if (canvas) {
        await new Promise(resolve => setTimeout(resolve, 300)); // Delay antar chart
        const newCanvas = await html2canvas(canvas, {
          scale: 3, // Tingkatkan scale
          logging: true,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null
        });
        images[chart.ref] = newCanvas.toDataURL("image/png", 1.0);
      }
    }

    return images;
  } catch (error) {
    console.error("Error capturing charts:", error);
    throw error;
  }
};

  return (
    <>
      <div>
        <Informasi
          data={data}
          profil={profil}
          chartImages={chartImages}
          onCaptureCharts={captureCharts}
        />
      </div>

      <div className="py-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white shadow-md p-6 rounded-md bar-chart-container">
          <BarChart data={barChartData} />
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white shadow-md p-6 rounded-md doughnut-chart-container">
          <DoughnutChart data={data} />
        </div>
      </div>
      <div className="py-5 grid grid-cols-1 gap-5">
        <div className="bar-chart-vertical-container">
          <BarChartPeriodik data={barChartData || []} />
        </div>
        <div className="bar-chart-anggota-container">
          <BarChartAnggotaKumulatif data={barChartData} />
        </div>
        <div className="bar-chart-produk-container">
          <BarChartprodukKumulatif data={barChartData} />
        </div>
      </div>
    </>
  );
};

export default DashboardComponent;
