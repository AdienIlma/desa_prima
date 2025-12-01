const StatusModal = ({ 
  isVisible, 
  selectedRow, 
  newStatus, 
  updating, 
  onClose, 
  onConfirm 
}) => {
  if (!isVisible || !selectedRow) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Konfirmasi Perubahan Status</h3>
        <p>
          Apakah Anda yakin ingin mengubah status kelompok desa{" "}
          <strong>{selectedRow.nama}</strong> menjadi{" "}
          <strong>{newStatus}</strong>?
        </p>
        <div className="flex justify-end space-x-3 mt-4">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={onConfirm} 
            disabled={updating} 
            className={`px-4 py-2 rounded-md text-white transition-colors ${
              newStatus === "disetujui" 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-red-500 hover:bg-red-600"
            } disabled:opacity-50`}
          >
            {updating ? "Memproses..." : "Konfirmasi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;