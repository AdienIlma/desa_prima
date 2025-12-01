import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";
import useUserData from "../../hooks/useUserData";

const ModalKabupaten = ({ isOpen, onClose, selectedKabupaten }) => {
  const { userList, loading } = useUserData();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nama_kabupaten: "",
    jumlah_desa: "",
    pendampingId: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filteredUsers = userList.filter(
    (user) =>
      user.role === "Pendamping" &&
      (!selectedKabupaten || user.kabupatenId === selectedKabupaten.id) &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
    if (selectedKabupaten) {
      setFormData({
        nama_kabupaten: selectedKabupaten.nama_kabupaten || "",
        jumlah_desa: selectedKabupaten.jumlah_desa || "",
        pendampingId: selectedKabupaten.pendampingId || null,
      });
    } else {
      setFormData({
        nama_kabupaten: "",
        jumlah_desa: "",
        pendampingId: null,
      });
    }
  }, [selectedKabupaten]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "jumlah_desa" ? parseInt(value, 10) || "" : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      if (!formData.nama_kabupaten || !formData.jumlah_desa) {
        toast.error("Nama kabupaten dan jumlah desa wajib diisi!");
        return;
      }

      const payload = {
        nama_kabupaten: formData.nama_kabupaten,
        jumlah_desa: Number(formData.jumlah_desa),
        pendampingId: formData.pendampingId
          ? Number(formData.pendampingId)
          : null,
      };

      if (selectedKabupaten) {
        await axios.put(
          `https://backend-desa-prima-dev.student.stis.ac.id/kabupaten/${selectedKabupaten.id}`,
          payload
        );
        toast.success(
          `Berhasil mengubah data Kabupaten ${formData.nama_kabupaten}`
        );
      } else {
        await axios.post(
          `https://backend-desa-prima-dev.student.stis.ac.id/kabupaten`,
          payload
        );
        toast.success("Data kabupaten berhasil ditambahkan!");
      }

      onClose(true);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Terjadi kesalahan dalam proses penyimpanan data";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-400 bg-opacity-50 flex justify-center items-center text-left z-50 px-5 pt-10 pb-20">
      <div className="bg-white top-4 p-2 md:px-4 lg:px-4 md:py-3 lg:py-3 rounded-lg shadow-lg w-full max-w-md md:max-w-md lg:max-w-md max-h-screen overflow-auto relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h2 className="text-lg md:text-xl lg:text-2xl font-semibold mb-2">
          {selectedKabupaten ? "Edit Data Kabupaten" : "Tambah Data Kabupaten"}
        </h2>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="relative">
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-900">
                Nama Kabupaten/Kota
              </label>
              <label
                className={`block text-xs ${
                  submitted && formData.nama_kabupaten === ""
                    ? "text-red-600"
                    : "text-gray-900"
                }`}
              >
                Tuliskan nama kabupaten/kota
              </label>
              <input
                type="text"
                name="nama_kabupaten"
                value={formData.nama_kabupaten}
                onChange={handleChange}
                className={`block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                  submitted && !formData.nama_kabupaten
                    ? "ring-2 ring-inset ring-red-600"
                    : "ring-1 ring-inset ring-gray-300"
                } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-900">
                Jumlah Desa
              </label>
              <label
                className={`block text-xs ${
                  submitted && formData.email === ""
                    ? "text-red-600"
                    : "text-gray-900"
                }`}
              >
                Tuliskan jumlah desa
              </label>
              <input
                type="number"
                name="jumlah_desa"
                value={formData.jumlah_desa}
                onChange={handleChange}
                className={`block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                  submitted && !formData.jumlah_desa
                    ? "ring-2 ring-inset ring-red-600"
                    : "ring-1 ring-inset ring-gray-300"
                } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
              />
            </div>

            <div className="mb-2 relative">
              <label className="block text-sm font-medium text-gray-900">
                Pendamping
              </label>
              <label
                className={`block text-xs ${
                  submitted && formData.anggotaId === ""
                    ? "text-red-600"
                    : "text-gray-900"
                }`}
              >
                Pilih pendamping
              </label>
              {/* Input untuk pencarian */}
              <div className="relative" ref={dropdownRef}>
                <input
                  type="text"
                  placeholder="Cari atau pilih pendamping..."
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
              </div>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {loading ? (
                    <div className="py-2 px-3 text-gray-500">
                      Memuat data...
                    </div>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-blue-100 ${
                          formData.pendampingId === user.id ? "bg-blue-100" : ""
                        }`}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            pendampingId: user.id,
                          }));
                          setSearchTerm(user.name);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <div className="flex items-center">
                          <span className="font-normal ml-3 block truncate">
                            {user.name} ({user.email})
                          </span>
                        </div>
                        {formData.pendampingId === user.id && (
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
                      {selectedKabupaten
                        ? "Tidak ada pendamping yang terkait dengan kabupaten ini"
                        : "Tidak ditemukan"}
                    </div>
                  )}
                </div>
              )}

              {formData.pendampingId && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">
                    Pendamping terpilih:{" "}
                    {filteredUsers.find((u) => u.id === formData.pendampingId)
                      ?.name || "Tidak diketahui"}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3 w-full flex justify-end">
              <button
                type="button"
                className="w-2/12 text-sm bg-red-200 mr-2 text-red-600 font-semibold py-1 px-2 rounded-md shadow-sm hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                onClick={onClose}
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-2/12 text-sm bg-blue-200 text-blue-600 font-semibold py-1 px-2 rounded-md shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                Simpan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalKabupaten;
