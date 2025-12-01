const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");
const { createPelaporan } = require('./pelaporanService');
const { updateKategoriJikaDiterima } = require('./kelompokService'); 

const getKasByDesaId = async (kelompokId) => {
  return await prisma.kas.findMany({
    where: { kelompokId: parseInt(kelompokId) },
    orderBy: {
      tgl_transaksi: 'desc' // Urutkan berdasarkan tanggal transaksi terbaru
    }
  });
};

const addKasDesa = async (kelompokId, tgl_transaksi, jenis_transaksi, nama_transaksi, total_transaksi, file, userId) => {
  // Validate input
  if (!kelompokId || !tgl_transaksi || !jenis_transaksi || !nama_transaksi || !total_transaksi) {
    throw new Error("Semua field harus diisi");
  }

  // Convert to proper types
  const parsedTotal = parseInt(total_transaksi);
  if (isNaN(parsedTotal)) {
    throw new Error("Total transaksi harus berupa angka");
  }

  try {
    const kas = await prisma.kas.create({
      data: {
        kelompokId: parseInt(kelompokId),
        tgl_transaksi: new Date(tgl_transaksi),
        jenis_transaksi,
        nama_transaksi,
        total_transaksi: parsedTotal,
        file: file || null,
      },
    });

    // Buat pelaporan untuk transaksi kas baru
    await createPelaporan(kelompokId, `Pelaporan kas kelompok desa`, userId, {
      kasId: kas.id
    });

    await updateKategoriJikaDiterima(kelompokId);

    return kas;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Gagal menyimpan data kas");
  }
};

const editKasDesa = async (id, kelompokId, updateData) => {
  // Cari data kas berdasarkan ID
  const kas = await prisma.kas.findUnique({
    where: { id: parseInt(id) },
  });

  if (!kas) {
    throw new Error("Data kas tidak ditemukan");
  }

  const kasData = {
    nama_transaksi: updateData.nama_transaksi || kas.nama_transaksi,
    jenis_transaksi: updateData.jenis_transaksi || kas.jenis_transaksi,
    tgl_transaksi: updateData.tgl_transaksi ? new Date(updateData.tgl_transaksi) : kas.tgl_transaksi,
    total_transaksi: parseInt(updateData.total_transaksi) || kas.total_transaksi,
  };

  // Tambahkan file jika ada
  if (updateData.file) {
    kasData.file = updateData.file;
  }

  // Perbarui data kas
  const updatedKas = await prisma.kas.update({
    where: { 
      id: parseInt(id),
      kelompokId: parseInt(kelompokId),
    },
    data: kasData,
  });

  // Update kategori jika kelompok diterima
  await updateKategoriJikaDiterima(kelompokId);

  return updatedKas;
};

const deleteKasDesa = async (id) => {
  try {
    // Cari data berdasarkan ID
    const kas = await prisma.kas.findUnique({
      where: { id: parseInt(id) },
    });

    if (!kas) {
      throw new Error("Data kas tidak ditemukan");
    }

    const kelompokId = kas.kelompokId;

    // Hapus file terkait jika ada
    if (kas.file) {
      try {
        const filePath = path.join(__dirname, '..', 'uploads', kas.file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileError) {
        console.error("Gagal menghapus file kas:", fileError);
      }
    }

    // Hapus data dari database
    const result = await prisma.kas.delete({
      where: { id: parseInt(id) },
    });

    // Update kategori jika kelompok diterima
    await updateKategoriJikaDiterima(kelompokId);

    return result;
  } catch (error) {
    console.error("Error deleting kas:", error.message);
    throw new Error("Gagal menghapus kas");
  }
};

const getDesaWithKasSummary = async (id) => {
  // Ambil data desa
  const desa = await prisma.kelompokDesa.findUnique({
    where: { id: parseInt(id) },
  });

  if (!desa) return null;

  // Ambil semua transaksi kas untuk desa ini
  const kasTransactions = await prisma.kas.findMany({
    where: { kelompokId: parseInt(id) },
  });

  // Hitung total pemasukan dan pengeluaran
  let totalPemasukan = 0;
  let totalPengeluaran = 0;

  kasTransactions.forEach((transaction) => {
    if (transaction.jenis_transaksi === "Pemasukan") {
      totalPemasukan += transaction.total_transaksi;
    } else if (transaction.jenis_transaksi === "Pengeluaran") {
      totalPengeluaran += transaction.total_transaksi;
    }
  });

  // Hitung dana sekarang: hibah + pemasukan - pengeluaran
  const danaSekarang = desa.jumlah_hibah_diterima + totalPemasukan - totalPengeluaran;

  return {
    ...desa,
    jumlah_dana_sekarang: danaSekarang,
    kas: kasTransactions,
  };
};

module.exports = {
  getKasByDesaId,
  addKasDesa,
  editKasDesa,
  deleteKasDesa,
  getDesaWithKasSummary
};