import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Audio } from "react-loader-spinner";

const createCustomIcon = (color) => {
  return L.divIcon({
    html: `<div style="background-color:${color}; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.2);">${
      color === "#EF4444" ? "T" : color === "#F59E0B" ? "B" : "M"
    }</div>`,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
};

const categoryIcons = {
  Maju: createCustomIcon("#10B981"),
  Berkembang: createCustomIcon("#F59E0B"),
  Tumbuh: createCustomIcon("#EF4444"),
  default: createCustomIcon("#94A3B8"),
};

const PetaDesa = () => {
  const [desaList, setDesaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kabupatenData, setKabupatenData] = useState([]);
  const [selectedKabupaten, setSelectedKabupaten] = useState("");
  const [selectedKabupatenId, setSelectedKabupatenId] = useState("");
  const [selectedKecamatan, setSelectedKecamatan] = useState("");
  const [kecamatanList, setKecamatanList] = useState([]);
  const [selectedKategori, setSelectedKategori] = useState("");
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    fetchDesaData();
    fetchKabupatenData();
  }, []);

  const fetchDesaData = async () => {
    try {
      const response = await axios.get(
        `https://backend-desa-prima-dev.student.stis.ac.id/kelompok`
      );
      setDesaList(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Gagal memuat data desa:", err);
      setLoading(false);
    }
  };

  const fetchKabupatenData = async () => {
    try {
      const response = await axios.get(`/data/kabupaten/34.json`);
      setKabupatenData(response.data);
    } catch (err) {
      console.error("Gagal memuat data kabupaten:", err);
    }
  };

  const fetchKecamatan = (kabupatenId) => {
    axios
      .get(`/data/kecamatan/${kabupatenId}.json`)
      .then((res) => {
        setKecamatanList(res.data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (selectedKabupatenId) {
      fetchKecamatan(selectedKabupatenId);
    } else {
      setKecamatanList([]);
    }
  }, [selectedKabupatenId]);

  const handleKabupatenChange = (e) => {
    const kabupaten =
      e.target.value === ""
        ? ""
        : e.target.options[e.target.selectedIndex].text;
    const kabupatenId = e.target.value;
    setSelectedKabupaten(kabupaten);
    setSelectedKabupatenId(kabupatenId);
    setSelectedKecamatan("");
  };

  const handleKecamatanChange = (e) => {
    setSelectedKecamatan(e.target.value);
  };

  const handleKategoriChange = (e) => {
    setSelectedKategori(e.target.value);
  };

  const filterDesa = () => {
    return desaList.filter((desa) => {
      const matchKabupaten = selectedKabupaten
        ? desa.kabupatenNama === selectedKabupaten
        : true;
      const matchKecamatan = selectedKecamatan
        ? desa.kecamatanNama === selectedKecamatan
        : true;
      const matchKategori = selectedKategori
        ? desa.kategori === selectedKategori
        : true;
      return matchKabupaten && matchKecamatan && matchKategori;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Audio type="Bars" color="#542d48" height={80} width={80} />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Sebaran Kelompok Desa Prima
            </h1>
            <p className="text-gray-500 mt-1">Daerah Istimewa Yogyakarta</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1.5" />
              {desaList.length} Desa
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Kabupaten Filter */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Kabupaten/Kota
            </label>
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 text-secondary border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg appearance-none"
                onChange={handleKabupatenChange}
                value={selectedKabupatenId}
              >
                <option value="">Semua Kabupaten</option>
                {kabupatenData.map((kabupaten) => (
                  <option key={kabupaten.id} value={kabupaten.id}>
                    {kabupaten.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Kecamatan Filter */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Kecamatan
            </label>
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 text-secondary border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg appearance-none disabled:opacity-50"
                onChange={handleKecamatanChange}
                value={selectedKecamatan}
                disabled={!selectedKabupatenId}
              >
                <option value="">Semua Kecamatan</option>
                {kecamatanList.map((kecamatan) => (
                  <option key={kecamatan.id} value={kecamatan.name}>
                    {kecamatan.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Kategori Filter */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Kategori
            </label>
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 text-secondary border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg appearance-none"
                onChange={handleKategoriChange}
                value={selectedKategori}
              >
                <option value="">Semua Kategori</option>
                <option value="Maju">Maju</option>
                <option value="Berkembang">Berkembang</option>
                <option value="Tumbuh">Tumbuh</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-[600px] w-full relative">
          <MapContainer
            center={[-7.7956, 110.3695]}
            zoom={10}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
            whenReady={() => setMapReady(true)}
            maxBounds={[
              [-8.2, 109.9],
              [-7.4, 110.9],
            ]}
            maxBoundsViscosity={1.0}
            minZoom={9}
            maxZoom={15}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {!mapReady && (
              <div className="absolute inset-0 bg-gray-50 bg-opacity-70 flex items-center justify-center">
                <div className="text-center">
                  <Audio type="Bars" color="#3B82F6" height={50} width={50} />
                  <p className="mt-2 text-gray-600">Memuat peta...</p>
                </div>
              </div>
            )}

            {filterDesa().length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center z-[500]">
                <div className="bg-white p-4 rounded-lg shadow-md text-center">
                  <p className="text-gray-600">
                    Tidak ada desa yang sesuai dengan filter
                  </p>
                </div>
              </div>
            ) : (
              filterDesa()
                .filter((desa) => desa.latitude && desa.longitude)
                .map((desa) => (
                  <Marker
                    key={desa.id}
                    position={[desa.latitude, desa.longitude]}
                    icon={categoryIcons[desa.kategori] || categoryIcons.default}
                  >
                    <Popup className="custom-popup">
                      <div className="space-y-1">
                        <h3 className="font-bold text-blue-600">
                          {desa.kelompok_desa}
                        </h3>
                        <p className="text-sm text-gray-600">
                          <span className="inline-block w-20">Kategori:</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              desa.kategori === "Maju"
                                ? "bg-green-100 text-green-800"
                                : desa.kategori === "Berkembang"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {desa.kategori}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="inline-block w-20">Kabupaten:</span>
                          {desa.kabupatenNama}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="inline-block w-20">Kecamatan:</span>
                          {desa.kecamatanNama}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="inline-block w-20">Kelurahan:</span>
                          {desa.kelurahanNama}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))
            )}
          </MapContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Keterangan</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Kategori Desa:</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Maju</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Berkembang</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Tumbuh</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetaDesa;
