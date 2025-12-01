import React from "react";
import { formatRupiah } from "../../utils/format";

const ProdukPreview = ({ selectedItem }) => {
  const renderDetailRow = (label, value) => (
    <div className="flex flex-col md:flex-row p-2 border-b border-gray-100">
      <div className="font-medium text-gray-600 md:w-1/3 md:pr-4">{label}</div>

      <div className="text-gray-800 mt-0 md:w-2/3">{value || "-"}</div>
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white overflow-hidden">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 text-center">
          Detail Produk
        </h3>

        {renderDetailRow("Nama Produk", selectedItem.nama)}
        {renderDetailRow(
          "Harga",
          `${formatRupiah(selectedItem.harga_awal)} - ${formatRupiah(
            selectedItem.harga_akhir
          )}`
        )}
        {renderDetailRow("Pelaku Usaha", selectedItem.Anggota?.nama || "-")}
        {renderDetailRow("Nomor HP", selectedItem.Anggota?.nohp)}
        {renderDetailRow("Deskripsi", selectedItem.deskripsi)}

        <div className="rounded-lg p-3 md:p-4 my-4 md:my-6">
          <div className="bg-white rounded-md overflow-hidden shadow-inner w-full md:max-w-xs mx-auto">
            <img
              src={`https://backend-desa-prima-dev.student.stis.ac.id${selectedItem.foto}`}
              alt={selectedItem.nama}
              className="w-full h-auto max-h-64 md:max-h-180 object-contain"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/500x300?text=Gambar+Tidak+Tersedia";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProdukPreview;
