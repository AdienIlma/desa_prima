import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Audio } from "react-loader-spinner";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";

const FormLaporan = ({ isOpen, onClose, selectedDesa, initialData }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [deskripsi, setDeskripsi] = useState("");
  const [catatan, setCatatan] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const isEditMode = !!initialData;
  const { user } = useAuth();
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 180;

  useEffect(() => {
    if (isEditMode && initialData) {
      setDeskripsi(initialData.deskripsi || "");
      setCatatan(initialData.catatan || "");
      if (initialData.file) {
        setPreviewUrl(
          `https://backend-desa-prima-dev.student.stis.ac.id/uploads/${initialData.file}`
        );
      }
    } else {
      resetForm();
    }
  }, [initialData, isEditMode]);

  const resetForm = () => {
    setFile(null);
    setPreviewUrl(null);
    setDeskripsi("");
    setCatatan("");
    setErrors({});
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleDeskripsiChange = (e) => {
    const value = e.target.value;
    setDeskripsi(value);
    setCharCount(value.length);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isEditMode && !file) {
      newErrors.file = "File laporan diperlukan";
    }

    if (!isEditMode && !file) {
      newErrors.file = "File laporan diperlukan";
    }

    if (!deskripsi) {
      newErrors.deskripsi = "Deskripsi diperlukan";
    } else if (deskripsi.length > MAX_CHARS) {
      newErrors.deskripsi = `Deskripsi tidak boleh lebih dari ${MAX_CHARS} karakter`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDesa || !selectedDesa.id) {
      toast.error("Data kelompok tidak valid");
      return;
    }

    if (!user || !user.id) {
      toast.error("Data user tidak valid");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      formData.append("deskripsi", deskripsi);
      formData.append("catatan", catatan || "");
      formData.append("userId", user.id.toString());

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      if (isEditMode) {
        await axios.put(
          `https://backend-desa-prima-dev.student.stis.ac.id/komponen-laporan/${selectedDesa.id}/laporan/${initialData.id}`,
          formData,
          config
        );
        toast.success("Laporan berhasil diperbarui");
      } else {
        await axios.post(
          `https://backend-desa-prima-dev.student.stis.ac.id/komponen-laporan/${selectedDesa.id}/laporan`,
          formData,
          config
        );
        toast.success("Laporan berhasil ditambahkan");
      }

      onClose(true);
      resetForm();
    } catch (error) {
      console.error("Error submitting laporan:", error);
      toast.error(
        `Gagal ${isEditMode ? "memperbarui" : "menambahkan"} laporan: ${
          error.response?.data?.error || error.message
        }`
      );
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
            onClick={() => {
              onClose(false);
              resetForm();
            }}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>

          <h2 className="text-xl font-semibold mb-4">
            {isEditMode ? "Edit Laporan" : "Tambah Laporan Baru"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="relative mb-2">
              <label
                htmlFor="file"
                className="block text-sm font-medium text-gray-900"
              >
                File Laporan
              </label>
              <label
                className={`block text-xs ${
                  errors.file ? "text-red-600" : "text-gray-900"
                }`}
              >
                {!isEditMode
                  ? "Unggah file laporan (PDF/DOC/XLS)"
                  : "Ubah file laporan"}
              </label>
              <input
                type="file"
                id="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileChange}
                className={`cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                  errors.file
                    ? "ring-2 ring-inset ring-red-600"
                    : "ring-1 ring-inset ring-gray-300"
                } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
              />
              {previewUrl && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600">File saat ini:</p>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Lihat File
                  </a>
                </div>
              )}
              {isEditMode && !file && !previewUrl && (
                <p className="mt-1 text-xs text-gray-500">
                  Tidak ada file yang diunggah
                </p>
              )}
            </div>

            <div className="relative mb-2">
              <label
                htmlFor="deskripsi"
                className="block text-sm font-medium text-gray-900"
              >
                Deskripsi
              </label>
              <label
                className={`block text-xs ${
                  errors.deskripsi ? "text-red-600" : "text-gray-900"
                }`}
              >
                Tuliskan deskripsi laporan (maksimal {MAX_CHARS} karakter)
              </label>
              <textarea
                id="deskripsi"
                rows={3}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className={`block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ring-1 ring-inset ${
                  errors.deskripsi ? "ring-2 ring-red-600" : "ring-gray-300"
                } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
              />
               
      <div className="flex justify-between mt-1">
        <span className={`text-xs ${deskripsi.length > MAX_CHARS ? 'text-red-600' : 'text-gray-500'}`}>
          {charCount}/{MAX_CHARS} karakter
        </span>
        {errors.deskripsi && (
          <span className="text-xs text-red-600">{errors.deskripsi}</span>
        )}
      </div>
            </div>

            <div className="relative mb-2">
              <label
                htmlFor="catatan"
                className="block text-sm font-medium text-gray-900"
              >
                Catatan
              </label>
              <label className="block text-xs text-gray-900">
                Tambahkan catatan (opsional)
              </label>
              <textarea
                id="catatan"
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm"
              />
            </div>

            <div className="w-full flex justify-end pt-3 pb-1">
              <button
                type="button"
                onClick={() => {
                  onClose(false);
                  resetForm();
                }}
                className="w-2/12 text-sm bg-red-200 mr-2 text-red-600 font-semibold py-1 px-2 rounded-md shadow-sm hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/12 text-sm bg-blue-200 text-blue-600 font-semibold py-1 px-2 rounded-md shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {loading ? "Menyimpan..." : isEditMode ? "Simpan" : "Kirim"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  );
};

FormLaporan.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedDesa: PropTypes.object.isRequired,
  initialData: PropTypes.object,
};

FormLaporan.defaultProps = {
  initialData: null,
};

export default FormLaporan;
