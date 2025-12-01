const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create pelaporan record
const createPelaporan = async (
  kelompokId,
  deskripsi,
  userId,
  relatedData = {}
) => {
  try {
    return await prisma.pelaporan.create({
      data: {
        tgl_lapor: new Date(),
        deskripsi,
        userId: userId ? parseInt(userId) : null,
        kelompokId: parseInt(kelompokId),
        laporanId: relatedData.laporanId
          ? parseInt(relatedData.laporanId)
          : null,
        kegiatanId: relatedData.kegiatanId
          ? parseInt(relatedData.kegiatanId)
          : null,
        produkId: relatedData.produkId ? parseInt(relatedData.produkId) : null,
        kasId: relatedData.kasId ? parseInt(relatedData.kasId) : null,
        anggotaId: relatedData.anggotaId
          ? parseInt(relatedData.anggotaId)
          : null,
        isBatchUpload: deskripsi.includes("Excel upload"),
      },
      include: {
        KelompokDesa: true,
        Laporan: true,
        Kegiatan: true,
        Produk: true,
        kas: true,
        Anggota: true,
        User: true,
      },
    });
  } catch (error) {
    console.error("Error in createPelaporan:", error);
    throw error;
  }
};

// Get all pelaporan with filtering null relations
const getAllPelaporan = async (where = {}) => {
  try {
    const pelaporan = await prisma.pelaporan.findMany({
      where,
      include: {
        KelompokDesa: true,
        Laporan: true,
        Kegiatan: true,
        Produk: true,
        kas: true,
        Anggota: true,
        User: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        tgl_lapor: "desc",
      },
    });

    // Filter untuk menghilangkan relasi yang null
    return pelaporan.map((p) => ({
      ...p,
      Kegiatan: p.kegiatanId ? p.Kegiatan : null,
      Laporan: p.laporanId ? p.Laporan : null,
      Produk: p.produkId ? p.Produk : null,
      kas: p.kasId ? p.kas : null,
      Anggota: p.anggotaId ? p.Anggota : null,
    }));
  } catch (error) {
    console.error("Error in getAllPelaporan:", error);
    throw new Error("Gagal mengambil data pelaporan");
  }
};

// Get pelaporan by kelompok ID
const getPelaporanByKelompokId = async (kelompokId) => {
  try {
    const pelaporan = await prisma.pelaporan.findMany({
      where: { kelompokId: parseInt(kelompokId) },
      include: {
        Produk: true,
        Anggota: true,
        kas: true,
        Laporan: true,
        Kegiatan: true,
        KelompokDesa: {
          select: {
            nama: true,
            kabupaten_kota: true,
            tanggal_pembentukan: true,
            jumlah_anggota_awal: true,
            jumlah_hibah_diterima: true,
          },
        },
        User: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        tgl_lapor: "desc",
      },
    });

    return pelaporan.map((p) => ({
      ...p,
      Laporan: p.laporanId ? p.Laporan : null,
      Kegiatan: p.kegiatanId ? p.Kegiatan : null,
      Produk: p.produkId ? p.Produk : null,
      kas: p.kasId ? p.kas : null,
      Anggota: p.anggotaId ? p.Anggota : null,
    }));
  } catch (error) {
    console.error("Error in getPelaporanByKelompokId:", error);
    throw new Error("Gagal mengambil data pelaporan kelompok");
  }
};

const normalizeKabupaten = (kabupaten) => {
  if (!kabupaten) return "";
  
  // Decode URL encoding jika ada
  const decoded = decodeURIComponent(kabupaten);
  
  // Bersihkan dan normalisasi
  let cleaned = decoded.toString().trim().replace(/\s+/g, " ");
  
  // Handle special case untuk Yogyakarta
  if (cleaned.toUpperCase() === "KOTA YOGYAKARTA" || cleaned.toUpperCase() === "YOGYAKARTA") {
    return "KOTA YOGYAKARTA";
  }
  
  // Untuk kabupaten lainnya, hilangkan prefix KAB. jika ada
  if (cleaned.toUpperCase().startsWith("KAB. ")) {
    cleaned = cleaned.substring(5); // Hilangkan "KAB. "
  }
  
  // Return dalam format yang sesuai dengan database
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
};

// Get pelaporan by kabupaten - Versi yang diperbaiki
const getPelaporanByKabupaten = async (kabupaten) => {
  try {
    console.log("Input kabupaten:", kabupaten);
    
    // Normalisasi input kabupaten
    const normalizedKabupaten = normalizeKabupaten(kabupaten);
    console.log("Normalized kabupaten:", normalizedKabupaten);

    // 1. Dapatkan semua desa di kabupaten tersebut
    const desaList = await prisma.kelompokDesa.findMany({
      where: {
        kabupaten_kota: {
          contains: normalizedKabupaten.replace(/KAB\.\s*/i, '').trim(),
        }
      },
      select: { 
        id: true,
        nama: true,
        kabupaten_kota: true 
      },
    });

    console.log("Found desa:", desaList.length);
    
    if (desaList.length === 0) {
      throw new Error(`Tidak ditemukan desa untuk kabupaten: ${kabupaten}`);
    }

    const desaIds = desaList.map((desa) => desa.id);

    // 2. Dapatkan pelaporan untuk desa-desa tersebut
    const pelaporan = await prisma.pelaporan.findMany({
      where: {
        kelompokId: { in: desaIds },
      },
      include: {
        Produk: true,
        Anggota: true,
        kas: true,
        Laporan: true,
        Kegiatan: true,
        KelompokDesa: {
          select: {
            nama: true,
            kabupaten_kota: true,
            kecamatanNama: true,
            tanggal_pembentukan: true,
            jumlah_anggota_awal: true,
            jumlah_hibah_diterima: true,
          },
        },
        User: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        tgl_lapor: "desc",
      },
    });

    console.log("Found pelaporan:", pelaporan.length);

    return pelaporan.map((p) => ({
      ...p,
      Kegiatan: p.kegiatanId ? p.Kegiatan : null,
      Laporan: p.laporanId ? p.Laporan : null,
      Produk: p.produkId ? p.Produk : null,
      kas: p.kasId ? p.kas : null,
      Anggota: p.anggotaId ? p.Anggota : null,
    }));
  } catch (error) {
    console.error("Error in getPelaporanByKabupaten:", error);
    throw new Error(`Gagal mengambil data pelaporan: ${error.message}`);
  }
};

// Get pelaporan by ID
const getPelaporanById = async (id) => {
  try {
    const pelaporan = await prisma.pelaporan.findUnique({
      where: { id: parseInt(id) },
      include: {
        KelompokDesa: true,
        Laporan: true,
        Kegiatan: true,
        Produk: true,
        kas: true,
        Anggota: true,
      },
    });

    if (!pelaporan) return null;

    return {
      ...pelaporan,
      Kegiatan: pelaporan.kegiatanId ? pelaporan.Kegiatan : null,
      Laporan: pelaporan.laporanId ? pelaporan.Laporan : null,
      Produk: pelaporan.produkId ? pelaporan.Produk : null,
      kas: pelaporan.kasId ? pelaporan.kas : null,
      Anggota: pelaporan.anggotaId ? pelaporan.Anggota : null,
    };
  } catch (error) {
    console.error("Error in getPelaporanById:", error);
    throw new Error("Gagal mengambil detail pelaporan");
  }
};

// Delete pelaporan
const deletePelaporan = async (id) => {
  try {
    return await prisma.pelaporan.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    console.error("Error in deletePelaporan:", error);
    throw new Error("Gagal menghapus pelaporan");
  }
};

module.exports = {
  createPelaporan,
  getAllPelaporan,
  getPelaporanByKelompokId,
  getPelaporanById,
  deletePelaporan,
  getPelaporanByKabupaten,
  normalizeKabupaten, // Export fungsi helper
};