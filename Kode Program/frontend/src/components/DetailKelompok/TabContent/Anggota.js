import React, { useState, useEffect, useRef } from "react";
import useHighlightScroll from "../../hooks/useHighlightScroll";

const Anggota = ({
  anggota,
  profil,
  highlightId,
}) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const { highlightedRef, isHighlighted } = useHighlightScroll(highlightId, anggota);

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  // Hitung jumlah anggota berdasarkan sertifikasi
  const countByCertification = anggota.reduce((acc, member) => {
    const cert = member.sertifikasi || 'Tidak Ada';
    acc[cert] = (acc[cert] || 0) + 1;
    return acc;
  }, {});

  const certifications = [
    { name: 'NIB', label: 'NIB' },
    { name: 'PIRT', label: 'PIRT' },
    { name: 'Halal', label: 'Sertifikat Halal' },
    { name: 'BPOM', label: 'BPOM' },
  ];

  // Filter anggota berdasarkan jabatan penting
  const importantPositions = ['ketua', 'sekretaris', 'bendahara'];
  const filteredImportantMembers = anggota.filter(member => 
    importantPositions.includes(member.jabatan)
  );

  return (
    <div className="overflow-hidden h-full overflow-y-auto">
      {/* Sertifikasi Stats */}
      <div className="p-2 border-b border-gray-200">
        <h3 className="text-md font-semibold text-gray-700 mb-3">Kepemilikan Sertifikasi</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {certifications.map((cert) => (
            <div key={cert.name} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">{cert.label}</p>
              <p className="text-lg font-bold text-purple-600">{countByCertification[cert.name] || 0}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Daftar Pengurus */}
      <div className="p-3">
        {/* Mobile View */}
<div className="block md:hidden space-y-2">
  {filteredImportantMembers.length === 0 ? (
    <div className="text-center py-8 text-gray-500">
      Belum ada data pengurus
    </div>
  ) : (
    <>
      <h3 className="text-md font-semibold text-gray-700 mb-3">Daftar Pengurus</h3>
      {filteredImportantMembers.map((item, index) => (
        <div
          ref={isHighlighted(item) ? highlightedRef : null}
          key={item.id}
          className={`bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow ${
            isHighlighted(item) ? "border-2 border-red-500 bg-red-50" : ""
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className={`font-medium ${isHighlighted(item) ? "text-red-600" : "text-gray-900"}`}>
                {index + 1}. {item.nama}
              </h3>
              <div className="mt-1 space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="font-medium w-20">Jabatan</span>
                  <span>: {item.jabatan}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-20">No HP</span>
                  <span>: {item.nohp}</span>
                </div>
               
                <div className="flex items-center">
                  <span className="font-medium w-20">Sertifikasi</span>
                  <span>: {item.sertifikasi || "Tidak Ada"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )}
</div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          {filteredImportantMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada data pengurus
            </div>
          ) : (
            <>
              {/* Tambahkan judul hanya jika ada pengurus */}
              <h3 className="text-md font-semibold text-gray-700 mb-3">Daftar Pengurus</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Jabatan</th>
                  <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">No HP</th>
                  <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sertifikasi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-center">
                {filteredImportantMembers.map((item, index) => (
                  <tr
                    ref={isHighlighted(item) ? highlightedRef : null}
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors ${isHighlighted(item) ? "bg-red-50" : ""}`}
                  >
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isHighlighted(item) ? "text-red-600 font-bold" : "text-gray-500"}`}>
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.nama}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.jabatan}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.nohp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sertifikasi || "Tidak Ada"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Anggota;