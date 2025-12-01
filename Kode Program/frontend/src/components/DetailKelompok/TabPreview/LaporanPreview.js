import React from "react";
import { formatTanggal } from "../../utils/format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

const LaporanPreview = ({ selectedItem }) => {
  return (
    <div className="overflow-hidden">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Preview Dokumen
      </h3>

      <div className="bg-gray-50 rounded-lg mb-6 h-[500px]">
        <iframe
          src={`https://backend-desa-prima-dev.student.stis.ac.id/uploads/${selectedItem.file}`}
          className="w-full h-full border-0 rounded-md"
          title="Notulensi Preview"
        />
      </div>

      <div className="flex flex-col space-y-2 mb-6 p-4">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faDownload} className="text-gray-400 mr-2" />
          <a
            href={`https://backend-desa-prima-dev.student.stis.ac.id/uploads/${selectedItem.file}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Download Dokumen
          </a>
        </div>

        <div className="flex items-center text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>Diunggah pada {formatTanggal(selectedItem.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default LaporanPreview;
