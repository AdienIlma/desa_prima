const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");
const { createPelaporan } = require("./pelaporanService");

// Get all products for a specific village with anggota data
const getProdukByDesaId = async (kelompokId) => {
  return await prisma.produk.findMany({
    where: { kelompokId: parseInt(kelompokId) },
    include: {
      Anggota: true, // Include anggota data
    },
  });
};

// Add new product
const addProdukDesa = async (
  kelompokId,
  foto,
  nama,
  harga_awal,
  harga_akhir,
  deskripsi,
  anggotaId,
  userId
) => {
  const produk = await prisma.produk.create({
    data: {
      kelompokId: parseInt(kelompokId),
      foto: foto,
      nama: nama,
      harga_awal: harga_awal,
      harga_akhir: harga_akhir,
      anggotaId: anggotaId ? parseInt(anggotaId) : null,
      deskripsi: deskripsi,
    },
    include: {
      Anggota: true,
    },
  });

  // Create reporting for new product
  await createPelaporan(kelompokId, `Penambahan produk baru: ${nama}`, userId, {
    produkId: produk.id,
  });

  return produk;
};

// Delete product
const deleteProdukDesa = async (id) => {
  const product = await prisma.produk.findUnique({
    where: { id: parseInt(id) },
  });

  if (!product) {
    throw new Error("Produk tidak ditemukan");
  }

  // Delete product image from server
  if (product.foto) {
    const filePath = path.join(__dirname, "..", "uploads", product.foto);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  // Delete from database
  return await prisma.produk.delete({
    where: { id: parseInt(id) },
  });
};

// Edit product
const editProdukDesa = async (id, kelompokId, updateData) => {
  try {
    // Prepare update data
    const produkData = {
      nama: updateData.nama,
      harga_awal: parseInt(updateData.harga_awal),
      harga_akhir: parseInt(updateData.harga_akhir),
      deskripsi: updateData.deskripsi,
    };

    // Add anggotaId if exists
    if (updateData.anggotaId) {
      produkData.anggotaId = parseInt(updateData.anggotaId);
    }

    // Add photo if exists
    if (updateData.foto) {
      produkData.foto = updateData.foto;
    }

    // Update with Prisma
    const updatedProduk = await prisma.produk.update({
      where: {
        id: parseInt(id),
        kelompokId: parseInt(kelompokId),
      },
      data: produkData,
      include: {
        Anggota: true,
      },
    });

    return updatedProduk;
  } catch (error) {
    console.error("Error in editProdukDesa:", error);
    throw new Error(`Gagal mengupdate produk: ${error.message}`);
  }
};

// Count products by village per regency
const countProdukByDesaPerKabupaten = async (namaKabupaten) => {
  // Get all villages with the same regency name
  const desaList = await prisma.kelompokDesa.findMany({
    where: {
      kabupaten: namaKabupaten,
    },
  });

  // Get all products from these villages
  const produkCountByDesa = {};

  for (const desa of desaList) {
    const produkCount = await prisma.produk.count({
      where: {
        kelompokId: desa.id,
      },
    });
    produkCountByDesa[desa.id] = produkCount;
  }

  return produkCountByDesa;
};

// Count total products
const countProduk = async (kabupaten = null) => {
  try {
    if (kabupaten) {
      // Normalisasi nama kabupaten
      const normalizedKabupaten =
        kabupaten.toUpperCase() === "KOTA YOGYAKARTA"
          ? "KOTA YOGYAKARTA"
          : `KAB. ${kabupaten.toUpperCase()}`;

      // 1. Cari semua desa di kabupaten tersebut
      const desaList = await prisma.kelompokDesa.findMany({
        where: {
          kabupaten_kota: normalizedKabupaten,
        },
        select: { id: true },
      });

      if (desaList.length === 0) return 0;

      // 2. Hitung produk di desa-desa tersebut
      return await prisma.produk.count({
        where: {
          kelompokId: { in: desaList.map((desa) => desa.id) },
        },
      });
    } else {
      // Jika tidak ada kabupaten, hitung semua produk
      return await prisma.produk.count();
    }
  } catch (error) {
    console.error("Error in countProduk:", error);
    throw new Error(`Gagal menghitung produk: ${error.message}`);
  }
};

module.exports = {
  getProdukByDesaId,
  addProdukDesa,
  deleteProdukDesa,
  editProdukDesa,
  countProdukByDesaPerKabupaten,
  countProduk,
};
