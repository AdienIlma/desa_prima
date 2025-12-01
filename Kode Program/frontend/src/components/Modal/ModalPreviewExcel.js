import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const ModalPreviewExcel = ({
  isOpen,
  onClose,
  previewData,
  onConfirmUpload,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-auto">
        <h2 className="text-xl font-bold mb-4">Preview Data Excel</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                {previewData.columns.map((col, idx) => (
                  <th key={idx} className="py-2 px-4 border text-left">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.data.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-gray-50">
                  {previewData.columns.map((col, colIdx) => (
                    <td key={colIdx} className="py-2 px-4 border">
                      {row[col] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {previewData?.errors && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="h-5 w-5 text-red-500"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Validasi Gagal
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {previewData.errors.split("\n").map((error, i) => (
                    <p key={i}>{error}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <p>Total Data: {previewData.data.length}</p>
          <p className="text-red-500">
            Pastikan data sudah benar sebelum mengunggah
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Batal
          </button>
          <button
            onClick={onConfirmUpload}
            disabled={isLoading}
            className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Mengunggah..." : "Konfirmasi & Unggah"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPreviewExcel;
