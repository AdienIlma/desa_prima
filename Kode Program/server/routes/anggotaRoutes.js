const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path")
const fs = require("fs");
const xlsx = require("xlsx");

const {
  getAllAnggota,
  getAnggotaByDesaId,
  addAnggotaDesa,
  editAnggotaDesa,
  deleteAnggotaDesa,
  countAnggotaByKabupaten,
  uploadAnggotaFromExcel,
  getAnggotaByKabupaten,
  downloadAnggotaData
} = require("../service/anggotaService");
const jwt = require('jsonwebtoken');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.includes("excel") ||
      file.mimetype.includes("spreadsheet")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file Excel yang diizinkan"), false);
    }
  },
});

// Get all anggota (with optional kabupaten filter)
router.get("/all", async (req, res) => {
  try {
    const kabupaten = req.query.kabupaten ? decodeURIComponent(req.query.kabupaten) : null;
    const anggota = await getAllAnggota(kabupaten);
    
    res.json({
      success: true,
      data: anggota,
      // Tambahkan info filter jika ada
      ...(kabupaten && { filtered_by: { kabupaten } })
    });
  } catch (error) {
    console.error("Error fetching all anggota:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data anggota",
      details: error.message,
    });
  }
});

// Get anggota by kabupaten
router.get("/all/:kabupaten", async (req, res) => {
  try {
    const { kabupaten } = req.params;
    const decodedKabupaten = decodeURIComponent(kabupaten);
    const anggota = await getAnggotaByKabupaten(decodedKabupaten);
    
    res.json({
      success: true,
      data: anggota,
      kabupaten: decodedKabupaten,
      count: anggota.length
    });
  } catch (error) {
    console.error(`Error fetching anggota for ${req.params.kabupaten}:`, error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data anggota",
      details: error.message,
    });
  }
});

// Get anggota by desa ID
router.get("/:kelompokId/anggota", async (req, res) => {
  try {
    const anggota = await getAnggotaByDesaId(req.params.kelompokId);
    res.json(anggota);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil anggota desa" });
  }
});

// Add new anggota
router.post("/:kelompokId/anggota", async (req, res) => {
  try {
    const { nama, nohp, jabatan, sertifikasi, userId } = req.body;
    const newAnggota = await addAnggotaDesa(
      req.params.kelompokId,
      nama,
      nohp,
      jabatan,
      sertifikasi,
      userId
    );
    res.status(201).json(newAnggota);
  } catch (error) {
    res.status(500).json({ 
      error: "Gagal menambahkan anggota desa",
      details: error.message 
    });
  }
});

// Edit anggota
router.put(
  "/:kelompokId/anggota/:id",
  upload.single("foto"),
  async (req, res) => {
    try {
      const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
      const { nama, jabatan, nohp, sertifikasi } = req.body;
      
      const updatedAnggota = await editAnggotaDesa(
        req.params.id,
        req.params.kelompokId,
        nama,
        jabatan,
        nohp,
        sertifikasi
      );
      
      res.json(updatedAnggota);
    } catch (error) {
      res.status(500).json({ 
        error: "Gagal mengedit anggota desa",
        details: error.message 
      });
    }
  }
);

// Delete anggota
router.delete("/:kelompokId/anggota/:id", async (req, res) => {
  try {
    const deletedAnggota = await deleteAnggotaDesa(req.params.id);
    res.json(deletedAnggota);
  } catch (error) {
    res.status(500).json({ 
      error: "Gagal menghapus anggota desa",
      details: error.message 
    });
  }
});

// Count anggota by kabupaten
router.get("/count/:kabupaten", async (req, res) => {
  try {
    const { kabupaten } = req.params;
    const count = await countAnggotaByKabupaten(kabupaten);
    res.json({ kabupaten, count });
  } catch (error) {
    res.status(500).json({ 
      error: "Gagal menghitung jumlah anggota",
      details: error.message 
    });
  }
});

router.post(
  "/:desaId/anggota/upload-excel",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "File Excel diperlukan"
        });
      }

      // Verifikasi token
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Token tidak tersedia" });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      const result = await uploadAnggotaFromExcel(
        req.params.desaId,
        req.file.path,
        userId
      );

      // Hapus file setelah diproses
      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        count: result.data.length,
        data: result.data
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

router.get("/:kelompokId/anggota/download", async (req, res) => {
  try {
    // Validasi input
    const kelompokId = parseInt(req.params.kelompokId);
    if (isNaN(kelompokId)) {
      return res.status(400).send("ID kelompok tidak valid");
    }

    // Ambil data dari database
    const data = await downloadAnggotaData(kelompokId);

    // Validasi data kosong - kirim response plain text
    if (!data || data.length === 0) {
      return res.status(404).send("Tidak ada data anggota untuk kelompok ini");
    }

    // Buat file Excel
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Data Anggota");

    // Generate buffer
    const excelBuffer = xlsx.write(wb, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Set headers
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="data_anggota_${kelompokId}.xlsx"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Kirim response
    res.send(excelBuffer);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Terjadi kesalahan server");
  }
});


module.exports = router;