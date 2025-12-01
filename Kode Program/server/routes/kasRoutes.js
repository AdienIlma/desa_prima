const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  getKasByDesaId,
  addKasDesa,
  editKasDesa,
  deleteKasDesa,
  getDesaWithKasSummary,
} = require("../service/kasService");

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Error handling middleware
const handleError = (res, error) => {
  console.error(error);
  res.status(500).json({
    error: error.message || "Terjadi kesalahan server",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

// Get all kas for a specific desa
router.get("/:kelompokId/kas", async (req, res) => {
  try {
    const kas = await getKasByDesaId(req.params.kelompokId);
    res.json(kas);
  } catch (error) {
    handleError(res, error);
  }
});

// Get kas summary for a desa
router.get("/:kelompokId/summary", async (req, res) => {
  try {
    const summary = await getDesaWithKasSummary(req.params.kelompokId);
    if (!summary) {
      return res.status(404).json({ error: "Desa tidak ditemukan" });
    }
    res.json(summary);
  } catch (error) {
    handleError(res, error);
  }
});

// Add new kas entry
router.post("/:kelompokId/kas", upload.single("file"), async (req, res) => {
  try {
    const {
      tgl_transaksi,
      jenis_transaksi,
      nama_transaksi,
      total_transaksi,
      userId,
    } = req.body;

    if (
      !tgl_transaksi ||
      !jenis_transaksi ||
      !nama_transaksi ||
      !total_transaksi
    ) {
      return res.status(400).json({ error: "Semua field wajib diisi" });
    }

    const newKas = await addKasDesa(
      req.params.kelompokId,
      tgl_transaksi,
      jenis_transaksi,
      nama_transaksi,
      total_transaksi,
      req.file?.filename,
      userId
    );

    res.status(201).json(newKas);
  } catch (error) {
    handleError(res, error);
  }
});

// Update kas entry
router.put("/:kelompokId/kas/:id", upload.single("file"), async (req, res) => {
  try {
    const updateData = {
      nama_transaksi: req.body.nama_transaksi,
      jenis_transaksi: req.body.jenis_transaksi,
      tgl_transaksi: req.body.tgl_transaksi,
      total_transaksi: req.body.total_transaksi,
      ...(req.file && { file: req.file.filename }),
    };

    const updatedKas = await editKasDesa(
      req.params.id,
      req.params.kelompokId,
      updateData
    );

    res.json(updatedKas);
  } catch (error) {
    handleError(res, error);
  }
});

// Delete kas entry
router.delete("/:kelompokId/kas/:id", async (req, res) => {
  try {
    const deletedKas = await deleteKasDesa(req.params.id);
    res.json(deletedKas);
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
