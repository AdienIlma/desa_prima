import React from "react";
import { formatTanggal } from "../../utils/format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

const KegiatanPreview = ({ selectedItem }) => {
  const renderDetailRow = (label, value) => (
    <div className="flex flex-col md:flex-row p-2 border-b border-gray-100">
      <div className="font-medium text-gray-600 md:w-1/3 md:pr-4">{label}</div>

      <div className="text-gray-800 mt-0 md:w-2/3">{value || "-"}</div>
    </div>
  );

  return (
    <div className="p-2 md:p-4">
      <div className="bg-white rounded-lg md:rounded-xl shadow-sm overflow-hidden">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 text-center">
          Detail Kegiatan
        </h3>

        <div className="space-y-4 mb-4 md:mb-6">
          {renderDetailRow("Nama Kegiatan", selectedItem.nama_kegiatan)}
          {renderDetailRow("Tanggal", formatTanggal(selectedItem.tanggal))}
          {renderDetailRow("Uraian", selectedItem.uraian, true)}
        </div>

        {selectedItem.file_materi && (
          <div className="mb-4 md:mb-6 p-2">
            <h4 className="text-sm md:text-md font-semibold text-gray-700 mb-2">
              File Materi
            </h4>
            <a
              href={`https://backend-desa-prima-dev.student.stis.ac.id/uploads/${selectedItem.file_materi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center text-sm md:text-sm"
            >
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Download Materi
            </a>
          </div>
        )}

        {selectedItem.file_notulensi && (
          <div className="mb-4 md:mb-6 p-2">
            <h4 className="text-sm md:text-md font-semibold text-gray-700 mb-2">
              File Notulensi
            </h4>
            <a
              href={`https://backend-desa-prima-dev.student.stis.ac.id/uploads/${selectedItem.file_notulensi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center text-sm md:text-sm"
            >
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Download Notulensi
            </a>
          </div>
        )}

        {selectedItem.FotoKegiatan?.length > 0 && (
          <div className="mb-4 md:mb-6 p-2">
            <h4 className="text-sm md:text-md font-semibold text-gray-700 mb-3 md:mb-4">
              Dokumentasi Kegiatan
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2">
              {selectedItem.FotoKegiatan.map((foto, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-2">
                  <div className="aspect-w-32 aspect-h-18 bg-white rounded-md overflow-hidden shadow-inner">
                    <img
                      src={`https://backend-desa-prima-dev.student.stis.ac.id/uploads/${foto.gambar}`}
                      alt={`Dokumentasi kegiatan ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/500x300?text=Gambar+Tidak+Tersedia";
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-xs md:text-sm text-gray-500 mt-4 md:mt-6 p-2">
          Diunggah pada {formatTanggal(selectedItem.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default KegiatanPreview;
