const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");
const { createPelaporan } = require("./pelaporanService");

const getFileNameWithoutExtension = (filename) => {
  return filename.replace(/\.[^/.]+$/, "");
};

// Get all laporan for a specific desa
const getLaporanByDesaId = async (kelompokId) => {
  return await prisma.laporan.findMany({
    where: { kelompokId: parseInt(kelompokId) },
    orderBy: { createdAt: "desc" },
  });
};

// Get single laporan by ID
const getLaporanById = async (id) => {
  return await prisma.laporan.findUnique({
    where: { id: parseInt(id) },
    include: {
      KelompokDesa: {
        select: {
          nama: true,
          kabupaten_kota: true,
        },
      },
    },
  });
};

// Update fungsi addLaporan
const addLaporan = async ({ kelompokId, file, deskripsi, catatan, userId }) => {
  try {
    // Check if file exists (for new uploads)
    if (file && !file.filename) {
      throw new Error("File upload tidak valid");
    }

    const nama_laporan = file ? 
      getFileNameWithoutExtension(file.originalname) : 
      "Laporan Tanpa File";

    const laporan = await prisma.laporan.create({
      data: {
        kelompokId: parseInt(kelompokId),
        nama_laporan,
        file: file ? file.filename : null,
        deskripsi,
        catatan
      },
    });

    // Create pelaporan record if userId is provided
    if (userId) {
      await createPelaporan(
        kelompokId,
        `Penambahan laporan baru: ${nama_laporan}`,
        userId,
        { laporanId: laporan.id }
      );
    }

    return laporan;
  } catch (error) {
    console.error("Error adding laporan:", error);
    throw error;
  }
};

// Update laporan
const updateLaporan = async (id, updateData, newFile) => {
  try {
    const dataToUpdate = { ...updateData };

    if (newFile) {
      // Get old laporan data
      const oldLaporan = await getLaporanById(id);

      // Delete old file if exists
      if (oldLaporan && oldLaporan.file) {
        const oldFilePath = path.join(__dirname, "../uploads", oldLaporan.file);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Update with new file data
      dataToUpdate.file = newFile.filename;
      dataToUpdate.nama_laporan = getFileNameWithoutExtension(
        newFile.originalname
      );
    }

    return await prisma.laporan.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });
  } catch (error) {
    console.error("Error updating laporan:", error);
    throw error;
  }
};

// Delete laporan
const deleteLaporan = async (id) => {
  try {
    const laporan = await prisma.laporan.findUnique({
      where: { id: parseInt(id) },
    });

    if (!laporan) {
      throw new Error("Laporan tidak ditemukan");
    }

    // Delete file if exists
    if (laporan.file) {
      const filePath = path.join(__dirname, "../uploads", laporan.file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return await prisma.laporan.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    console.error("Error deleting laporan:", error);
    throw error;
  }
};

module.exports = {
  getLaporanByDesaId,
  getLaporanById,
  addLaporan,
  updateLaporan,
  deleteLaporan,
};
