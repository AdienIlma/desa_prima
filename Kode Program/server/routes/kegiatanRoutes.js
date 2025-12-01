const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  createKegiatan,
  addKegiatanPhotos,
  getKegiatanByKelompokId,
  getKegiatanById,
  updateKegiatan,
  addKegiatanCatatan,
  deleteKegiatan,
  deleteKegiatanPhoto,
} = require("../service/kegiatanService");

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Create new kegiatan
router.post(
  "/:kelompokId/kegiatan",
  upload.fields([
    { name: "file_materi", maxCount: 1 },
    { name: "file_notulensi", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { kelompokId } = req.params;
      const { userId, nama_kegiatan, uraian, tanggal } = req.body;
      
      const file_materi = req.files["file_materi"]?.[0]?.filename;
      const file_notulensi = req.files["file_notulensi"]?.[0]?.filename;

      const newKegiatan = await createKegiatan(
        kelompokId,
        userId,
        {
          nama_kegiatan,
          uraian,
          tanggal,
          file_materi,
          file_notulensi,
        }
      );

      res.status(201).json(newKegiatan);
    } catch (error) {
      console.error("Error creating kegiatan:", error);
      res.status(500).json({ error: "Gagal membuat kegiatan baru" });
    }
  }
);

// Add photos to kegiatan
router.post(
  "/:kelompokId/kegiatan/:kegiatanId/foto",
  upload.array("photos", 10), // Max 10 photos
  async (req, res) => {
    try {
      const { kegiatanId } = req.params;
      const photos = await addKegiatanPhotos(
        kegiatanId,
        req.files.map(file => ({
          filename: file.filename,
          path: file.path
        }))
      );
      res.status(201).json(photos);
    } catch (error) {
      console.error("Error adding photos:", error);
      res.status(500).json({ error: "Gagal menambahkan foto kegiatan" });
    }
  }
);

// Get all kegiatan for a desa
router.get("/:kelompokId/kegiatan", async (req, res) => {
  try {
    const kegiatan = await getKegiatanByKelompokId(req.params.kelompokId);
    res.json(kegiatan);
  } catch (error) {
    console.error("Error fetching kegiatan:", error);
    res.status(500).json({ error: "Gagal mengambil data kegiatan" });
  }
});

// Get single kegiatan by ID
router.get("/kegiatan/:id", async (req, res) => {
  try {
    const kegiatan = await getKegiatanById(req.params.id);
    if (!kegiatan) {
      return res.status(404).json({ error: "Kegiatan tidak ditemukan" });
    }
    res.json(kegiatan);
  } catch (error) {
    console.error("Error fetching kegiatan:", error);
    res.status(500).json({ error: "Gagal mengambil data kegiatan" });
  }
});

// Update kegiatan info
router.put(
  "/:kelompokId/kegiatan/:id",
  upload.fields([
    { name: "file_materi", maxCount: 1 },
    { name: "file_notulensi", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { nama_kegiatan, uraian, tanggal } = req.body;
      
      const file_materi = req.files["file_materi"]?.[0]?.filename;
      const file_notulensi = req.files["file_notulensi"]?.[0]?.filename;

      const updatedKegiatan = await updateKegiatan(id, {
        nama_kegiatan,
        uraian,
        tanggal,
        file_materi,
        file_notulensi,
      });

      res.json(updatedKegiatan);
    } catch (error) {
      console.error("Error updating kegiatan:", error);
      res.status(500).json({ error: "Gagal memperbarui kegiatan" });
    }
  }
);

// Add catatan to kegiatan
router.patch("/:kelompokId/kegiatan/:id/catatan", async (req, res) => {
  try {
    const { id } = req.params;
    const { catatan } = req.body;
    
    const updatedKegiatan = await addKegiatanCatatan(id, catatan);
    res.json(updatedKegiatan);
  } catch (error) {
    console.error("Error adding catatan:", error);
    res.status(500).json({ error: "Gagal menambahkan catatan" });
  }
});

// Delete kegiatan
router.delete("/:kelompokId/kegiatan/:id", async (req, res) => {
  try {
    const deletedKegiatan = await deleteKegiatan(req.params.id);
    res.json(deletedKegiatan);
  } catch (error) {
    console.error("Error deleting kegiatan:", error);
    res.status(500).json({ error: "Gagal menghapus kegiatan" });
  }
});

// Delete single photo from kegiatan
router.delete("/:kelompokId/kegiatan/foto/:photoId", async (req, res) => {
  try {
    const deletedPhoto = await deleteKegiatanPhoto(req.params.photoId);
    res.json(deletedPhoto);
  } catch (error) {
    console.error("Error deleting photo:", error);
    res.status(500).json({ error: "Gagal menghapus foto" });
  }
});

module.exports = router;