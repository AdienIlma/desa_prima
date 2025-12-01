import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Audio } from "react-loader-spinner";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";

const JENIS_TRANSAKSI = {
  Pengeluaran: "Pengeluaran",
  Pemasukan: "Pemasukan",
};

const jenisOptions = Object.entries(JENIS_TRANSAKSI).map(([key, value]) => ({
  value,
  label: value,
}));

const FormKasModal = ({ isOpen, onClose, selectedDesa, initialData }) => {
  const [formData, setFormData] = useState({
    tgl_transaksi: "",
    jenis_transaksi: "",
    nama_transaksi: "",
    total_transaksi: "",
    total_transaksi_numeric: 0,
    userId: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];
  const isEdit = Boolean(initialData);

  // Fungsi untuk format ribuan
  const formatRibuan = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          tgl_transaksi: initialData.tgl_transaksi
            ? new Date(initialData.tgl_transaksi).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          jenis_transaksi: initialData.jenis_transaksi || "",
          nama_transaksi: initialData.nama_transaksi || "",
          total_transaksi:
            formatRibuan(initialData.total_transaksi?.toString()) || "",
          total_transaksi_numeric: initialData.total_transaksi || 0,
          userId: user.id,
        });
      } else {
        setFormData({
          tgl_transaksi: "",
          jenis_transaksi: "",
          nama_transaksi: "",
          total_transaksi: "",
          total_transaksi_numeric: 0,
          userId: user.id,
        });
      }
      setFile(null);
      setError("");
      setSubmitted(false);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "total_transaksi") {
      const numericValue = value.replace(/[^0-9]/g, "");
      const formattedValue = formatRibuan(numericValue);

      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
        total_transaksi_numeric: numericValue ? parseInt(numericValue, 10) : 0,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileType = e.target.files[0].type;
      if (fileType !== "application/pdf") {
        setError("Hanya format PDF yang diperbolehkan");
        return;
      }
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const {
      jenis_transaksi,
      nama_transaksi,
      total_transaksi_numeric,
      tgl_transaksi,
      userId,
    } = formData;

    // Validation
    if (
      !jenis_transaksi ||
      !nama_transaksi.trim() ||
      !total_transaksi_numeric ||
      !tgl_transaksi
    ) {
      setError("Semua kolom wajib diisi dengan benar.");
      return;
    }

    if (!selectedDesa?.id) {
      toast.error("Data desa belum dipilih atau tidak valid.");
      return;
    }

    setLoading(true);
    try {
      const formPayload = new FormData();
      formPayload.append("tgl_transaksi", tgl_transaksi);
      formPayload.append("jenis_transaksi", jenis_transaksi);
      formPayload.append("nama_transaksi", nama_transaksi);
      formPayload.append("total_transaksi", total_transaksi_numeric);
      formPayload.append("userId", user.id);
      if (file) formPayload.append("file", file);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      if (isEdit) {
        await axios.put(
          `https://backend-desa-prima-dev.student.stis.ac.id/komponen-kas/${selectedDesa.id}/kas/${initialData.id}`,
          formPayload,
          config
        );
        toast.success(`Data kas ${nama_transaksi} berhasil diperbarui!`);
      } else {
        await axios.post(
          `https://backend-desa-prima-dev.student.stis.ac.id/komponen-kas/${selectedDesa.id}/kas`,
          formPayload,
          config
        );
        toast.success(`Data kas ${nama_transaksi} berhasil ditambahkan!`);
      }
      onClose(true);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan dalam proses penyimpanan data";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Transition
      show={isOpen}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 bg-gray-400 bg-opacity-50 flex justify-center items-center text-left z-50 p-4">
        {loading ? (
          <div className="flex items-center justify-center">
            <Audio type="Bars" color="#542d48" height={80} width={80} />
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md relative max-h-[83vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <h2 className="text-xl font-semibold mb-4">
              {isEdit ? "Edit Data Kas" : "Tambah Data Kas"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="relative mb-2">
                <label className="block text-sm font-medium text-gray-900">
                  Tanggal Transaksi
                </label>
                <label
                  className={`block text-xs ${
                    submitted && !formData.tgl_transaksi
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  Pilih tanggal transaksi
                </label>
                <input
                  type="date"
                  name="tgl_transaksi"
                  max={today}
                  value={formData.tgl_transaksi}
                  onChange={handleChange}
                  className={`cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                    submitted && !formData.tgl_transaksi
                      ? "ring-2 ring-inset ring-red-600"
                      : "ring-1 ring-inset ring-gray-300"
                  } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                />
              </div>

              <div className="relative mb-2">
                <label className="block text-sm font-medium text-gray-900">
                  Jenis Transaksi
                </label>
                <label
                  className={`block text-xs ${
                    submitted && !formData.jenis_transaksi
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  Pilih jenis transaksi
                </label>
                <select
                  name="jenis_transaksi"
                  value={formData.jenis_transaksi}
                  onChange={handleChange}
                  className={`cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                    submitted && !formData.jenis_transaksi
                      ? "ring-2 ring-inset ring-red-600"
                      : "ring-1 ring-inset ring-gray-300"
                  } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                >
                  <option value=""> Pilih jenis transaksi</option>
                  {jenisOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative mb-2">
                <label className="block text-sm font-medium text-gray-900">
                  Nama Transaksi
                </label>
                <label
                  className={`block text-xs ${
                    submitted && !formData.nama_transaksi
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  Tuliskan nama transaksi
                </label>
                <input
                  type="text"
                  name="nama_transaksi"
                  value={formData.nama_transaksi}
                  onChange={handleChange}
                  className={`cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                    submitted && !formData.nama_transaksi
                      ? "ring-2 ring-inset ring-red-600"
                      : "ring-1 ring-inset ring-gray-300"
                  } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                />
              </div>

              <div className="relative mb-2">
                <label className="block text-sm font-medium text-gray-900">
                  Total Transaksi
                </label>
                <label
                  className={`block text-xs ${
                    submitted && !formData.total_transaksi
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  Masukkan jumlah transaksi
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
                    Rp
                  </span>
                  <input
                    type="text"
                    name="total_transaksi"
                    value={formData.total_transaksi}
                    onChange={handleChange}
                    className={`cursor-pointer block w-full rounded-md border-0 py-2 pl-10 pr-2 mt-1 text-gray-900 shadow-sm ${
                      submitted && !formData.total_transaksi
                        ? "ring-2 ring-inset ring-red-600"
                        : "ring-1 ring-inset ring-gray-300"
                    } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                  />
                </div>
              </div>

              <div className="relative mb-2">
                <label
                  htmlFor="file"
                  className="block text-sm font-medium text-gray-900"
                >
                  Upload File Pendukung
                </label>
                <label
                  className={`block text-xs ${
                    submitted && !file ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  Unggah file dengan format .pdf (Maks. 5MB)
                </label>
                <input
                  type="file"
                  id="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className={`cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                    submitted && !file
                      ? "ring-2 ring-inset ring-red-600"
                      : "ring-1 ring-inset ring-gray-300"
                  } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                />
                {file && (
                  <p className="text-xs text-green-600 mt-1">
                    File dipilih: {file.name}
                  </p>
                )}
              </div>

              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

              <div className="w-full flex justify-end pt-3 pb-1">
                <button
                  type="button"
                  onClick={() => onClose(false)}
                  className="w-2/12 text-sm bg-red-200 mr-2 text-red-600 font-semibold py-1 px-2 rounded-md shadow-sm hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/12 text-sm bg-blue-200 text-blue-600 font-semibold py-1 px-2 rounded-md shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {loading ? "Menyimpan..." : isEdit ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Transition>
  );
};

FormKasModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedDesa: PropTypes.object,
  initialData: PropTypes.object,
};

export default FormKasModal;
