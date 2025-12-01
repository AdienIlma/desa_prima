const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const multer = require("multer"); // Untuk menangani upload file
const path = require("path");
const fs = require("fs");
const {
  updateKelompok,
  hitungKategoriKelompok,
  hitungDanSimpanKategori,
  updateKelompokCatatan,
  updateKelompokStatus,
  getAllKelompok,
  getKelompokById,
  createKelompok,
  deleteKelompok,
  getKelompokByKabupaten,
  deleteMultipleItems,
  uploadExcel,
  confirmUpload,
  fixKategoriSemuaKelompok,
  triggerUpdateKategori,
} = require("../service/kelompokService");

const router = express.Router();

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

router.get("/", async (req, res) => {
  try {
    const kabupatenQuery = req.query.kabupaten;
    const kabupatenFilter = kabupatenQuery
      ? [kabupatenQuery.toUpperCase()]
      : null;

    const kelompok = await getAllKelompok(kabupatenFilter);
    res.json(kelompok);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data kelompok" });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = {
      ...req.body,
      latitude: parseFloat(req.body.latitude),
      longitude: parseFloat(req.body.longitude),
      kategori: req.body.kategori || "Belum dikategorikan",
    };

    const userId = req.body.userId;
    const newKelompok = await createKelompok(data, userId); // Data sudah termasuk kategori dari frontend
    res.status(201).json(newKelompok);
  } catch (error) {
    console.error("Error:", error);
    res.status(400).json({ error: "Gagal menyimpan data kelompok." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    console.log(`Mencoba update kelompok dengan ID: ${req.params.id}`);
    console.log("Data yang diterima:", req.body);

    // Normalisasi data sebelum diupdate
    const dataToUpdate = {
      ...req.body,
      latitude: req.body.latitude === "" ? null : parseFloat(req.body.latitude),
      longitude:
        req.body.longitude === "" ? null : parseFloat(req.body.longitude),
    };

    const updatedKelompok = await updateKelompok(req.params.id, dataToUpdate);

    if (!updatedKelompok) {
      console.log(`Desa dengan ID ${req.params.id} tidak ditemukan`);
      return res.status(404).json({ error: "Desa tidak ditemukan" });
    }

    res.json(updatedKelompok);
  } catch (error) {
    console.error("Error saat update desa:", error);
    res.status(500).json({
      error: "Gagal memperbarui data kelompok",
      details: error.message,
    });
  }
});

// Get kelompok by ID
router.get("/:id", async (req, res) => {
  try {
    console.log(`Fetching kelompok with ID: ${req.params.id}`); // Log the ID
    const kelompok = await getKelompokById(req.params.id);

    if (!kelompok) {
      console.log("Kelompok not found in database");
      return res.status(404).json({ error: "Kelompok tidak ditemukan" });
    }

    console.log("Successfully retrieved kelompok:", kelompok);
    res.json(kelompok);
  } catch (error) {
    console.error("Detailed error:", error); // Log the complete error
    res.status(500).json({
      error: "Gagal mengambil data kelompok",
      details: error.message, // Include error message in response
    });
  }
});

// Update status kelompok
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!status) {
    return res.status(400).json({
      success: false,
      error: "Status diperlukan dalam body request",
    });
  }

  try {
    // Validasi status lowercase
    const normalizedStatus = status.toLowerCase();
    const validStatuses = ["disetujui", "ditolak", "pending"];

    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        error: `Status ${status} tidak valid. Gunakan: ${validStatuses.join(
          ", "
        )}`,
      });
    }

    const updatedKelompok = await updateKelompokStatus(id, normalizedStatus);

    res.json({
      success: true,
      message: `Status kelompok ${id} berhasil diubah menjadi ${normalizedStatus}`,
      data: updatedKelompok,
    });
  } catch (error) {
    console.error(`Error updating status kelompok ${id}:`, error);

    const statusCode = error.message.includes("tidak ditemukan") ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      error: error.message || "Gagal memperbarui status kelompok.",
    });
  }
});

// Update catatan kelompok
router.patch("/:id/catatan", async (req, res) => {
  const { catatan } = req.body;
  try {
    const updatedCatatan = await updateKelompokCatatan(req.params.id, catatan);
    res.json(updatedCatatan);
  } catch (error) {
    console.error("Error updating catatan:", error);
    res.status(500).json({ error: "Gagal memperbarui catatan kelompok." });
  }
});

// Delete kelompok by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedKelompok = await deleteKelompok(req.params.id);
    res.json({
      success: true,
      message: "Kelompok berhasil dihapus beserta semua data terkait",
      data: deletedKelompok,
    });
  } catch (error) {
    console.error("Delete error:", error);

    if (error.message.includes("tidak ditemukan") || error.code === "P2025") {
      res.status(404).json({ error: "Kelompok tidak ditemukan" });
    } else if (
      error.message.includes("masih terkait") ||
      error.code === "P2003"
    ) {
      res.status(400).json({
        error: "Data tidak bisa dihapus karena masih terkait dengan data lain",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    } else {
      res.status(500).json({
        error: "Gagal menghapus kelompok",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
});

// Route untuk menghapus multiple items
router.post("/:id/delete-multiple", async (req, res) => {
  try {
    console.log("Incoming request:", {
      params: req.params,
      body: req.body,
      headers: req.headers,
    });

    // Validasi input
    const { type, ids } = req.body;
    const kelompokId = req.params.id;

    if (!type || typeof type !== "string") {
      return res.status(400).json({
        error: "Parameter 'type' harus ada dan berupa string",
        received: type,
      });
    }

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        error: "Parameter 'ids' harus ada dan berupa array",
        received: ids,
      });
    }

    if (ids.length === 0) {
      return res.status(400).json({
        error: "Array 'ids' tidak boleh kosong",
      });
    }

    // Eksekusi penghapusan
    const result = await deleteMultipleItems(kelompokId, type, ids);

    console.log("Delete successful:", result);
    res.json(result);
  } catch (error) {
    console.error("Error in delete route:", {
      message: error.message,
      stack: error.stack,
      request: {
        params: req.params,
        body: req.body,
      },
    });

    res.status(500).json({
      error: error.message || "Gagal menghapus item",
      type: "server_error",
      details:
        process.env.NODE_ENV === "development"
          ? {
              stack: error.stack,
              receivedData: {
                params: req.params,
                body: req.body,
              },
            }
          : undefined,
    });
  }
});

// Endpoint khusus untuk filter kabupaten (alternatif)
router.get("/kabupaten/:namaKabupaten", async (req, res) => {
  try {
    const kelompokList = await getKelompokByKabupaten(req.params.namaKabupaten);
    res.json(kelompokList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:kelompokId/hitung-ulang-kategori", async (req, res) => {
  try {
    const kategori = await hitungDanSimpanKategori(req.params.kelompokId);

    if (kategori) {
      console.log(`✅ Kategori berhasil dihitung dan disimpan: ${kategori}`);
      res.json({ success: true, kategori });
    } else {
      console.log(
        `⚠️ Kelompok belum berstatus diterima, kategori tidak diupdate`
      );
      res.json({
        success: false,
        message: "Kelompok belum berstatus diterima",
        kategori: null,
      });
    }

    res.json({ success: true, kategori });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/pegawai/fix-kategori", async (req, res) => {
  try {
    console.log("🔧 Starting fix kategori untuk semua kelompok...");

    const results = await fixKategoriSemuaKelompok();

    const summary = {
      total: results.length,
      berhasil: results.filter((r) => r.status === "✅ Berhasil").length,
      gagal: results.filter((r) => r.status === "❌ Gagal").length,
    };

    console.log("🎉 Fix kategori selesai:", summary);

    res.json({
      success: true,
      message: "Fix kategori selesai",
      summary,
      details: results,
    });
  } catch (error) {
    console.error("❌ Error fix kategori:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/:kelompokId/trigger-kategori", async (req, res) => {
  try {
    console.log(
      `🔄 Manual trigger update kategori untuk kelompok ${req.params.kelompokId}`
    );

    await triggerUpdateKategori(req.params.kelompokId);

    // Ambil data terbaru untuk konfirmasi
    const kelompok = await getKelompokById(req.params.kelompokId);

    res.json({
      success: true,
      message: "Trigger update kategori berhasil",
      kategori: kelompok?.kategori || null,
    });
  } catch (error) {
    console.error("❌ Error trigger kategori:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post(
  "/upload-excel",
  upload.single("file"),
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ message: "Tidak ada file yang diunggah" });
    }
    next();
  },
  uploadExcel
);
router.post("/confirm-upload", confirmUpload);

module.exports = router;
