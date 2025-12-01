import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Audio } from "react-loader-spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";

const KelompokModal = ({ isOpen, onClose, selectedDesa, kabupatenName }) => {
  const [formData, setFormData] = useState({
    nama: "",
    kabupatenId: "",
    kabupaten_kota: kabupatenName || "",
    kabupatenNama: "",
    kecamatan: "",
    kecamatanNama: "",
    kelurahan: "",
    kelurahanNama: "",
    tanggal_pembentukan: "",
    jumlah_hibah_diterima: "",
    jumlah_anggota_awal: "",
    status: "pending",
    catatan: "",
    latitude: "", // Tambahan latitude
    longitude: "", //
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [kabupatenList, setKabupatenList] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [kelurahanList, setKelurahanList] = useState([]);
  const [isKabupatenOpen, setIsKabupatenOpen] = useState(false);
  const [isKecamatanOpen, setIsKecamatanOpen] = useState(false);
  const [isKelurahanOpen, setIsKelurahanOpen] = useState(false);
  const [loadingCoordinates, setLoadingCoordinates] = useState(false);
  const [registeredKelurahans, setRegisteredKelurahans] = useState([]);
  const [kelurahanError, setKelurahanError] = useState("");
  const kabupatenRef = useRef(null);
  const kecamatanRef = useRef(null);
  const kelurahanRef = useRef(null);
  const [dateError, setDateError] = useState("");
  const [coordinateError, setCoordinateError] = useState({
    latitude: "",
    longitude: "",
  });
  const [validationMessages, setValidationMessages] = useState({
    hibah: "",
    anggota: "",
  });
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  const formatKabupatenName = (name) => {
    if (!name) return "";

    // Ubah ke format KAB. NAMA_KABUPATEN (huruf kapital)
    return name
      .toString()
      .replace(/kab\.?/i, "KAB.") // Standarisasi penulisan KAB.
      .replace(/\s+/g, " ") // Hapus spasi berlebih
      .trim()
      .split(" ")
      .map((word) => (word === "KAB." ? word : word.toUpperCase()))
      .join(" ");
  };

  useEffect(() => {
    const loadRegisteredKelurahans = async () => {
      try {
        const response = await axios.get(
          `https://backend-desa-prima-dev.student.stis.ac.id/kelompok`
        );
        const registered = response.data
          .filter((desa) => !selectedDesa || desa.id !== selectedDesa.id) // Exclude current desa in edit mode
          .map((desa) => desa.kelurahan);
        setRegisteredKelurahans(registered);
      } catch (error) {
        console.error("Error loading registered kelurahans:", error);
      }
    };

    loadRegisteredKelurahans();
  }, [selectedDesa]); // Tambahkan selectedDesa sebagai dependency

  const getKabupatenFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const kabupatenParam = urlParams.get("kabupaten");
    return kabupatenParam
      ? formatKabupatenName(decodeURIComponent(kabupatenParam))
      : null;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const kabResponse = await axios.get(`/data/kabupaten/34.json`);
        console.log("Daftar Kabupaten dari API:", kabResponse.data);
        setKabupatenList(kabResponse.data);

        const kabupatenFromURL = getKabupatenFromURL();
        let initialKabupaten = null;

        console.log("selectedDesa:", selectedDesa);

        if (selectedDesa) {
          const formattedKabupaten = formatKabupatenName(
            selectedDesa.kabupaten_kota || selectedDesa.kabupaten
          );

          const kabupaten = kabResponse.data.find(
            (k) => k.name === formattedKabupaten
          );

          console.log("Kabupaten found:", kabupaten);

          initialKabupaten = kabupaten?.id || "";
        } else if (kabupatenFromURL) {
          console.log("Kabupaten from URL:", kabupatenFromURL);

          const kabupaten = kabResponse.data.find(
            (k) => k.name === kabupatenFromURL
          );
          initialKabupaten = kabupaten?.id || "";
        }

        const formattedDate = selectedDesa?.tanggal_pembentukan
          ? new Date(selectedDesa.tanggal_pembentukan)
              .toISOString()
              .split("T")[0]
          : "";

        setFormData((prev) => ({
          ...prev,
          nama: selectedDesa?.nama || "",
          kabupatenId: selectedDesa?.kabupatenId || "",
          kabupaten_kota: initialKabupaten || "",
          kabupatenNama: selectedDesa?.kabupaten_kota
            ? formatKabupatenName(selectedDesa.kabupaten_kota)
            : formatKabupatenName(kabupatenFromURL) || "",
          kecamatan: "",
          kecamatanNama: "",
          kelurahan: "",
          kelurahanNama: "",
          tanggal_pembentukan: formattedDate,
          jumlah_hibah_diterima: selectedDesa?.jumlah_hibah_diterima || "",
          jumlah_anggota_awal: selectedDesa?.jumlah_anggota_awal || "",
          status: selectedDesa?.status || "pending",
          catatan: selectedDesa?.catatan || "",
          latitude: selectedDesa?.latitude || "",
          longitude: selectedDesa?.longitude || "",
          userId: user.id || "",
        }));

        if (initialKabupaten) {
          const kecamatanData = await fetchKecamatan(initialKabupaten);
          setKecamatanList(kecamatanData);

          const kecamatan = kecamatanData.find(
            (k) => k.name === selectedDesa?.kecamatan
          );

          if (kecamatan?.id) {
            const kelurahanData = await fetchKelurahan(kecamatan.id);
            setKelurahanList(kelurahanData);

            const kelurahan = kelurahanData.find(
              (k) => k.name === selectedDesa?.kelurahan
            );

            // Sekarang gabungkan semuanya dalam satu setFormData
            setFormData((prev) => ({
              ...prev,
              kecamatan: kecamatan.id,
              kecamatanNama: kecamatan.name,
              kelurahan: kelurahan?.id || "",
              kelurahanNama: kelurahan?.name || "",
            }));
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDesa]);

  const fetchKecamatan = async (kabupatenId) => {
    try {
      const res = await axios.get(`/data/kecamatan/${kabupatenId}.json`);
      setKecamatanList(res.data);
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const fetchKelurahan = async (kecamatanId) => {
    try {
      const res = await axios.get(`/data/kelurahan/${kecamatanId}.json`);
      setKelurahanList(res.data);
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        kabupatenRef.current &&
        !kabupatenRef.current.contains(event.target)
      ) {
        setIsKabupatenOpen(false);
      }

      if (
        kecamatanRef.current &&
        !kecamatanRef.current.contains(event.target)
      ) {
        setIsKecamatanOpen(false);
      }

      if (
        kelurahanRef.current &&
        !kelurahanRef.current.contains(event.target)
      ) {
        setIsKelurahanOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "tanggal_pembentukan") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(value);

      if (selectedDate > today) {
        setDateError("Tanggal tidak boleh lebih dari hari ini");
        return;
      } else {
        setDateError("");
      }
    }

    if (name === "jumlah_hibah_diterima" || name === "jumlah_anggota_awal") {
      const rawValue = value.replace(/[^0-9]/g, "");

      // Convert to number
      const numericValue = rawValue === "" ? "" : parseInt(rawValue, 10);

      // Update form data with raw number value
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));

      // Validation logic
      if (name === "jumlah_hibah_diterima") {
        if (numericValue < 20000000 && numericValue !== "") {
          setValidationMessages((prev) => ({
            ...prev,
            hibah: "Jumlah hibah di bawah 20 juta",
          }));
        } else {
          setValidationMessages((prev) => ({
            ...prev,
            hibah: "",
          }));
        }
      }

      if (name === "jumlah_anggota_awal") {
        if (numericValue < 10 && numericValue !== "") {
          setValidationMessages((prev) => ({
            ...prev,
            anggota: "Jumlah anggota awal di bawah 10 orang",
          }));
        } else {
          setValidationMessages((prev) => ({
            ...prev,
            anggota: "",
          }));
        }
      }
      return;
    }

    // Validasi jumlah hibah minimal 20 juta
    if (parseInt(formData.jumlah_hibah_diterima) < 20000000) {
      setValidationMessages((prev) => ({
        ...prev,
        hibah: "Jumlah hibah harus minimal Rp 20.000.000",
      }));
      return;
    }

    // Validasi jumlah anggota minimal 10
    if (parseInt(formData.jumlah_anggota_awal) < 10) {
      setValidationMessages((prev) => ({
        ...prev,
        anggota: "Jumlah anggota harus minimal 10 orang",
      }));
      return;
    }

    // Reset pesan error jika valid
    setValidationMessages({
      hibah: "",
      anggota: "",
    });

    // Untuk field kabupaten
    if (name === "kabupaten_kota") {
      const selectedKabupaten = kabupatenList.find((k) => k.id === value);
      const formattedName = formatKabupatenName(selectedKabupaten?.nama || "");

      setFormData((prev) => ({
        ...prev,
        kabupaten_kota: value,
        kabupatenNama: formattedName,
        kecamatan: "",
        kecamatanNama: "",
        kelurahan: "",
        kelurahanNama: "",
      }));

      // Reset kecamatan dan kelurahan
      setKecamatanList([]);
      setKelurahanList([]);

      // Load kecamatan baru
      if (value) {
        fetchKecamatan(value);
      }
      return;
    }

    // Untuk field kecamatan
    if (name === "kecamatan") {
      const selectedKecamatan = kecamatanList.find((k) => k.id === value);

      setFormData((prev) => ({
        ...prev,
        kecamatan: value,
        kecamatanNama: selectedKecamatan?.name || "",
        kelurahan: "",
        kelurahanNama: "",
      }));

      // Reset kelurahan
      setKelurahanList([]);

      // Load kelurahan baru
      if (value) {
        fetchKelurahan(value);
      }
      return;
    }

    // Untuk field kelurahan
    if (name === "kelurahan") {
      const selectedKelurahan = kelurahanList.find((k) => k.id === value);
      const kelurahanName = selectedKelurahan?.name || "";

      if (!selectedDesa || kelurahanName !== selectedDesa.kelurahan) {
        if (registeredKelurahans.includes(kelurahanName)) {
          setKelurahanError(
            "Kelurahan ini sudah memiliki kelompok desa terdaftar"
          );
          return;
        } else {
          setKelurahanError("");
        }
      }

      setFormData((prev) => ({
        ...prev,
        kelurahan: value,
        kelurahanNama: kelurahanName,
      }));

      if (value && kelurahanName) {
        try {
          setLoadingCoordinates(true);

          // 1. Dapatkan nama wilayah lengkap
          const kecamatanName =
            kecamatanList.find((k) => k.id === formData.kecamatan)?.nama || "";
          const kabupatenName =
            kabupatenList.find((k) => k.id === formData.kabupaten_kota)?.nama ||
            "";

          // 2. Format query untuk Nominatim
          const queryParts = [
            kelurahanName,
            kecamatanName,
            "DIY", // Provinsi DIY
            "Indonesia",
          ].filter(Boolean);

          const query = queryParts.join(", ");

          // 3. Lakukan request ke Nominatim
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              query
            )}&limit=1&addressdetails=1`,
            {
              headers: {
                "User-Agent": "DesaPrimaApp/Developer (ilmaadien@gmail.com)",
                "Accept-Language": "id",
              },
            }
          );

          // 4. Proses hasil
          if (response.data?.length > 0) {
            const result = response.data[0];
            setFormData((prev) => ({
              ...prev,
              latitude: result.lat,
              longitude: result.lon,
            }));
          } else {
            // Fallback: Cari dengan query lebih luas
            const fallbackQuery = [kecamatanName, "DIY", "Indonesia"]
              .filter(Boolean)
              .join(", ");
            const fallbackResponse = await axios.get(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                fallbackQuery
              )}&limit=1`
            );

            if (fallbackResponse.data?.length > 0) {
              setFormData((prev) => ({
                ...prev,
                latitude: fallbackResponse.data[0].lat,
                longitude: fallbackResponse.data[0].lon,
              }));
            } else {
              toast.error("Koordinat tidak ditemukan. Silakan isi manual.");
            }
          }
        } catch (error) {
          console.error("Error fetching coordinates:", error);
          toast.error("Gagal mendapatkan koordinat. Silakan isi manual.");
        } finally {
          setLoadingCoordinates(false);
          // Delay untuk menghormati kebijakan Nominatim
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
      return;
    }

    // Untuk field lainnya
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const requiredFields = {
      nama: "Nama Kelompok Desa",
      kabupaten_kota: "Kabupaten/Kota",
      kecamatan: "Kecamatan",
      kelurahan: "Kelurahan",
      tanggal_pembentukan: "Tanggal Pembentukan",
    };

    const response = await axios.get(
      `https://backend-desa-prima-dev.student.stis.ac.id/kabupaten`
    );
    const kabupatenList = response.data;
    const normalizeName = (name) => {
      return name
        .replace(/KAB\.|KOTA|kab\.|kota/gi, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
    };

    const selectedKabupaten = kabupatenList.find((kab) => {
      const formName = normalizeName(formData.kabupatenNama);
      const dbName = normalizeName(kab.nama_kabupaten);

      // Cocokkan nama setelah normalisasi
      return dbName === formName;
    });

    if (
      !selectedKabupaten &&
      normalizeName(formData.kabupaten_kota) === "yogyakarta"
    ) {
      const jogjaKabupaten = kabupatenList.find(
        (kab) => normalizeName(kab.nama_kabupaten) === "yogyakarta"
      );
      if (jogjaKabupaten) {
        selectedKabupaten = jogjaKabupaten;
      }
    }

    if (!selectedKabupaten) {
      toast.error(
        `Kabupaten ${formData.kabupaten_kota} tidak ditemukan di database`
      );
      return;
    }

    const kabupatenId = selectedKabupaten.id;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const selectedDate = new Date(formData.tanggal_pembentukan);

    if (selectedDate > tomorrow) {
      console.log("Tanggal tidak boleh lebih dari hari ini.");
    }

    let kategori = "";

    const updatedFormData = {
      ...formData,
      kategori: "Belum dikategorikan",
      kabupatenId: kabupatenId,
      kabupaten_kota: formData.kabupatenNama,
      kabupatenNama: formData.kabupatenNama,
      kecamatan: formData.kecamatanNama,
      kecamatanNama: formData.kecamatanNama,
      kelurahan: formData.kelurahanNama,
      kelurahanNama: formData.kelurahanNama,
      latitude: formData.latitude === "" ? null : parseFloat(formData.latitude),
      longitude:
        formData.longitude === "" ? null : parseFloat(formData.longitude),
      userId: user.id,
    };

    try {
      if (selectedDesa) {
        // Edit data desa
        await axios.put(
          `https://backend-desa-prima-dev.student.stis.ac.id/kelompok/${selectedDesa.id}`,
          updatedFormData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        toast.success(`Data desa ${formData.nama} berhasil diubah!`, {
          position: "top-right",
        });
      } else {
        // Add new desa
        await axios.post(
          `https://backend-desa-prima-dev.student.stis.ac.id/kelompok`,
          updatedFormData
        );
        toast.success(`Data desa ${formData.nama} berhasil ditambahkan!`, {
          position: "top-right",
        });
      }

      setFormData({
        nama: "",
        kabupatenId: "",
        kabupaten_kota: "",
        kabupatenNama: "",
        kecamatan: "",
        kecamatanNama: "",
        kelurahan: "",
        kelurahanNama: "",
        tanggal_pembentukan: "",
        jumlah_hibah_diterima: "",
        jumlah_anggota_awal: "",
        status: "pending",
        catatan: "",
        latitude: "",
        longitude: "",
        userId: user.id,
      });

      onClose(true);
    } catch (error) {
      console.error("Error:", error.response?.data || error);
      let errorMessage = "Terjadi kesalahan dalam proses penyimpanan data";

      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;

        if (error.response.status === 400) {
          errorMessage =
            "Data tidak valid: " +
            (error.response.data?.errors?.join(", ") || errorMessage);
        }
      }

      toast.error(errorMessage, {
        position: "top-right",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-400 bg-opacity-50 flex justify-center items-center text-left z-50 p-4">
      {loading ? (
        <div className="flex items-center justify-center">
          <Audio type="Bars" color="#542d48" height={80} width={80} />
        </div>
      ) : (
        <div className="bg-white p-2 md:px-4 lg:px-4 md:py-3 lg:py-3 rounded-lg shadow-lg w-full max-w-lg md:max-w-xl lg:max-w-2xl max-h-screen overflow-auto relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <h2 className="text-lg md:text-xl lg:text-2xl font-semibold mb-2">
            {selectedDesa ? "Edit Data" : "Tambah Data Kelompok Desa"}
          </h2>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="relative">
              <div className="flex space-x-4 mb-2">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-900">
                    Nama Kelompok Desa
                  </label>
                  <label
                    className={`block text-xs ${
                      submitted && formData.nama === ""
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    Tuliskan nama kelompok desa
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    className={`cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                      submitted && formData.nama === ""
                        ? "ring-2 ring-inset ring-red-600"
                        : "ring-1 ring-inset ring-gray-300"
                    }  placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-900">
                    Tanggal Pembentukan
                  </label>
                  <label
                    className={`block text-xs ${
                      submitted && formData.tanggal_pembentukan === ""
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    Tuliskan tanggal pembentukan
                  </label>
                  <input
                    type="date"
                    name="tanggal_pembentukan"
                    value={formData.tanggal_pembentukan}
                    onChange={handleChange}
                    max={today}
                    className={`cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                      (submitted && formData.tanggal_pembentukan === "") ||
                      dateError
                        ? "ring-2 ring-inset ring-red-600"
                        : "ring-1 ring-inset ring-gray-300"
                    } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                  />
                  {dateError && (
                    <p className="mt-1 text-xs text-red-600">{dateError}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-2">
                <div ref={kabupatenRef} className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-900">
                    Kabupaten/Kota
                  </label>
                  <label
                    className={`block text-xs ${
                      submitted && formData.kabupaten_kota === ""
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    Pilih kabupaten/kota
                  </label>

                  {selectedDesa || getKabupatenFromURL() ? (
                    <input
                      type="text"
                      readOnly
                      value={formData.kabupatenNama}
                      className="cursor-not-allowed block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 bg-gray-100 sm:text-sm"
                    />
                  ) : (
                    <select
                      name="kabupaten_kota"
                      onChange={handleChange}
                      className={`custom-select block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                        submitted && formData.kabupaten_kota === ""
                          ? "ring-2 ring-inset ring-red-600"
                          : "ring-1 ring-inset ring-gray-300"
                      } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                      value={formData.kabupaten_kota}
                    >
                      <option value="" disabled>
                        Pilih Kabupaten/Kota
                      </option>
                      {kabupatenList.map((kabupaten) => (
                        <option key={kabupaten.id} value={kabupaten.id}>
                          {kabupaten.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {/* Kecamatan */}
                <div ref={kecamatanRef} className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-900">
                    Kecamatan
                  </label>
                  <label
                    className={`block text-xs ${
                      submitted && formData.kecamatan === ""
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    Pilih kecamatan
                  </label>
                  <select
                    name="kecamatan"
                    onChange={handleChange}
                    className={`custom-select block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                      submitted && formData.kecamatan === ""
                        ? "ring-2 ring-inset ring-red-600"
                        : "ring-1 ring-inset ring-gray-300"
                    } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                    value={
                      formData.kecamatan === ""
                        ? "Pilih Kecamatan"
                        : formData.kecamatan
                    }
                    disabled={!formData.kabupaten_kota}
                  >
                    <option value="">Pilih Kecamatan</option>
                    {kecamatanList.map((kecamatan) => (
                      <option key={kecamatan.id} value={kecamatan.id}>
                        {kecamatan.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Kelurahan */}
                <div ref={kelurahanRef} className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-900">
                    Kelurahan
                  </label>
                  <label
                    className={`block text-xs ${
                      submitted && formData.kelurahan === ""
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    Pilih Kelurahan
                  </label>
                  <select
                    name="kelurahan"
                    onChange={handleChange}
                    className={`custom-select block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                      (submitted && formData.kelurahan === "") || kelurahanError
                        ? "ring-2 ring-inset ring-red-600"
                        : "ring-1 ring-inset ring-gray-300"
                    } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                    value={
                      formData.kelurahan === ""
                        ? "Pilih kelurahan"
                        : formData.kelurahan
                    }
                    disabled={!formData.kecamatan}
                  >
                    <option value="">Pilih kelurahan</option>
                    {kelurahanList.map((kelurahan) => (
                      <option
                        key={kelurahan.id}
                        value={kelurahan.id}
                        disabled={
                          // Disable if registered AND not the current kelurahan in edit mode
                          registeredKelurahans.includes(kelurahan.name) &&
                          (!selectedDesa ||
                            kelurahan.name !== selectedDesa.kelurahan)
                        }
                      >
                        {kelurahan.name}
                        {registeredKelurahans.includes(kelurahan.name) &&
                          " (Sudah terdaftar)"}
                      </option>
                    ))}
                  </select>
                  {kelurahanError && (
                    <p className="mt-1 text-xs text-red-600">
                      {kelurahanError}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-4 mb-2">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-900">
                    Jumlah Hibah Diterima
                  </label>
                  <label
                    className={`block text-xs ${
                      submitted && formData.jumlah_hibah_diterima === ""
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    Tuliskan jumlah hibah diterima
                  </label>
                  <input
                    id="jumlah_hibah_diterima"
                    name="jumlah_hibah_diterima"
                    type="text"
                    value={
                      formData.jumlah_hibah_diterima === ""
                        ? ""
                        : formatNumber(formData.jumlah_hibah_diterima)
                    }
                    onChange={handleChange}
                    className={`cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                      (submitted && formData.jumlah_hibah_diterima === "") ||
                      validationMessages.hibah
                        ? "ring-2 ring-inset ring-red-600"
                        : "ring-1 ring-inset ring-gray-300"
                    } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                  />
                  {validationMessages.hibah && (
                    <p className="mt-1 text-xs text-red-600">
                      {validationMessages.hibah}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-900">
                    Jumlah Anggota Awal
                  </label>
                  <label
                    className={`block text-xs ${
                      submitted && formData.jumlah_anggota_awal === ""
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    Tuliskan jumlah anggota awal
                  </label>
                  <input
                    id="jumlah_anggota_awal"
                    name="jumlah_anggota_awal"
                    type="text"
                    value={
                      formData.jumlah_anggota_awal === ""
                        ? ""
                        : formatNumber(formData.jumlah_anggota_awal)
                    }
                    onChange={handleChange}
                    className={`cursor-pointer block w-full rounded-md border-0 py-2 px-2 mt-1 text-gray-900 shadow-sm ${
                      (submitted && formData.jumlah_anggota_awal === "") ||
                      validationMessages.anggota
                        ? "ring-2 ring-inset ring-red-600"
                        : "ring-1 ring-inset ring-gray-300"
                    } placeholder:text-gray-400 focus:ring-inset focus:ring-secondary sm:text-sm`}
                  />
                  {validationMessages.anggota && (
                    <p className="mt-1 text-xs text-red-600">
                      {validationMessages.anggota}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full flex justify-end">
              <button
                className="w-2/12 text-sm bg-red-200 mr-2 text-red-600 font-semibold py-1 px-2 rounded-md shadow-sm hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                onClick={onClose}
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-2/12 text-sm bg-blue-200 text-blue-600 font-semibold py-1 px-2 rounded-md shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                Kirim
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default KelompokModal;
