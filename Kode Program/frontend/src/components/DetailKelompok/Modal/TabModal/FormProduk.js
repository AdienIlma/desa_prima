import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Audio } from "react-loader-spinner";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";

const FormProduk = ({
  isOpen,
  onClose,
  selectedDesa,
  initialData,
  anggotaList,
}) => {
  const [formData, setFormData] = useState({
    nama: "",
    harga_awal: "",
    harga_awal_numeric: 0,
    harga_akhir: "",
    harga_akhir_numeric: 0,
    anggotaId: "",
    deskripsi: "",
    foto: null,
  });
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    harga_akhir: "",
  });
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filteredAnggota =
    anggotaList?.filter((anggota) =>
      anggota.nama.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Fungsi untuk format ribuan
  const formatRibuan = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const validatePrices = (hargaAwal, hargaAkhir) => {
    if (hargaAkhir && hargaAwal && hargaAkhir <= hargaAwal) {
      return "Harga akhir harus lebih besar dari harga awal";
    }
    return "";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        nama: initialData.nama || "",
        harga_awal: formatRibuan(initialData.harga_awal) || "",
        harga_awal_numeric: initialData.harga_awal || 0,
        harga_akhir: formatRibuan(initialData.harga_akhir) || "",
        harga_akhir_numeric: initialData.harga_akhir || 0,
        anggotaId: initialData.anggotaId || "",
        deskripsi: initialData.deskripsi || "",
        foto: initialData.fotoUrl ? initialData.fotoUrl : null,
        userId: user.id,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "harga_awal" || name === "harga_akhir") {
      const numericValue = value.replace(/[^0-9]/g, "");

      // Format sebagai ribuan
      const formattedValue = formatRibuan(numericValue);

      const newFormData = {
        ...formData,
        [name]: formattedValue,
        [`${name}_numeric`]: numericValue ? parseInt(numericValue, 10) : 0,
      };

      setFormData(newFormData);

      // Validasi real-time ketika mengubah harga
      if (name === "harga_awal" || name === "harga_akhir") {
        const error = validatePrices(
          name === "harga_awal" ? numericValue : formData.harga_awal_numeric,
          name === "harga_akhir" ? numericValue : formData.harga_akhir_numeric
        );
        setValidationErrors({ harga_akhir: error });
      }

      if (initialData.anggotaId) {
        const selectedAnggota = anggotaList.find(
          (a) => a.id === initialData.anggotaId
        );
        if (selectedAnggota) {
          setSearchTerm(selectedAnggota.nama);
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(e.target.files[0].type)) {
        setError("Hanya format JPG, PNG yang diperbolehkan");
        return;
      }
      setFormData((prev) => ({ ...prev, foto: e.target.files[0] }));
    }
  };

  const handleBlur = (e) => {
    if (
      e.target.name === "harga_akhir" &&
      formData.harga_akhir_numeric &&
      formData.harga_awal_numeric
    ) {
      if (formData.harga_akhir_numeric <= formData.harga_awal_numeric) {
        setValidationErrors({
          harga_akhir: "Harga akhir harus lebih besar dari harga awal",
        });
      } else {
        setValidationErrors({ harga_akhir: "" });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Reset validation errors
    setValidationErrors({ harga_akhir: "" });

    // Validasi harga akhir harus lebih besar dari harga awal jika diisi
    if (
      formData.harga_akhir &&
      Number(formData.harga_akhir) <= Number(formData.harga_awal)
    ) {
      setValidationErrors({
        harga_akhir: "Harga akhir harus lebih besar dari harga awal",
      });
      return;
    }

    if (!formData.nama || !formData.harga_awal || !formData.deskripsi) {
      setError("Harap isi semua field yang wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append("nama", formData.nama);
      dataToSend.append("harga_awal", formData.harga_awal_numeric);
      dataToSend.append("harga_akhir", formData.harga_akhir_numeric || "");
      dataToSend.append("anggotaId", formData.anggotaId || "");
      dataToSend.append("deskripsi", formData.deskripsi);
      dataToSend.append("userId", user.id);

      // Jika ada file baru atau edit mode tanpa file yang ada
      if (formData.foto instanceof File) {
        dataToSend.append("foto", formData.foto);
      } else if (isEdit && typeof formData.foto === "string") {
        // Jika edit dan foto adalah string (URL), kirim sebagai string
        dataToSend.append("fotoUrl", formData.foto);
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      if (isEdit) {
        await axios.put(
          `https://backend-desa-prima-dev.student.stis.ac.id/komponen-produk/${selectedDesa.id}/produk/${initialData.id}`,
          dataToSend,
          config
        );
        toast.success(`Data produk ${formData.nama} berhasil diperbarui!`);
      } else {
        await axios.post(
          `https://backend-desa-prima-dev.student.stis.ac.id/komponen-produk/${selectedDesa.id}/produk`,
          dataToSend,
          config
        );
        toast.success(`Data produk ${formData.nama} berhasil ditambahkan!`);
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
              {isEdit ? "Edit Produk" : "Tambah Produk"}
            </h2>

            <div className="flex space-x-4 mb-2">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-900">
                  Nama Produk
                </label>
                <label
                  className={`block text-xs ${
                    submitted && !formData.nama
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  Tuliskan nama produk
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="nama"
                    name="nama"
                    value={formData.nama || ""}
                    onChange={handleChange}
                    className={`cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                      submitted && !formData.nama
                        ? "ring-2 ring-inset ring-red-600"
                        : "ring-1 ring-inset ring-gray-300"
                    } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                  />
                </div>
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-900">
                  Pelaku Usaha
                </label>
                <label
                  className={`block text-xs ${
                    submitted && !formData.anggotaId
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  Pilih pelaku usaha
                </label>

                <div className="relative" ref={dropdownRef}>
                  <input
                    type="text"
                    placeholder="Cari pelaku usaha..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm"
                  />

                  {/* Dropdown arrow */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  {/* Dropdown menu - dipindahkan ke sini */}
                  {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {filteredAnggota.length > 0 ? (
                        filteredAnggota.map((anggota) => (
                          <div
                            key={anggota.id}
                            className={`cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-blue-100 ${
                              formData.anggotaId === anggota.id
                                ? "bg-blue-100"
                                : ""
                            }`}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                anggotaId: anggota.id,
                              }));
                              setSearchTerm(anggota.nama); // Update search term dengan nama yang dipilih
                              setIsDropdownOpen(false);
                            }}
                          >
                            <div className="flex items-center">
                              <span className="font-normal ml-3 block truncate">
                                {anggota.nama}
                              </span>
                            </div>
                            {formData.anggotaId === anggota.id && (
                              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                <svg
                                  className="h-5 w-5"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-500">
                          {searchTerm
                            ? "Tidak ditemukan"
                            : "Ketik untuk mencari anggota"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-4 mb-2">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-900">
                  Rentang Harga Awal
                </label>
                <label
                  className={`block text-xs ${
                    submitted && !formData.harga_awal
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  Tuliskan harga minimum
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
                    Rp
                  </span>
                  <input
                    id="harga_awal"
                    name="harga_awal"
                    type="text"
                    value={formData.harga_awal || ""}
                    onChange={handleChange}
                    className={`cursor-pointer block w-full rounded-md border-0 py-2 pl-10 pr-2 mt-1 text-gray-900 shadow-sm ${
                      submitted && !formData.harga_awal
                        ? "ring-2 ring-inset ring-red-600"
                        : "ring-1 ring-inset ring-gray-300"
                    } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                  />
                </div>
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-900">
                  Rentang Harga Akhir
                </label>
                <label
                  className={`block text-xs ${
                    submitted && !formData.harga_akhir
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  Tuliskan harga maksimum
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
                    Rp
                  </span>
                  <input
                    id="harga_akhir"
                    name="harga_akhir"
                    type="text"
                    value={formData.harga_akhir || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`cursor-pointer block w-full rounded-md border-0 py-2 pl-10 pr-2 mt-1 text-gray-900 shadow-sm ${
                      (submitted && !formData.harga_akhir) ||
                      validationErrors.harga_akhir
                        ? "ring-2 ring-inset ring-red-600"
                        : "ring-1 ring-inset ring-gray-300"
                    } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                  />
                </div>
                {validationErrors.harga_akhir && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.harga_akhir}
                  </p>
                )}
              </div>
            </div>

            <div className="relative mb-2">
              <label
                htmlFor="file"
                className="block text-sm font-medium text-gray-900"
              >
                Upload Gambar Produk
              </label>
              <label
                className={`block text-xs ${
                  submitted && !formData.foto ? "text-red-600" : "text-gray-900"
                }`}
              >
                Unggah gambar dengan format .jpg, .png, dan .jpeg
              </label>
              <input
                type="file"
                id="file"
                accept="image/jpeg, image/png, image/jpg, image/webp"
                onChange={handleFileChange}
                className={`cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                  submitted && !formData.foto
                    ? "ring-2 ring-inset ring-red-600"
                    : "ring-1 ring-inset ring-gray-300"
                }  placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
              />
              {/* Preview Foto */}
              {formData.foto && (
                <div className="mt-2 flex items-center gap-2">
                  {formData.foto instanceof File ? (
                    <>
                      <img
                        src={URL.createObjectURL(formData.foto)}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, foto: null }))
                        }
                        className="text-red-500 text-sm"
                      >
                        Hapus
                      </button>
                    </>
                  ) : (
                    <>
                      <img
                        src={formData.foto}
                        alt="Current"
                        className="h-20 w-20 object-cover rounded"
                      />
                      <span className="text-sm text-gray-500">
                        Foto saat ini
                      </span>
                    </>
                  )}
                </div>
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
                  submitted && formData.deskripsi === ""
                    ? "text-red-600"
                    : "text-gray-900"
                }`}
              >
                Tuliskan deskripsi produk
              </label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                rows="3"
                value={formData.deskripsi || ""}
                onChange={handleChange}
                className={`cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                  submitted && formData.deskripsi === ""
                    ? "ring-2 ring-inset ring-red-600"
                    : "ring-1 ring-inset ring-gray-300"
                }  placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
              />
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
        )}
      </div>
    </Transition>
  );
};

FormProduk.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedDesa: PropTypes.object,
  initialData: PropTypes.object,
  anggotaList: PropTypes.array.isRequired,
};

export default FormProduk;
