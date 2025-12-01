const express = require("express");
const router = express.Router();
const {
  createPelaporan,
  getAllPelaporan,
  getPelaporanByKelompokId,
  getPelaporanByKabupaten,
  getPelaporanById,
  deletePelaporan,
  normalizeKabupaten, // Import fungsi helper
} = require("../service/pelaporanService");

// Get all pelaporan with filters
router.get("/all", async (req, res) => {
  try {
    const { startDate, endDate, kabupaten } = req.query;
    
    console.log("Query params:", { startDate, endDate, kabupaten }); // Debug log

    // Jika ada filter kabupaten, gunakan fungsi khusus
    if (kabupaten) {
      console.log("Filtering by kabupaten:", kabupaten); // Debug log
      const pelaporan = await getPelaporanByKabupaten(kabupaten);
      
      // Apply date filter jika ada
      let filteredPelaporan = pelaporan;
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Set end date to end of day
        end.setHours(23, 59, 59, 999);
        
        filteredPelaporan = pelaporan.filter(item => {
          const itemDate = new Date(item.tgl_lapor);
          return itemDate >= start && itemDate <= end;
        });
      }
      
      console.log("Returning filtered pelaporan:", filteredPelaporan.length); // Debug log
      return res.json(filteredPelaporan);
    }

    // Jika tidak ada filter kabupaten, gunakan getAllPelaporan
    const where = {};

    // Filter tanggal untuk query database
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Set end date to end of day
      end.setHours(23, 59, 59, 999);
      
      where.tgl_lapor = {
        gte: start,
        lte: end,
      };
    }

    console.log("Using getAllPelaporan with where:", where); // Debug log
    const pelaporan = await getAllPelaporan(where);
    console.log("Returning all pelaporan:", pelaporan.length); // Debug log
    res.json(pelaporan);
    
  } catch (error) {
    console.error("Error in /all route:", error);
    res.status(500).json({
      error: "Gagal mengambil data pelaporan",
      details: error.message,
    });
  }
});

// Get all pelaporan for a kelompok
router.get("/kelompok/:kelompokId", async (req, res) => {
  try {
    const pelaporan = await getPelaporanByKelompokId(req.params.kelompokId);
    res.json(pelaporan);
  } catch (error) {
    console.error("Error in /kelompok/:kelompokId route:", error);
    res.status(500).json({ 
      error: "Gagal mengambil data pelaporan",
      details: error.message 
    });
  }
});

// Get single pelaporan by ID
router.get("/detail/:id", async (req, res) => {
  try {
    const pelaporan = await getPelaporanById(req.params.id);
    if (!pelaporan) {
      return res.status(404).json({ error: "Pelaporan tidak ditemukan" });
    }
    res.json(pelaporan);
  } catch (error) {
    console.error("Error in /detail/:id route:", error);
    res.status(500).json({ 
      error: "Gagal mengambil data pelaporan",
      details: error.message 
    });
  }
});

// Delete pelaporan
router.delete("/:id", async (req, res) => {
  try {
    await deletePelaporan(req.params.id);
    res.json({ message: "Pelaporan berhasil dihapus" });
  } catch (error) {
    console.error("Error in DELETE /:id route:", error);
    res.status(500).json({ 
      error: "Gagal menghapus pelaporan",
      details: error.message 
    });
  }
});

// Route untuk debugging - bisa dihapus setelah testing
router.get("/debug/kabupaten/:kabupaten", async (req, res) => {
  try {
    const { kabupaten } = req.params;
    const normalized = normalizeKabupaten(kabupaten);
    
    res.json({
      original: kabupaten,
      normalized: normalized,
      decoded: decodeURIComponent(kabupaten)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;