const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");
const fs = require("fs");
const { createPelaporan } = require('./pelaporanService');

// Create new kegiatan (by pendamping)
const createKegiatan = async (kelompokId, userId, data) => {
  const { nama_kegiatan, uraian, tanggal, file_materi, file_notulensi } = data;

  const kegiatan = await prisma.kegiatan.create({
    data: {
      nama_kegiatan,
      uraian,
      file_materi: file_materi || null,
      file_notulensi: file_notulensi || null,
      tanggal: new Date(tanggal),
      kelompokId: parseInt(kelompokId),
    },
  });

  await createPelaporan(
    kelompokId,
    `Kegiatan baru: ${nama_kegiatan}`,
    userId, // Sertakan userId
    { kegiatanId: kegiatan.id }
  );

  return kegiatan;
};

// Add photos to kegiatan
const addKegiatanPhotos = async (kegiatanId, files) => {
  const photos = await Promise.all(
    files.map(async (file) => {
      return await prisma.fotoKegiatan.create({
        data: {
          gambar: file.filename,
          kegiatanId: parseInt(kegiatanId),
        },
      });
    })
  );

  return photos;
};

// Get all kegiatan for a desa
const getKegiatanByKelompokId = async (kelompokId) => {
  return await prisma.kegiatan.findMany({
    where: { kelompokId: parseInt(kelompokId) },
    include: {
      FotoKegiatan: true,
    },
    orderBy: {
      tanggal: 'desc',
    },
  });
};

// Get kegiatan by ID
const getKegiatanById = async (id) => {
  return await prisma.kegiatan.findUnique({
    where: { id: parseInt(id) },
    include: {
      FotoKegiatan: true,
      KelompokDesa: {
        select: {
          id: true,
          nama: true,
        },
      },
    },
  });
};

// Update kegiatan (basic info)
const updateKegiatan = async (id, data) => {
  const { tanggal, ...rest } = data;

  return await prisma.kegiatan.update({
    where: { id: parseInt(id) },
    data: {
      ...rest,
      tanggal: tanggal ? new Date(tanggal) : undefined,
    },
  });
};

// Add catatan to kegiatan (by pegawai)
const addKegiatanCatatan = async (id, catatan) => {
  return await prisma.kegiatan.update({
    where: { id: parseInt(id) },
    data: { catatan },
  });
};

// Delete kegiatan
const deleteKegiatan = async (id) => {
  // First, delete all related photos
  const photos = await prisma.fotoKegiatan.findMany({
    where: { kegiatanId: parseInt(id) },
  });

  // Delete photo files from server
  photos.forEach((photo) => {
    const filePath = path.join(__dirname, "../uploads", photo.gambar);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  // Delete photos from database
  await prisma.fotoKegiatan.deleteMany({
    where: { kegiatanId: parseInt(id) },
  });

  // Then delete the kegiatan
  return await prisma.kegiatan.delete({
    where: { id: parseInt(id) },
  });
};

// Delete single photo from kegiatan
const deleteKegiatanPhoto = async (photoId) => {
  const photo = await prisma.fotoKegiatan.findUnique({
    where: { id: parseInt(photoId) },
  });

  if (!photo) {
    throw new Error("Foto tidak ditemukan");
  }

  // Delete file from server
  const filePath = path.join(__dirname, "../uploads", photo.gambar);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Delete from database
  return await prisma.fotoKegiatan.delete({
    where: { id: parseInt(photoId) },
  });
};

module.exports = {
  createKegiatan,
  addKegiatanPhotos,
  getKegiatanByKelompokId,
  getKegiatanById,
  updateKegiatan,
  addKegiatanCatatan,
  deleteKegiatan,
  deleteKegiatanPhoto,
};