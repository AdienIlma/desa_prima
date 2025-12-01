import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Transition } from "@headlessui/react";
import axios from "axios";
import { Audio } from "react-loader-spinner";
import { toast } from "react-hot-toast";

const ROLES = {
  Admin: "Admin",
  Pegawai: "Pegawai",
  Pengurus: "Pengurus",
  Pendamping: "Pendamping",
};

const FormUser = ({ isOpen, onClose, selectedUser }) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    nip: "",
    role: "",
    email: "",
    kabupatenId: "",
    kelompokId: "",
  });

  const [aksesKabList, setAksesKabList] = useState([]);
  const [kelompokList, setKelompokList] = useState([]);
  const [anggotaList, setAnggotaList] = useState([]);
  const [selectedAnggotaId, setSelectedAnggotaId] = useState("");
  const [apiError, setApiError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    nip: "",
  });

  const validateField = (name, value) => {
    let errorMsg = "";

    if (name === "email") {
      if (!value.includes("@")) {
        errorMsg = "Email harus mengandung karakter '@'";
      }
    }

    if (name === "nip") {
      if (value && !/^\d{18}$/.test(value)) {
        errorMsg = "NIP harus terdiri dari 18 digit angka";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        id: selectedUser.id,
        name: selectedUser.name || "",
        nip: selectedUser.nip || "",
        role: selectedUser.role || "",
        email: selectedUser.email || "",
        kabupatenId: selectedUser.kabupatenId || "",
        kelompokId: selectedUser.kelompokId || "",
      });
    } else {
      setFormData({
        id: "",
        name: "",
        nip: "",
        role: "",
        email: "",
        kabupatenId: "",
        kelompokId: "",
      });
    }

    const fetchData = async () => {
      try {
        const [kabupatenRes, kelompokRes] = await Promise.all([
          axios.get(
            `https://backend-desa-prima-dev.student.stis.ac.id/kabupaten`
          ),
          axios.get(
            `https://backend-desa-prima-dev.student.stis.ac.id/kelompok`
          ),
        ]);
        setAksesKabList(kabupatenRes.data);
        setKelompokList(kelompokRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedUser]);

  // Fetch anggota when role is Pengurus
  useEffect(() => {
    const fetchAnggotaData = async () => {
      if (formData.role === "Pengurus") {
        try {
          console.log("Fetching anggota data...");
          const response = await axios.get(
            `https://backend-desa-prima-dev.student.stis.ac.id/komponen-anggota/all`
          );
          console.log("Anggota data received:", response.data);

          const anggotaData = response.data.data || [];
          console.log("Extracted anggota data:", anggotaData);

          // Filter anggota based on position
          const filteredAnggota = anggotaData.filter((anggota) => {
            const jabatan = anggota.jabatan?.toLowerCase() || "";
            return (
              jabatan.includes("ketua") ||
              jabatan.includes("sekretaris") ||
              jabatan.includes("bendahara")
            );
          });

          setAnggotaList(Array.isArray(filteredAnggota) ? filteredAnggota : []);
        } catch (err) {
          console.error("Error fetching anggota:", err);
          setAnggotaList([]);
        }
      } else {
        setAnggotaList([]);
      }
    };

    fetchAnggotaData();
  }, [formData.role]);

  useEffect(() => {
    console.log("anggotaList updated:", anggotaList);
  }, [anggotaList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (selectedUser && name === "role") return;

    validateField(name, value);

    if (name === "role") {
      setFormData({
        ...formData,
        role: value,
        kabupatenId: "",
        kelompokId: "",
        anggotaId: "",
        name: "",
        email: "",
        nip: "",
      });
      setErrors({ email: "", nip: "" });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const filteredAnggotaList = anggotaList.filter((anggota) => {
    const searchLower = inputValue.toLowerCase();
    return (
      !inputValue ||
      anggota.nama?.toLowerCase().includes(searchLower) ||
      anggota.nip?.toString().includes(searchLower) ||
      anggota.jabatan?.toLowerCase().includes(searchLower)
    );
  });

  const dropdownRef = useRef(null);

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

  const handleAnggotaSelect = (anggota) => {
    if (!anggota) return;

    console.log("Selected anggota:", anggota);
    const kelompok = kelompokList.find((k) => k.id === anggota.kelompokId);
    console.log("Found kelompok:", kelompok);

    setFormData((prev) => ({
      ...prev,
      name: anggota.nama || "",
      email: anggota.email || "",
      nip: anggota.nip || "",
      anggotaId: anggota.id || "",
      kelompokId: anggota.kelompokId || "",
      ...(kelompok && {
        kabupatenId: kelompok.kabupatenId || "",
      }),
    }));

    setSelectedAnggotaId(anggota.id);
    setInputValue(anggota.nama);
  };

  const generatePassword = (length = 10) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
    }
    return password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setLoading(true);
    setApiError(null);

    try {
      const formattedRole = formData.role;

      const payload = {
        name: formData.name,
        email: formData.email,
        role: formattedRole,
        ...(formData.nip && { nip: formData.nip }),
        ...(formData.role === "Pendamping" && {
          kabupatenId: parseInt(formData.kabupatenId),
        }),
        ...(formData.role === "Pengurus" && {
          kelompokId: parseInt(formData.kelompokId),
          anggotaId: parseInt(formData.anggotaId),
        }),
        sendEmail: true,
        ...(!selectedUser && { password: generatePassword() }),
      };

      console.log("Payload:", payload);

      const url = selectedUser
        ? `https://backend-desa-prima-dev.student.stis.ac.id/users/users/list/${selectedUser.id}`
        : `https://backend-desa-prima-dev.student.stis.ac.id/users/users/list`;

      const method = selectedUser ? "put" : "post";

      const response = await axios[method](url, payload);
      console.log("Response:", response.data);

      const userName = response.data.data?.name || formData.name;
      toast.success(
        `Berhasil ${
          selectedUser ? "mengubah" : "menambahkan"
        } data User ${userName}`
      );
      onClose(true);
    } catch (error) {
      console.error("Error:", error.response?.data || error);
      let errorMessage = "";

      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = error.response.data.message || "Email sudah terdaftar";
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      } else {
        errorMessage = error.message || errorMessage;
      }

      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="fixed inset-0 bg-gray-400 bg-opacity-50 flex justify-center items-center text-left z-50 px-5 pt-10 pb-20">
        {loading ? (
          <div className="flex items-center justify-center">
            <Audio type="Bars" color="#542d48" height={80} width={80} />
          </div>
        ) : (
          <div className="bg-white top-4 p-2 md:px-4 lg:px-4 md:py-3 lg:py-3 rounded-lg shadow-lg w-full max-w-md md:max-w-md lg:max-w-md max-h-screen overflow-auto relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 className="text-lg md:text-xl lg:text-xl font-semibold mb-2">
              {selectedUser ? "Edit Data User" : "Tambah Data User"}
            </h2>
            {apiError && (
              <div className="mb-4 flex items-start p-3 bg-red-50 rounded-md border border-red-200">
                <FontAwesomeIcon
                  icon={faExclamationCircle}
                  className="h-5 w-5 text-red-500 mr-2 mt-0.5"
                />
                <p className="text-red-700">{apiError}</p>
              </div>
            )}
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="relative">
                <div className="relative mb-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Role
                  </label>
                  <label
                    className={`block text-xs ${
                      submitted && formData.role === ""
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    Pilih role user
                  </label>
                  <select
                    name="role"
                    disabled={!!selectedUser}
                    value={formData.role}
                    onChange={handleChange}
                    className={`block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                      submitted && !formData.role
                        ? "ring-2 ring-inset ring-red-600"
                        : "ring-1 ring-inset ring-gray-300"
                    } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                  >
                    <option value="">Pilih Role</option>
                    <option value={ROLES.Pegawai}>Pegawai</option>
                    <option value={ROLES.Pengurus}>Pengurus</option>
                    <option value={ROLES.Pendamping}>Pendamping</option>
                  </select>
                </div>

                {/* Field untuk memilih anggota hanya muncul jika role Pengurus */}
                {formData.role === "Pengurus" && (
                  <div className="mb-2 relative">
                    <label className="block text-sm font-medium text-gray-900">
                      Pilih Anggota
                    </label>
                    <label
                      className={`block text-xs ${
                        submitted && formData.anggotaId === ""
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      Pilih anggota
                    </label>

                    {/* Combobox */}
                    <div className="relative" ref={dropdownRef}>
                      <input
                        type="text"
                        placeholder="Cari atau pilih anggota..."
                        value={inputValue}
                        onChange={(e) => {
                          setInputValue(e.target.value);
                          setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        className={`block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                          submitted && !formData.anggotaId
                            ? "ring-2 ring-inset ring-red-600"
                            : "ring-1 ring-inset ring-gray-300"
                        } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
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

                      {/* Dropdown menu */}
                      {isDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                          {filteredAnggotaList.length > 0 ? (
                            filteredAnggotaList.map((anggota) => {
                              // Cari nama kelompok berdasarkan kelompokId
                              const kelompok = kelompokList.find(
                                (k) => k.id === anggota.kelompokId
                              );
                              const kelompokNama = kelompok
                                ? kelompok.nama
                                : "Kelompok tidak diketahui";

                              return (
                                <div
                                  key={anggota.id}
                                  className={`cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-blue-100 ${
                                    selectedAnggotaId === anggota.id
                                      ? "bg-blue-100"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    handleAnggotaSelect(anggota);
                                    setInputValue(anggota.nama);
                                    setIsDropdownOpen(false);
                                  }}
                                >
                                  <div className="flex items-center">
                                    <span className="font-normal ml-3 block truncate">
                                      {anggota.nama} -{" "}
                                      {anggota.jabatan ||
                                        "Jabatan tidak diketahui"}{" "}
                                      - {kelompokNama}
                                    </span>
                                  </div>
                                  {selectedAnggotaId === anggota.id && (
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
                              );
                            })
                          ) : (
                            <div className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-500">
                              Tidak ditemukan
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Field untuk memilih kabupaten hanya muncul jika role Pendamping */}
                {formData.role === "Pendamping" && (
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-900">
                      Pilih Kabupaten/Kota
                    </label>
                    <select
                      name="kabupatenId"
                      value={formData.kabupatenId}
                      onChange={handleChange}
                      className={`block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                        submitted && !formData.kabupatenId
                          ? "ring-2 ring-inset ring-red-600"
                          : "ring-1 ring-inset ring-gray-300"
                      } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                    >
                      <label
                        className={`block text-xs ${
                          submitted && formData.kabupatenId === ""
                            ? "text-red-600"
                            : "text-gray-900"
                        }`}
                      >
                        Pilih kabupaten/kota
                      </label>
                      <option value="">Pilih Kabupaten/Kota</option>
                      {aksesKabList.map((kabupaten) => (
                        <option key={kabupaten.id} value={kabupaten.id}>
                          {kabupaten.nama_kabupaten}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {formData.role !== "Pengurus" && (
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-900">
                      Nama
                    </label>
                    <label
                      className={`block text-xs ${
                        submitted && formData.name === ""
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      Tuliskan nama user
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={formData.role === "Pengurus"}
                      className={`block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                        submitted && !formData.name
                          ? "ring-2 ring-inset ring-red-600"
                          : "ring-1 ring-inset ring-gray-300"
                      } ${
                        formData.role === "Pengurus" ? "bg-gray-100" : ""
                      } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                    />
                  </div>
                )}

                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Email
                  </label>
                  <label
                    className={`block text-xs ${
                      submitted && formData.email === ""
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    Tuliskan email user
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                      submitted && !formData.email
                        ? "ring-2 ring-inset ring-red-600"
                        : "ring-1 ring-inset ring-gray-300"
                    } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {(formData.role === "Admin" || formData.role === "Pegawai") && (
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-900">
                      NIP
                    </label>
                    <label className="block text-xs">Tuliskan NIP user</label>
                    <input
                      type="number"
                      name="nip"
                      value={formData.nip}
                      onChange={handleChange}
                      className="block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm"
                    />
                    {errors.nip && (
                      <p className="text-red-600 text-xs mt-1">{errors.nip}</p>
                    )}
                  </div>
                )}

                {formData.role === "Pengurus" && formData.kelompokId && (
                  <div className="mb-2 p-2 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">
                      Kelompok:{" "}
                      {kelompokList.find(
                        (k) => k.id === parseInt(formData.kelompokId)
                      )?.nama || "Tidak diketahui"}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      Kabupaten:{" "}
                      {aksesKabList.find(
                        (k) =>
                          k.id ===
                          parseInt(
                            kelompokList.find(
                              (kel) => kel.id === parseInt(formData.kelompokId)
                            )?.kabupatenId
                          )
                      )?.nama_kabupaten || "Tidak diketahui"}
                    </p>
                  </div>
                )}
              </div>

              <div className="w-full flex justify-end">
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
                  disabled={loading}
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

export default FormUser;
