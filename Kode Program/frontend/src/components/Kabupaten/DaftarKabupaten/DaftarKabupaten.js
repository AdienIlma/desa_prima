import React, { useEffect, useState } from "react";
import { Audio } from "react-loader-spinner";
import ModalKabupaten from "../Modal/ModalKabupaten";
import { useNavigate } from "react-router-dom";
import KabupatenCard from "./KabupatenCard";
import useKabupatenData from "../hook/useKabupatenData";

const DaftarKabupaten = () => {
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedKabupaten, setSelectedKabupaten] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [kabupatenToDelete, setKabupatenToDelete] = useState(null);
  const [showLoader, setShowLoader] = useState(true);

  const navigate = useNavigate();
  const { allKabupaten, loading: loadingKab, refetch: refetchKabupaten } = useKabupatenData();

  useEffect(() => {
    if (!loadingKab ) {
      setShowLoader(false);
    }
  }, [loadingKab]);

  const hasError = error ;

  const openModal = (kabupaten = null) => {
    setSelectedKabupaten(kabupaten);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedKabupaten(null);
    refetchKabupaten(); // Refresh data setelah modal ditutup
  };

  const confirmDeleteKabupaten = (kabupaten) => {
    setKabupatenToDelete(kabupaten);
    setShowDeleteModal(true);
  };

  if (showLoader) {
      return (
        <div className="flex items-center justify-center h-screen">
          <Audio type="Bars" color="#542d48" height={80} width={80} />
        </div>
      );
    }
  
    if (hasError) {
      return <div className="text-center text-xl text-red-500">{hasError}</div>;
    }
  

  return (
    <div className="space-y-0">
      {/* Header Section */}
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Daftar Kabupaten/Kota
            </h1>
            <p className="text-gray-500 mt-1">
              Provinsi Daerah Istimewa Yogyakarta
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-purple-600 text-sm">
              {allKabupaten.length} Kabupaten/Kota
            </span>
          </div>
        </div>
      </div>

      <div className="px-7 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {allKabupaten.map((kabupaten) => (
          <KabupatenCard
            key={kabupaten.id}
            kabupaten={kabupaten}
            onEdit={() => openModal(kabupaten)}
            onDelete={() => confirmDeleteKabupaten(kabupaten)}
            onClick={() =>
              navigate(`/kabupaten-dashboard/${kabupaten.nama_kabupaten}`)
            }
          />
        ))}
      </div>

      {/* Empty State */}
      {allKabupaten.length === 0 && !showLoader && (
        <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak ada kabupaten</h3>
            <p className="text-gray-500">Belum ada data kabupaten yang tersedia</p>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ModalKabupaten
          isOpen={showModal}
          onClose={closeModal}
          selectedKabupaten={selectedKabupaten}
        />
      )}
    </div>
  );
};

export default DaftarKabupaten;