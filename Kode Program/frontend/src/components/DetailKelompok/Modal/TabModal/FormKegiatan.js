import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Audio } from "react-loader-spinner";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";

const FormKegiatan = ({ isOpen, onClose, selectedDesa, initialData }) => {
  const [formData, setFormData] = useState({
    nama_kegiatan: "",
    uraian: "",
    tanggal: "",
    file_materi: null,
    file_notulensi: null,
    preview_materi: null,
    preview_notulensi: null,
  });
  const today = new Date().toISOString().split("T")[0];
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const isEditMode = !!initialData;
  const { user } = useAuth();

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        nama_kegiatan: initialData.nama_kegiatan,
        uraian: initialData.uraian || "",
        tanggal: initialData.tanggal
          ? new Date(initialData.tanggal).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        file_materi: null,
        file_notulensi: null,
        preview_materi: initialData.file_materi
          ? `/uploads/${initialData.file_materi}`
          : null,
        preview_notulensi: initialData.file_notulensi
          ? `/uploads/${initialData.file_notulensi}`
          : null,
        userId: user.id,
      });

      if (initialData.FotoKegiatan && initialData.FotoKegiatan.length > 0) {
        setPhotoPreviews(
          initialData.FotoKegiatan.map((foto) => `/uploads/${foto.gambar}`)
        );
      }
    } else {
      setFormData({
        nama_kegiatan: "",
        uraian: "",
        tanggal: "",
        file_materi: null,
        file_notulensi: null,
        preview_materi: null,
        preview_notulensi: null,
        userId: user.id,
      });
      setPhotos([]);
      setPhotoPreviews([]);
    }
  }, [initialData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [field]: file,
        [`preview_${field}`]: URL.createObjectURL(file),
      }));
    }
  };

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Tambahkan file baru ke array yang sudah ada
      setPhotos((prevPhotos) => [...prevPhotos, ...files]);

      // Buat preview untuk file baru dan tambahkan ke array preview yang sudah ada
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPhotoPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    }

    // Reset input file agar bisa memilih file yang sama lagi
    e.target.value = null;
  };

  const removePhoto = (index) => {
    // Hapus URL preview untuk menghemat memori
    URL.revokeObjectURL(photoPreviews[index]);

    // array baru tanpa foto yang dihapus
    const newPhotos = [...photos];
    const newPreviews = [...photoPreviews];

    newPhotos.splice(index, 1);
    newPreviews.splice(index, 1);

    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  useEffect(() => {
    return () => {
      // Membersihkan semua object URL saat komponen unmount
      photoPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [photoPreviews]);

  const validateForm = () => {
    const newErrors = {};
    setSubmitted(true);

    if (!formData.nama_kegiatan.trim()) {
      newErrors.nama_kegiatan = "Nama kegiatan wajib diisi";
    }

    if (!formData.tanggal) {
      newErrors.tanggal = "Tanggal wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!selectedDesa || !selectedDesa.id) {
      toast.error("Desa tidak valid");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nama_kegiatan", formData.nama_kegiatan);
      formDataToSend.append("uraian", formData.uraian);
      formDataToSend.append("tanggal", formData.tanggal);
      formDataToSend.append("userId", user.id);

      if (formData.file_materi) {
        formDataToSend.append("file_materi", formData.file_materi);
      }

      if (formData.file_notulensi) {
        formDataToSend.append("file_notulensi", formData.file_notulensi);
      }

      if (isEditMode) {
        await axios.put(
          `https://backend-desa-prima-dev.student.stis.ac.id/komponen-kegiatan/${selectedDesa.id}/kegiatan/${initialData.id}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (photos.length > 0) {
          const photosFormData = new FormData();
          photos.forEach((photo) => {
            photosFormData.append("photos", photo);
          });

          await axios.post(
            `https://backend-desa-prima-dev.student.stis.ac.id/komponen-kegiatan/${selectedDesa.id}/kegiatan/${initialData.id}/foto`,
            photosFormData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }

        toast.success("Kegiatan berhasil diperbarui");
      } else {
        const response = await axios.post(
          `https://backend-desa-prima-dev.student.stis.ac.id/komponen-kegiatan/${selectedDesa.id}/kegiatan`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (photos.length > 0) {
          const photosFormData = new FormData();
          photos.forEach((photo) => {
            photosFormData.append("photos", photo);
          });

          await axios.post(
            `https://backend-desa-prima-dev.student.stis.ac.id/komponen-kegiatan/${selectedDesa.id}/kegiatan/${response.data.id}/foto`,
            photosFormData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }

        toast.success("Kegiatan berhasil ditambahkan");
      }

      onClose(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        `Gagal ${isEditMode ? "memperbarui" : "menambahkan"} kegiatan`
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
        {loading ? (
          <div className="flex items-center justify-center">
            <Audio type="Bars" color="#542d48" height={80} width={80} />
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <h2 className="text-xl font-semibold mb-4">
              {isEditMode ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <label
                    htmlFor="nama_kegiatan"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Nama Kegiatan
                  </label>
                  <label
                    className={`block text-xs ${
                      submitted && formData.nama_kegiatan === ""
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    Tuliskan nama kegiatan
                  </label>
                  <input
                    type="text"
                    id="nama_kegiatan"
                    name="nama_kegiatan"
                    value={formData.nama_kegiatan}
                    onChange={handleChange}
                    className={`cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                      submitted && formData.nama_kegiatan === ""
                        ? "ring-2 ring-inset ring-red-600"
                        : "ring-1 ring-inset ring-gray-300"
                    } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                  />
                </div>

                <div className="relative">
                  <label
                    htmlFor="tanggal"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Tanggal Kegiatan
                  </label>
                  <label
                    className={`block text-xs ${
                      submitted && formData.tanggal === ""
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    Pilih tanggal kegiatan
                  </label>
                  <input
                    type="date"
                    id="tanggal"
                    name="tanggal"
                    max={today}
                    value={formData.tanggal}
                    onChange={handleChange}
                    className={`cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                      submitted && formData.tanggal === ""
                        ? "ring-2 ring-inset ring-red-600"
                        : "ring-1 ring-inset ring-gray-300"
                    } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                  />
                </div>
              </div>

              <div className="relative mb-4">
                <label
                  htmlFor="uraian"
                  className="block text-sm font-medium text-gray-900"
                >
                  Uraian Kegiatan
                </label>
                <label
                  className={`block text-xs ${
                    submitted && formData.uraian === ""
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  Tuliskan uraian kegiatan
                </label>
                <textarea
                  id="uraian"
                  name="uraian"
                  rows={3}
                  value={formData.uraian}
                  onChange={handleChange}
                  className={`cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                    submitted && formData.uraian === ""
                      ? "ring-2 ring-inset ring-red-600"
                      : "ring-1 ring-inset ring-gray-300"
                  } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <label
                    htmlFor="file_materi"
                    className="block text-sm font-medium text-gray-900"
                  >
                    File Materi (PDF/PPT)
                  </label>
                  <label
                    className={`block text-xs ${
                      submitted &&
                      !formData.file_materi &&
                      !formData.preview_materi
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    Unggah file materi
                  </label>
                  <input
                    type="file"
                    id="file_materi"
                    accept=".pdf,.ppt,.pptx"
                    onChange={(e) => handleFileChange(e, "file_materi")}
                    className={`cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                      submitted &&
                      !formData.file_materi &&
                      !formData.preview_materi
                        ? "ring-2 ring-inset ring-red-600"
                        : "ring-1 ring-inset ring-gray-300"
                    } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                  />
                  {(formData.preview_materi || formData.file_materi) && (
                    <div className="mt-2 flex items-center gap-2">
                      {formData.file_materi ? (
                        <>
                          <div className="text-sm text-gray-500">
                            File baru dipilih
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                file_materi: null,
                                preview_materi: null,
                              }))
                            }
                            className="text-red-500 text-sm"
                          >
                            Hapus
                          </button>
                        </>
                      ) : (
                        <>
                          <a
                            href={formData.preview_materi}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Lihat File Saat Ini
                          </a>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label
                    htmlFor="file_notulensi"
                    className="block text-sm font-medium text-gray-900"
                  >
                    File Notulensi (PDF/DOC)
                  </label>
                  <label
                    className={`block text-xs ${
                      submitted &&
                      !formData.file_notulensi &&
                      !formData.preview_notulensi
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    Unggah file notulensi
                  </label>
                  <input
                    type="file"
                    id="file_notulensi"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, "file_notulensi")}
                    className={`cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                      submitted &&
                      !formData.file_notulensi &&
                      !formData.preview_notulensi
                        ? "ring-2 ring-inset ring-red-600"
                        : "ring-1 ring-inset ring-gray-300"
                    } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                  />
                  {(formData.preview_notulensi || formData.file_notulensi) && (
                    <div className="mt-2 flex items-center gap-2">
                      {formData.file_notulensi ? (
                        <>
                          <div className="text-sm text-gray-500">
                            File baru dipilih
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                file_notulensi: null,
                                preview_notulensi: null,
                              }))
                            }
                            className="text-red-500 text-sm"
                          >
                            Hapus
                          </button>
                        </>
                      ) : (
                        <>
                          <a
                            href={formData.preview_notulensi}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Lihat File Saat Ini
                          </a>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative mb-4">
                <label
                  htmlFor="photos"
                  className="block text-sm font-medium text-gray-900"
                >
                  Foto Kegiatan
                </label>
                <label
                  className={`block text-xs ${
                    submitted && photoPreviews.length === 0
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  Unggah foto kegiatan (maksimal 5)
                </label>
                <input
                  type="file"
                  id="photos"
                  multiple
                  accept="image/*"
                  onChange={handlePhotosChange}
                  className={`cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                    submitted && photoPreviews.length === 0
                      ? "ring-2 ring-inset ring-red-600"
                      : "ring-1 ring-inset ring-gray-300"
                  } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                />

                {photoPreviews.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Preview Foto:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {photoPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                            <img
                              src={preview}
                              alt={`Preview ${index}`}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 right-2 bg-white text-red-500 hover:bg-red-500 hover:text-white 
                      transition-all duration-200 shadow-md rounded-md p-1 flex items-center justify-center"
                            style={{
                              width: "28px",
                              height: "28px",
                              backdropFilter: "blur(4px)",
                            }}
                            aria-label="Hapus foto"
                          >
                            <FontAwesomeIcon
                              icon={faTimes}
                              className="text-sm"
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => onClose(false)}
                  className="text-sm bg-red-200 mr-2 text-red-600 font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="text-sm bg-blue-200 text-blue-600 font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {loading ? "Menyimpan..." : "Kirim"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Transition>
  );
};

FormKegiatan.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedDesa: PropTypes.object.isRequired,
  initialData: PropTypes.object,
};

export default FormKegiatan;
