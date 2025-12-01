const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  getProdukByDesaId,
  addProdukDesa,
  editProdukDesa,
  deleteProdukDesa,
  countProdukByDesaPerKabupaten,
  countProduk,
} = require("../service/produkService");

// Setup penyimpanan file dengan multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Direktori tempat file akan disimpan
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nama file yang unik
  },
});
const upload = multer({ storage: storage });

// Route untuk mendapatkan semua produk desa berdasarkan kelompokId
router.get("/:kelompokId/produk", async (req, res) => {
  try {
    const produk = await getProdukByDesaId(req.params.kelompokId);
    res.json(produk);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil produk desa" });
  }
});

// Route untuk menambahkan produk desa
router.post("/:kelompokId/produk", upload.single("foto"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File foto diperlukan" });
    }

    const foto = req.file ? `/uploads/${req.file.filename}` : null;
    const { nama, harga_awal, harga_akhir, anggotaId, deskripsi, userId } = req.body;

    const newProduk = await addProdukDesa(
      req.params.kelompokId,
      foto,
      nama,
      parseInt(harga_awal),
      parseInt(harga_akhir),
      deskripsi,
      anggotaId,
      userId
    );

    res.status(201).json(newProduk);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Gagal menambahkan produk desa",
      details: error.message,
    });
  }
});

// Route untuk menghapus produk desa
router.delete("/:kelompokId/produk/:id", async (req, res) => {
  try {
    const deletedProduk = await deleteProdukDesa(req.params.id);
    res.json(deletedProduk);
  } catch (error) {
    res.status(500).json({ error: "Gagal menghapus produk desa" });
  }
});

// Route untuk mengedit produk desa
router.put(
  "/:kelompokId/produk/:id",
  upload.single("foto"),
  async (req, res) => {
    console.log("Request body:", req.body);
    console.log("File received:", req.file);

    try {
      const { nama, harga_awal, harga_akhir, anggotaId, deskripsi } = req.body;

      // Handle file upload
      const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;

      // Prepare update data
      const updateData = {
        nama,
        harga_awal: parseInt(harga_awal),
        harga_akhir: parseInt(harga_akhir),
        deskripsi,
      };

      // Only add anggotaId if provided
      if (anggotaId) {
        updateData.anggotaId = anggotaId;
      }

      // Only add foto if a new file was uploaded
      if (imagePath) {
        updateData.foto = imagePath;
      }

      const updatedProduk = await editProdukDesa(
        req.params.id,
        req.params.kelompokId,
        updateData
      );

      res.json(updatedProduk);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        error: "Gagal mengedit produk desa",
        details: error.message,
      });
    }
  }
);

// Rute untuk menghitung jumlah produk tiap desa berdasarkan nama_kabupaten
router.get("/produk-per-desa/:kabupaten", async (req, res) => {
  try {
    const { kabupaten } = req.params;
    const produkCountByDesa = await countProdukByDesaPerKabupaten(kabupaten);

    res.status(200).json({
      success: true,
      data: produkCountByDesa,
    });
  } catch (error) {
    console.error("Error in /produk-per-desa/:namaKabupaten route:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghitung jumlah produk per desa",
      error: error.message,
    });
  }
});

// Rute untuk mendapatkan total produk
router.get("/total-produk", async (req, res) => {
  try {
    const { kabupaten } = req.query;
    const totalProduk = await countProduk(kabupaten);
    
    res.json({
      success: true,
      total: totalProduk,
      ...(kabupaten && { filtered_by: { kabupaten } })
    });
  } catch (error) {
    console.error("Error counting products:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menghitung produk",
      details: error.message,
    });
  }
});

module.exports = router;