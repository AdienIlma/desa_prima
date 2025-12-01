import React from "react";

const DeleteDetailModal = ({ isOpen, onClose, onConfirm, itemType, itemName = "" }) => {
  if (!isOpen) return null;

  const getItemTypeText = () => {
    switch (itemType) {
      case "kegiatan":
        return "kegiatan";
      case "laporan":
        return "laporan";
      case "produk":
        return "produk";
      case "anggota":
        return "anggota";
      case "kas":
        return "kas";
      case "desa":
        return "desa";
      default:
        return "item";
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Konfirmasi Hapus</h2>
        <p>
          Apakah Anda yakin ingin menghapus {getItemTypeText()}
          {itemName && ` "${itemName}"`}?
        </p>
        <div className="mt-4 flex justify-end gap-4">
          <button className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600" onClick={onClose}>
            Batal
          </button>
          <button className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600" onClick={onConfirm}>
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDetailModal;
