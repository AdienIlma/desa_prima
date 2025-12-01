import React from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaBell,
  FaEdit,
} from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import { formattedPeriode } from "../../utils/format";

const ProgressIndicator = ({ numReal, numTarget }) => {
  const percentage = Math.min(numReal / numTarget, 1);
  const percentageDisplay = (percentage * 100).toFixed(1);

  // Color scale based on percentage
  const getColorClasses = (percentage) => {
    if (percentage < 0.25)
      return {
        bg: "bg-red-100",
        progress: "bg-red-500",
        text: "text-red-600",
        border: "border-red-300", 
      };
    if (percentage < 0.5)
      return {
        bg: "bg-yellow-100",
        progress: "bg-yellow-500",
        text: "text-yellow-600",
        border: "border-yellow-300",
      };
    if (percentage < 0.75)
      return {
        bg: "bg-blue-100",
        progress: "bg-blue-500",
        text: "text-blue-600",
        border: "border-blue-300",
      };
    if (percentage < 1)
      return {
        bg: "bg-green-100",
        progress: "bg-green-500",
        text: "text-green-600",
        border: "border-green-300",
      };
    return {
      bg: "bg-green-100",
      progress: "bg-green-500",
      text: "text-green-600",
      border: "border-green-300",
    };
  };

  const colors = getColorClasses(percentage);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex-1 h-2.5 rounded-full ${colors.bg} ${colors.border} border relative overflow-visible`}
      >
        <div
          className={`h-full rounded-full ${colors.progress} absolute top-0 left-0`}
          style={{ 
            width: `${percentage * 100}%`,
            minWidth: '2px' // Pastikan selalu terlihat meski persentase kecil
          }}
        ></div>
      </div>
      <span className={`text-sm font-semibold ${colors.text}`}>
        {percentageDisplay}%
      </span>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    disetujui: {
      icon: <FaCheckCircle className="text-green-500" />,
      bg: "bg-green-50",
      text: "text-green-700",
    },
    "perlu-perhatian": {
      icon: <FaExclamationTriangle className="text-red-500" />,
      bg: "bg-red-50",
      text: "text-red-700",
    },
    "perlu-ditinjau": {
      icon: <FaBell className="text-yellow-500" />,
      bg: "bg-yellow-50",
      text: "text-yellow-700",
    },
  };

  const config = statusConfig[status] || {};

  return (
    <div
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.icon && <span className="mr-1.5">{config.icon}</span>}
      {status.replace(/-/g, " ")}
    </div>
  );
};

const KabupatenCard = ({ kabupaten, onEdit, onClick }) => {
  const counts = kabupaten.counts || {};
  const totalKelompok =
    (kabupaten.jumlahMaju || 0) + (kabupaten.jumlahBerkembang || 0) + (kabupaten.jumlahTumbuh || 0);

  return (
    <div
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-300 overflow-hidden hover:border-purple-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-gray-800">
                {kabupaten.nama_kabupaten}
              </h2>
              {kabupaten.status && (
                <StatusBadge status={kabupaten.status} />
              )}
            </div>
            <p className="text-sm text-gray-500">{formattedPeriode(kabupaten)}</p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-gray-400 hover:text-purple-600 transition-colors p-1"
            aria-label="Edit"
          >
            <FaEdit className="text-lg" />
          </button>
        </div>

        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex">
            <span className="text-gray-500">Pendamping</span>
            <span className="font-medium text-right ml-4">
              {kabupaten.Pendamping ? kabupaten.Pendamping.name : "Tidak tersedia"}
            </span>
          </div>

          <div className="flex pb-2">
            <span className="text-gray-500">Jumlah Desa</span>
            <span className="font-medium ml-4">
              {kabupaten.jumlah_desa || 0}
            </span>
          </div>

          <div className="pt-2 border-t border-gray-300">
            <div className="grid grid-cols-3 gap-2 text-center mb-2">
              <div>
                <div className="text-xs text-gray-500 mb-1">Maju</div>
                <div className="bg-green-100 text-green-600 p-1 rounded-full text-sm font-medium">
                  {kabupaten.jumlahMaju || 0}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Berkembang</div>
                <div className="bg-yellow-100 text-yellow-600 p-1 rounded-full text-sm font-medium">
                  {kabupaten.jumlahBerkembang || 0}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Tumbuh</div>
                <div className="bg-red-100 text-red-600 p-1 rounded-full text-sm font-medium">
                  {kabupaten.jumlahTumbuh || 0}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="mb-1">
                Total Kelompok{" "}
                <span className="font-semibold">{totalKelompok} desa</span>
              </div>
              <ProgressIndicator
                numReal={totalKelompok}
                numTarget={kabupaten.jumlah_desa}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 bg-purple-600 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-white">Klik untuk detail</span>
        <FiChevronRight className="text-gray-400" />
      </div>
    </div>
  );
};

export default KabupatenCard;