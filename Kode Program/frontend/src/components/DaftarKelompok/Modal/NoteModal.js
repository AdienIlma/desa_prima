const NoteModal = ({ 
  isVisible, 
  selectedRow, 
  noteInput, 
  updating, 
  onClose, 
  onSubmit, 
  onNoteChange 
}) => {
  if (!isVisible || !selectedRow) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">
          {selectedRow.catatan ? "Edit" : "Tambahkan"} Catatan untuk {selectedRow.nama}
        </h3>
        <textarea 
          value={noteInput} 
          onChange={(e) => onNoteChange(e.target.value)} 
          className="w-full p-2 border border-gray-300 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
          placeholder="Masukkan catatan..."
        />
        <div className="flex justify-end space-x-3 mt-4">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={onSubmit} 
            disabled={updating} 
            className="px-4 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 transition-colors disabled:opacity-50"
          >
            {updating ? "Menyimpan..." : "Simpan Catatan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;