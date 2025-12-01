const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  getLaporanByDesaId,
  getLaporanById,
  addLaporan,
  updateLaporan,
  deleteLaporan
} = require("../service/laporanService");

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

// Error handling middleware
const handleError = (res, error) => {
  console.error(error);
  res.status(500).json({ error: error.message || "Terjadi kesalahan server" });
};

// Get all laporan for a specific desa
router.get("/:kelompokId/laporan", async (req, res) => {
  try {
    const laporan = await getLaporanByDesaId(req.params.kelompokId);
    res.json(laporan);
  } catch (error) {
    handleError(res, error);
  }
});

// Get single laporan by ID
router.get("/laporan/:id", async (req, res) => {
  try {
    const laporan = await getLaporanById(req.params.id);
    if (!laporan) {
      return res.status(404).json({ error: "Laporan tidak ditemukan" });
    }
    res.json(laporan);
  } catch (error) {
    handleError(res, error);
  }
});

// Add new laporan
router.post("/:kelompokId/laporan", upload.single("file"), async (req, res) => {
  try {
    const { deskripsi, catatan, userId } = req.body;
    
    const newLaporan = await addLaporan({
      kelompokId: req.params.kelompokId,
      file: req.file, // multer will handle the file
      deskripsi,
      catatan,
      userId
    });

    res.status(201).json(newLaporan);
  } catch (error) {
    handleError(res, error);
  }
});

// Update laporan
router.put("/:kelompokId/laporan/:id", upload.single("file"), async (req, res) => {
  try {
    const updatedLaporan = await updateLaporan(
      req.params.id,
      {
        deskripsi: req.body.deskripsi,
        catatan: req.body.catatan
      },
      req.file
    );

    res.json(updatedLaporan);
  } catch (error) {
    handleError(res, error);
  }
});

// Delete laporan
router.delete("/:kelompokId/laporan/:id", async (req, res) => {
  try {
    const deletedLaporan = await deleteLaporan(req.params.id);
    res.json(deletedLaporan);
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;