import React, { useState } from "react";
import { Transition } from "@headlessui/react";
import FormKegiatan from "./TabModal/FormKegiatan";
import FormLaporan from "./TabModal/FormLaporan";
import FormAnggota from "./TabModal/FormAnggota";
import FormProduk from "./TabModal/FormProduk";
import FormKasModal from "./TabModal/FormKas";

const TabDetailModal = ({
  isOpen,
  onClose,
  selectedDesa,
  activeTab,
  initialData,
  anggotaList,
}) => {
  // Buat objek berisi semua props yang sama
  const commonProps = {
    isOpen,
    onClose,
    selectedDesa,
    initialData,
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
      <div className="fixed inset-0 bg-gray-400 bg-opacity-50 flex justify-center items-center text-left z-50 p-4">
        {activeTab === "laporan" && <FormLaporan {...commonProps} />}
        {activeTab === "uraianProduk" && (
          <FormProduk {...commonProps} anggotaList={anggotaList || []} />
        )}
        {activeTab === "kasDesa" && <FormKasModal {...commonProps} />}
        {activeTab === "anggotaDesa" && <FormAnggota {...commonProps} />}
        {activeTab === "kegiatan" && <FormKegiatan {...commonProps} />}
      </div>
    </Transition>
  );
};

export default TabDetailModal;
