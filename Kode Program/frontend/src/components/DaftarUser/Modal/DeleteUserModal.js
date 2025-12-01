import React from "react";

const DeleteUserModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemToDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Konfirmasi Hapus</h2>
        <p>
          Apakah Anda yakin ingin menghapus user{" "}
          <strong>{itemToDelete?.name}</strong>?
        </p>
        <div className="mt-4 flex justify-end gap-4">
          <button
            className="w-2/12 text-sm bg-gray-200 mr-2 text-gray-600 font-semibold py-1 px-2 rounded-md shadow-sm hover:bg-gray-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            className="w-2/12 text-sm bg-red-200 mr-2 text-red-600 font-semibold py-1 px-2 rounded-md shadow-sm hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
            onClick={onConfirm}
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;