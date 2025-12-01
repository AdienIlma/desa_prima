const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");
const fs = require("fs");
const xlsx = require('xlsx');
const { createPelaporan } = require('./pelaporanService');
const { updateKategoriJikaDiterima } = require('./kelompokService');

// Get all anggota with optional kabupaten filter
const getAllAnggota = async (kabupaten = null) => {
  try {
    const whereCondition = {};
    
    if (kabupaten) {
      const normalizedKabupaten = kabupaten.toUpperCase() === "KOTA YOGYAKARTA" 
        ? "KOTA YOGYAKARTA" 
        : `KAB. ${kabupaten.toUpperCase()}`;
      whereCondition.KelompokDesa = {
        kabupaten_kota: normalizedKabupaten
      };
    }

    const anggota = await prisma.anggota.findMany({
      where: whereCondition,
      include: {
        KelompokDesa: {
          select: {
            nama: true,
            kabupaten_kota: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });
    
    return anggota.map(item => ({
      id: item.id,
      nama: item.nama,
      jabatan: item.jabatan,
      nohp: item.nohp,
      kelompokId : item.kelompokId,
      kelompokDesa: {
        nama: item.KelompokDesa?.nama || '',
        kabupaten: item.KelompokDesa?.kabupaten_kota || ''
      }
    }));
  } catch (error) {
    console.error("Error in getAllAnggota:", error);
    throw error;
  }
};

// Get anggota by desa ID
const getAnggotaByDesaId = async (kelompokId) => {
  return await prisma.anggota.findMany({
    where: { kelompokId: parseInt(kelompokId) },
  });
};

// Add new anggota
const addAnggotaDesa = async (kelompokId, nama, nohp, jabatan, sertifikasi, userId) => {
  const anggota = await prisma.anggota.create({
    data: {
      kelompokId: parseInt(kelompokId),
      nama: nama,
      nohp: nohp,
      jabatan: jabatan,
      sertifikasi: sertifikasi
    },
  });

  // Create pelaporan
  await createPelaporan(kelompokId, `Penambahan anggota baru: ${nama} (${jabatan})`, userId, {
    anggotaId: anggota.id
  });

  await updateKategoriJikaDiterima(kelompokId);
  return anggota;
};

// Edit anggota
const editAnggotaDesa = async (id, kelompokId, nama, jabatan, nohp, sertifikasi) => {
  // Find anggota
  const anggota = await prisma.anggota.findUnique({
    where: { id: parseInt(id) },
  });

  if (!anggota) {
    throw new Error("Anggota tidak ditemukan");
  }

    // Update anggota
  const updatedAnggota = await prisma.anggota.update({
    where: { id: parseInt(id) },
    data: {
      kelompokId: parseInt(kelompokId) || anggota.kelompokId,
      nama: nama || anggota.nama,
      jabatan: jabatan || anggota.jabatan,
      nohp: nohp || anggota.nohp,
      sertifikasi: sertifikasi || anggota.sertifikasi
    },
  });

  // Update kategori jika kelompok diterima (baik kelompok lama atau baru)
  if (kelompokId) {
    await updateKategoriJikaDiterima(kelompokId);
  }
  if (anggota.kelompokId !== parseInt(kelompokId)) {
    await updateKategoriJikaDiterima(anggota.kelompokId);
  }

  return updatedAnggota;
};

// Delete anggota
const deleteAnggotaDesa = async (id) => {
  try {
    // Find anggota
    const anggota = await prisma.anggota.findUnique({
      where: { id: parseInt(id) },
    });

    if (!anggota) {
      throw new Error("Data anggota tidak ditemukan");
    }

    const kelompokId = anggota.kelompokId;

    // Delete from database
    const result = await prisma.anggota.delete({
      where: { id: parseInt(id) },
    });

    // Update kategori jika kelompok diterima
    await updateKategoriJikaDiterima(kelompokId);

    return result;
  } catch (error) {
    console.error("Error deleting anggota:", error.message);
    throw new Error("Gagal menghapus anggota");
  }
};

// Count total anggota
const countTotalAnggota = async (allDesa) => {
  return allDesa.reduce((sum, desa) => sum + (desa.jumlah_anggota_sekarang || 0), 0);
};

// Count anggota by kabupaten
const countAnggotaByKabupaten = async (kabupaten) => {
  if (typeof kabupaten !== "string") {
    throw new Error(`Parameter 'kabupaten' harus string. Diterima: ${kabupaten}`);
  }

  const kabupatenQuery = kabupaten.toUpperCase() === "YOGYAKARTA" 
    ? "KOTA YOGYAKARTA" 
    : `KAB. ${kabupaten.toUpperCase()}`;

  const count = await prisma.anggota.count({
    where: {
      KelompokDesa: {
        kabupaten_kota: {
          equals: kabupatenQuery,
        }
      }
    }
  });

  return count;
};

// Upload anggota from Excel
const uploadAnggotaFromExcel = async (kelompokId, filePath, userId) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      throw new Error("File Excel tidak berisi data");
    }

    const results = [];
    
    for (const row of data) {
      if (!row.Nama || !row.Jabatan) continue;

      const newAnggota = await prisma.anggota.create({
        data: {
          kelompokId: parseInt(kelompokId),
          nama: row.Nama,
          jabatan: row.Jabatan,
          nohp: row.Nohp ? String(row.Nohp) : null,
          sertifikasi: row.Sertifikasi || null
        }
      });

      await createPelaporan(
        kelompokId, 
        `Penambahan anggota ${row.Nama} via Excel`, 
        userId,
        { anggotaId: newAnggota.id }
      );

      results.push(newAnggota);
    }

     await updateKategoriJikaDiterima(kelompokId);

    return {
      success: true,
      count: results.length,
      data: results
    };
  } catch (error) {
    console.error("Error in uploadAnggotaFromExcel:", error);
    throw error;
  }
};

// Get anggota by kabupaten with detailed information
const getAnggotaByKabupaten = async (kabupaten) => {
  try {
    // Normalize kabupaten name
    const normalizedKabupaten = kabupaten.toUpperCase() === "YOGYAKARTA" 
      ? "KOTA YOGYAKARTA" 
      : `KAB. ${kabupaten.toUpperCase()}`;

    const anggota = await prisma.anggota.findMany({
      where: {
        KelompokDesa: {
          kabupaten_kota: normalizedKabupaten
        }
      },
      include: {
        KelompokDesa: {
          select: {
            id: true,
            nama: true,
            kategori: true,
            kabupaten_kota: true,
            tanggal_pembentukan: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });

    // Format response
    return anggota.map(item => ({
      id: item.id,
      nama: item.nama,
      jabatan: item.jabatan,
      nohp: item.nohp,
      sertifikasi: item.sertifikasi,
      kelompok: {
        id: item.KelompokDesa.id,
        nama: item.KelompokDesa.nama,
        kategori: item.KelompokDesa.kategori,
        kabupaten: item.KelompokDesa.kabupaten_kota,
        tanggal_pembentukan: item.KelompokDesa.tanggal_pembentukan
      }
    }));
  } catch (error) {
    console.error("Error in getAnggotaByKabupaten:", error);
    throw new Error(`Gagal mengambil data anggota: ${error.message}`);
  }
};

const downloadAnggotaData = async (kelompokId) => {
  try {
    // Validasi input
    if (!kelompokId || isNaN(kelompokId)) {
      throw new Error('ID kelompok tidak valid');
    }

    // Query database
    const anggota = await prisma.anggota.findMany({
      where: { kelompokId: parseInt(kelompokId) },
      include: {
        KelompokDesa: {
          select: {
            nama: true,
            kabupaten_kota: true,
            kecamatan: true,
            kelurahan: true
          }
        }
      },
      orderBy: { nama: 'asc' }
    });

    // Format data untuk Excel
    return anggota.map((item, index) => ({
      'No': index + 1,
      'Nama': item.nama || '-',
      'Jabatan': item.jabatan || '-',
      'No HP': item.nohp || '-',
      'Sertifikasi': item.sertifikasi || 'Tidak Ada',
      'Kelompok Desa': item.KelompokDesa?.nama || '-',
      'Kabupaten/Kota': item.KelompokDesa?.kabupaten_kota || '-',
      'Kecamatan': item.KelompokDesa?.kecamatan || '-',
      'Kelurahan': item.KelompokDesa?.kelurahan || '-'
    }));

  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

module.exports = {
  getAllAnggota,
  getAnggotaByDesaId,
  getAnggotaByKabupaten,
  addAnggotaDesa,
  editAnggotaDesa,
  deleteAnggotaDesa,
  countTotalAnggota,
  countAnggotaByKabupaten,
  uploadAnggotaFromExcel,
  downloadAnggotaData
};