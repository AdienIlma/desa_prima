import React, { useState, useEffect, useRef } from "react";
import AnggotaPreview from "./TabPreview/AnggotaPreview";
import DefaultPreview from "./TabPreview/DefaultPreview";
import KasPreview from "./TabPreview/KasPreview";
import KegiatanPreview from "./TabPreview/KegiatanPreview";
import LaporanPreview from "./TabPreview/LaporanPreview";
import ProdukPreview from "./TabPreview/ProdukPreview";
import { handleExcelUploadAnggota } from "../utils/excelUtils";
import useHighlightScroll from "../hooks/useHighlightScroll";

const PreviewContent = ({
  selectedTab,
  selectedItem,
  onEdit,
  onDelete,
  onAdd,
  desa,
  profil,
  anggota,
  kas,
  fetchAnggota,
  highlightId,
  hasAccess
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  const { highlightedRef, isHighlighted } = useHighlightScroll(
    highlightId, 
    selectedTab === "Anggota" ? anggota : 
    selectedTab === "Kas" ? kas : 
    []
  );

  const menuRef = useRef(null);

useEffect(() => {
  function handleClickOutside(event) {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setOpenMenuId(null);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  if (!selectedItem && selectedTab !== "Anggota" && selectedTab !== "Kas") {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <div className="text-gray-400 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-lg font-medium">
          Tidak ada item yang dipilih
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Pilih item untuk melihat preview
        </p>
      </div>
    );
  }

  const renderContent = () => {

    switch (selectedTab) {
    case "Anggota":
      return (
        <AnggotaPreview
          desa={desa}
          profil={profil}
          anggota={anggota}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onEdit={onEdit}
          onDelete={onDelete}
          onAdd={onAdd}
          handleExcelUpload={handleExcelUploadAnggota}
          isHighlighted={isHighlighted}
          highlightedRef={highlightedRef}
          fetchAnggota={fetchAnggota}
          hasAccess={hasAccess}
        />
      );
    case "Kas":
      return (
        <KasPreview
          desa={desa}
          kas={kas}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onEdit={onEdit}
          onDelete={onDelete}
          onAdd={onAdd}
          isHighlighted={isHighlighted}
          highlightedRef={highlightedRef}
          hasAccess={hasAccess}
        />
      );
    case "Produk":
      return <ProdukPreview selectedItem={selectedItem} />;
    case "Kegiatan":
      return <KegiatanPreview selectedItem={selectedItem} />;
    case "Laporan":
      return <LaporanPreview selectedItem={selectedItem} />;
    default:
      return <DefaultPreview />;
  }
  };

  return renderContent();
};

export default PreviewContent;
