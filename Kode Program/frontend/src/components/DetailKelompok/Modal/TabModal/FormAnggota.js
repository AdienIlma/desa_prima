import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Audio } from "react-loader-spinner";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";

const JABATAN = {
  Ketua: "Ketua",
  Sekretaris: "Sekretaris",
  Bendahara: "Bendahara",
  Anggota: "Anggota",
};

const jabatanOptions = Object.entries(JABATAN).map(([key, value]) => ({
  value,
  label: value,
}));

const FormAnggota = ({ isOpen, onClose, selectedDesa, initialData }) => {
  const [formData, setFormData] = useState({
    nama: "",
    jabatan: "",
    nohp: "",
    sertifikasi: "",
    userId: "",
  });
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => {
        const same =
          prev.nama === initialData.nama &&
          prev.jabatan === initialData.jabatan &&
          prev.nohp === initialData.nohp &&
          prev.userId === initialData.userId &&
          prev.sertifikasi === initialData.sertifikasi;

        if (same) return prev;

        return {
          nama: initialData.nama || "",
          jabatan: initialData.jabatan || "",
          nohp: initialData.nohp || "",
          sertifikasi: initialData.sertifikasi || "",
          userId: user.id,
        };
      });
    } else {
      setFormData({
        nama: "",
        jabatan: "",
        nohp: "",
        sertifikasi: "",
        userId: user.id,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Validasi
    if (!formData.nama.trim()) {
      setError("Harap isi nama anggota");
      return;
    }
    if (!formData.jabatan.trim()) {
      setError("Harap isi jabatan");
      return;
    }
    if (!formData.nohp.trim()) {
      setError("Harap isi nomor HP");
      return;
    }

    if (!/^\d+$/.test(formData.nohp.trim())) {
      setError("Nomor HP hanya boleh berisi angka");
      return;
    }

    setLoading(true);
    try {
      if (initialData) {
        await axios.put(
          `https://backend-desa-prima-dev.student.stis.ac.id/komponen-anggota/${selectedDesa.id}/anggota/${initialData.id}`,
          formData
        );
        toast.success(`Data anggota ${formData.nama} berhasil diperbarui!`);
      } else {
        await axios.post(
          `https://backend-desa-prima-dev.student.stis.ac.id/komponen-anggota/${selectedDesa.id}/anggota`,
          formData
        );
        toast.success(`Data anggota ${formData.nama} berhasil ditambahkan!`);
      }
      onClose(true);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
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
        <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md relative">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-lg">
              <Audio type="Bars" color="#542d48" height={80} width={80} />
            </div>
          )}

          <button
            type="button"
            onClick={() => onClose(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>

          <h2 className="text-xl font-semibold mb-4">
            {isEdit ? "Edit Anggota" : "Tambah Anggota"}
          </h2>
          <div className="relative mb-2">
            <label
              htmlFor="nama"
              className="block text-sm font-medium text-gray-900"
            >
              Nama Anggota
            </label>
            <label
              className={`block text-xs ${
                submitted && formData.nama === ""
                  ? "text-red-600"
                  : "text-gray-900"
              }`}
            >
              Tuliskan nama anggota
            </label>
            <input
              type="text"
              id="nama"
              name="nama"
              value={formData.nama || ""}
              onChange={handleChange}
              className={`cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                submitted && formData.nama === ""
                  ? "ring-2 ring-inset ring-red-600"
                  : "ring-1 ring-inset ring-gray-300"
              }  placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
            />
          </div>

          <div className="relative mb-2">
            <label
              htmlFor="jabatan"
              className="block text-sm font-medium text-gray-900"
            >
              Jabatan
            </label>
            <label
              className={`block text-xs ${
                submitted && formData.jabatan === ""
                  ? "text-red-600"
                  : "text-gray-900"
              }`}
            >
              Tuliskan jabatan anggota
            </label>
            <select
              name="jabatan"
              id="jabatan"
              value={formData.jabatan || ""}
              onChange={handleChange}
              className={`cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                submitted && formData.jabatan === ""
                  ? "ring-2 ring-inset ring-red-600"
                  : "ring-1 ring-inset ring-gray-300"
              }  placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
            >
              <option value="">Pilih Jabatan</option>
              {jabatanOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative mb-2">
            <label
              htmlFor="nohp_anggota"
              className="block text-sm font-medium text-gray-900"
            >
              Nomor HP
            </label>
            <label
              className={`block text-xs ${
                submitted && formData.nohp === ""
                  ? "text-red-600"
                  : "text-gray-900"
              }`}
            >
              Tuliskan nomor HP anggota
            </label>
            <input
              type="text"
              name="nohp"
              id="nohp_anggota"
              value={formData.nohp || ""}
              onInput={(e) =>
                (e.target.value = e.target.value.replace(/[^0-9]/g, ""))
              }
              onChange={handleChange}
              className={`cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                submitted && formData.nohp === ""
                  ? "ring-2 ring-inset ring-red-600"
                  : "ring-1 ring-inset ring-gray-300"
              }  placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
            />
          </div>

          <div className="relative mb-2">
            <label
              htmlFor="sertifikasi"
              className="block text-sm font-medium text-gray-900"
            >
              Kepemilikan Sertifikasi
            </label>
            <label className="block text-xs text-gray-900">
              Pilih jenis sertifikasi yang dimiliki
            </label>
            <select
              name="sertifikasi"
              id="sertifikasi"
              value={formData.sertifikasi || ""}
              onChange={handleChange}
              className="cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm"
            >
              <option value="">Pilih Sertifikasi</option>
              <option value="NIB">NIB (Nomor Induk Berusaha)</option>
              <option value="PIRT">PIRT (Pangan Industri Rumah Tangga)</option>
              <option value="Halal">Sertifikat Halal</option>
              <option value="BPOM">BPOM (Badan Pengawas Obat & Makanan)</option>
            </select>
          </div>

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
              onClick={handleSubmit}
              className="w-2/12 text-sm bg-blue-200 text-blue-600 font-semibold py-1 px-2 rounded-md shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {loading ? "Menyimpan..." : "Kirim"}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  );
};

FormAnggota.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedDesa: PropTypes.object.isRequired,
  initialData: PropTypes.object,
};

export default FormAnggota;
