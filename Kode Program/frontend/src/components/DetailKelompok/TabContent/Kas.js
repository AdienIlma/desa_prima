import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";

const KasDesa = ({
  kas, 
  onAdd,
  desa = {},
  profil = {},
  highlightId,
}) => {
  // Pastikan kas selalu array
  const safeKas = Array.isArray(kas) ? kas : [];

  const isPengurus = profil?.role === "Pengurus";
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const highlightedRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (highlightId && highlightedRef.current && isInitialLoad) {
      setTimeout(() => {
        highlightedRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setIsInitialLoad(false);
      }, 500);
    }
  }, [highlightId, safeKas]); // Gunakan safeKas

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID").format(amount);
  };

  const calculateFinancialSummary = () => {
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  // Gunakan safeKas yang sudah divalidasi
  const last30DaysTransactions = safeKas.filter((item) => {
    const transactionDate = new Date(item.tgl_transaksi);
    return transactionDate >= thirtyDaysAgo && transactionDate <= now;
  });

  // Cek apakah desa baru dibentuk dalam sebulan terakhir
  const tglPembentukan = new Date(desa.tanggal_pembentukan || now);
  const isDesaBaru = (now - tglPembentukan) <= (30 * 24 * 60 * 60 * 1000); 

  // Hitung total pemasukan
  let totalIncome = last30DaysTransactions
    .filter((item) => item.jenis_transaksi === "Pemasukan")
    .reduce((sum, item) => sum + (item.total_transaksi || 0), 0);

  // Tambahkan hibah hanya jika desa baru
  if (isDesaBaru) {
    totalIncome += (Number(desa.jumlah_hibah_diterima) || 0);
  }

  const totalExpense = last30DaysTransactions
    .filter((item) => item.jenis_transaksi === "Pengeluaran")
    .reduce((sum, item) => sum + (item.total_transaksi || 0), 0);

  const balance = totalIncome - totalExpense;

  const percentageUsed =
    totalIncome > 0
      ? Math.min(Math.round((totalExpense / totalIncome) * 100), 100)
      : 0;

  return {
    startDate: thirtyDaysAgo,
    endDate: now,
    totalIncome,
    totalExpense,
    balance,
    transactionCount: last30DaysTransactions.length,
    percentageUsed,
    isDesaBaru, 
  };
};

  const formatDate = (date) => {
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const financialSummary = calculateFinancialSummary();

  return (
    <div className="overflow-hidden h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
        <h2 className="text-sm md:text-lg font-semibold text-gray-800 flex items-center gap-1 md:gap-2">
          <FontAwesomeIcon
            icon={faCalendarAlt}
            className="text-purple-400 text-xl md:text-2xl pr-2"
          />
          <span className="text-md md:text-lg">
            Catatan Keuangan (30 Hari Terakhir)
          </span>
        </h2>
        {isPengurus && (
          <button
            onClick={() => onAdd("kas", desa)}
            className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 bg-purple-600 text-white rounded-lg hover:opacity-90 shadow-md text-xs md:text-sm"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xs md:text-sm" />
            <span>Tambah</span>
          </button>
        )}
      </div>

      {/* Financial Summary */}
      <div className="p-3 md:p-6 bg-white text-gray-800">
        <div className="text-xs md:text-sm mb-2 text-gray-600">
          Periode:{" "}
          <span className="font-semibold">
            {formatDate(financialSummary.startDate)} -{" "}
            {formatDate(financialSummary.endDate)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-6 items-center">
          {/* Responsive Donut Chart */}
          <div className="col-span-2 flex justify-center">
            <div className="relative w-24 h-24 md:w-40 md:h-40">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={
                    financialSummary.percentageUsed > 60 ? "#ef4444" : "#10b981"
                  }
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(
                    financialSummary.percentageUsed * 2.83
                  ).toFixed(2)} ${(100 * 2.83).toFixed(2)}`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg md:text-2xl font-bold">
                  {financialSummary.percentageUsed}%
                </span>
                <span className="text-xs md:text-sm text-gray-500">
                  Pengeluaran
                </span>
              </div>
            </div>
          </div>

          {/* Financial Info */}
          <div className="col-span-3 space-y-2 md:space-y-4">
            <div className="border-b pb-1 md:pb-2">
              <div className="text-xs md:text-sm text-gray-600">
                Total Pemasukan
              </div>
              <div className="text-sm md:text-lg font-bold text-green-600">
                Rp {formatCurrency(financialSummary.totalIncome)}
              </div>
            </div>
            <div className="border-b pb-1 md:pb-2">
              <div className="text-xs md:text-sm text-gray-600">
                Total Pengeluaran
              </div>
              <div className="text-sm md:text-lg font-bold text-red-600">
                Rp {formatCurrency(financialSummary.totalExpense)}
              </div>
            </div>
            <div>
              <div className="text-xs md:text-sm text-gray-600">Selisih</div>
              <div
                className={`text-sm md:text-lg font-bold p-1 md:p-2 rounded-md ${
                  financialSummary.balance >= 0
                    ? "text-green-600 bg-green-50"
                    : "text-red-600 bg-red-50"
                }`}
              >
                {financialSummary.balance < 0 ? "-" : ""}Rp{" "}
                {formatCurrency(Math.abs(financialSummary.balance))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default KasDesa;
