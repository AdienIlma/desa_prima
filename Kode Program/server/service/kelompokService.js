const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");
const { createPelaporan } = require("./pelaporanService");
const excelToJson = require("convert-excel-to-json");

const getAllKelompok = async (kabupatenFilter = null) => {
  // Jika kabupatenFilter tidak diberikan, gunakan filter default
  const filter = kabupatenFilter || [
    "KAB. KULON PROGO",
    "KAB. SLEMAN",
    "KAB. BANTUL",
    "KOTA YOGYAKARTA",
    "KAB. GUNUNGKIDUL",
  ];

  const kelompokList = await prisma.kelompokDesa.findMany({
    where: {
      kabupaten_kota: {
        in: filter, // Filter desa berdasarkan kabupaten yang ada di parameter URL atau default
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Tambahkan perhitungan jumlah anggota dan dana untuk setiap kelompok
  const kelompokWithCalculations = await Promise.all(
    kelompokList.map(async (kelompok) => {
      const jumlahAnggota = await hitungJumlahAnggota(kelompok.id);
      const jumlahDana = await hitungJumlahDana(kelompok.id);
      const kategori = await hitungKategoriKelompok(kelompok.id);

      return {
        ...kelompok,
        jumlah_anggota_sekarang: jumlahAnggota,
        jumlah_dana_sekarang: jumlahDana,
        kategori,
      };
    })
  );

  return kelompokWithCalculations;
};

const createKelompok = async (data, userId) => {
  // Pastikan semua field required ada
  if (!data.kabupatenId || !data.kelurahanNama) {
    throw new Error("Data yang diperlukan tidak lengkap");
  }

  const kelompok = await prisma.kelompokDesa.create({
    data: {
      nama: data.nama,
      kabupaten_kota: data.kabupaten_kota,
      kabupatenNama: data.kabupatenNama, // Tambahkan ini
      kecamatan: data.kecamatan,
      kecamatanNama: data.kecamatanNama, // Tambahkan ini
      kelurahan: data.kelurahan,
      kelurahanNama: data.kelurahanNama, // Ini yang diperlukan
      tanggal_pembentukan: new Date(data.tanggal_pembentukan),
      jumlah_hibah_diterima: data.jumlah_hibah_diterima,
      jumlah_anggota_awal: data.jumlah_anggota_awal,
      status: data.status || "pending", // Default value
      kategori: data.kategori || "Belum dikategorikan", 
      kabupatenId: data.kabupatenId,
      latitude: data.latitude,
      longitude: data.longitude,
    },
  });

  await createPelaporan(
    kelompok.id,
    `Pembentukan kelompok baru: ${kelompok.nama}`,
    userId
  );
  return kelompok;
};

const updateKelompok = async (id, data) => {
  const { tanggal_pembentukan, kabupatenId, userId, ...rest } = data;

  return await prisma.kelompokDesa.update({
    where: { id: Number(id) },
    data: {
      ...rest,
      tanggal_pembentukan: tanggal_pembentukan
        ? new Date(tanggal_pembentukan)
        : undefined,
      latitude: latitude === "" ? null : parseFloat(latitude),
      longitude: longitude === "" ? null : parseFloat(longitude),
    },
  });
};

const deleteKelompok = async (id) => {
  const kelompokId = parseInt(id);

  if (isNaN(kelompokId)) {
    throw new Error("ID kelompok tidak valid");
  }

  try {
    return await prisma.$transaction(async (prisma) => {
      // 1. Hapus semua FotoKegiatan terkait
      const kegiatanIds = await prisma.kegiatan
        .findMany({
          where: { kelompokId },
          select: { id: true },
        })
        .then((res) => res.map((k) => k.id));

      await prisma.fotoKegiatan.deleteMany({
        where: { kegiatanId: { in: kegiatanIds } },
      });

      // 2. Hapus semua Pelaporan yang terkait dengan kelompok atau entitas turunannya
      await prisma.pelaporan.deleteMany({
        where: {
          OR: [
            { kelompokId },
            {
              laporanId: {
                in: await prisma.laporan
                  .findMany({
                    where: { kelompokId },
                    select: { id: true },
                  })
                  .then((res) => res.map((l) => l.id)),
              },
            },
            { kegiatanId: { in: kegiatanIds } },
            {
              produkId: {
                in: await prisma.produk
                  .findMany({
                    where: { kelompokId },
                    select: { id: true },
                  })
                  .then((res) => res.map((p) => p.id)),
              },
            },
            {
              kasId: {
                in: await prisma.kas
                  .findMany({
                    where: { kelompokId },
                    select: { id: true },
                  })
                  .then((res) => res.map((k) => k.id)),
              },
            },
            {
              anggotaId: {
                in: await prisma.anggota
                  .findMany({
                    where: { kelompokId },
                    select: { id: true },
                  })
                  .then((res) => res.map((a) => a.id)),
              },
            },
          ],
        },
      });

      // 3. Hapus semua entitas utama yang terkait
      await prisma.kegiatan.deleteMany({ where: { kelompokId } });
      await prisma.laporan.deleteMany({ where: { kelompokId } });
      await prisma.produk.deleteMany({ where: { kelompokId } });
      await prisma.kas.deleteMany({ where: { kelompokId } });
      await prisma.anggota.deleteMany({ where: { kelompokId } });

      // 4. Update relasi User yang terhubung
      await prisma.user.updateMany({
        where: {
          OR: [
            { kelompokId },
            {
              kabupatenId: await prisma.kelompokDesa
                .findUnique({
                  where: { id: kelompokId },
                  select: { kabupatenId: true },
                })
                .then((k) => k?.kabupatenId),
            },
          ],
        },
        data: {
          kelompokId: null,
          kabupatenId: null,
        },
      });

      // 5. Hapus kelompok itu sendiri
      const deletedKelompok = await prisma.kelompokDesa.delete({
        where: { id: kelompokId },
      });

      return deletedKelompok;
    });
  } catch (error) {
    console.error("Detail error saat menghapus kelompok:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });

    if (error.code === "P2025") {
      throw new Error("Kelompok tidak ditemukan");
    } else if (error.code === "P2003") {
      throw new Error(
        "Tidak bisa dihapus karena masih ada data terkait yang gagal dihapus"
      );
    }
    throw new Error(`Gagal menghapus kelompok: ${error.message}`);
  }
};

const hitungJumlahAnggota = async (kelompokId) => {
  return await prisma.anggota.count({
    where: { kelompokId: parseInt(kelompokId) },
  });
};

const hitungJumlahDana = async (kelompokId) => {
  const kelompok = await prisma.kelompokDesa.findUnique({
    where: { id: parseInt(kelompokId) },
    select: { jumlah_hibah_diterima: true },
  });

  const kasTransactions = await prisma.kas.findMany({
    where: { kelompokId: parseInt(kelompokId) },
  });

  let totalPemasukan = 0;
  let totalPengeluaran = 0;

  kasTransactions.forEach((transaction) => {
    if (transaction.jenis_transaksi === "Pemasukan") {
      totalPemasukan += transaction.total_transaksi;
    } else if (transaction.jenis_transaksi === "Pengeluaran") {
      totalPengeluaran += transaction.total_transaksi;
    }
  });

  return kelompok.jumlah_hibah_diterima + totalPemasukan - totalPengeluaran;
};

const hitungDanSimpanKategori = async (kelompokId) => {
  try {
    const kelompok = await prisma.kelompokDesa.findUnique({
      where: { id: parseInt(kelompokId) },
      select: {
        status: true,
        nama: true,
        jumlah_hibah_diterima: true, // Pastikan field ini ada
      },
    });

    if (!kelompok) {
      throw new Error(`Kelompok dengan ID ${kelompokId} tidak ditemukan`);
    }

    // Hitung jumlah anggota dan dana
    const [jumlahAnggota, jumlahDana] = await Promise.all([
      hitungJumlahAnggota(kelompokId),
      hitungJumlahDana(kelompokId),
    ]);

    // Validasi data
    if (jumlahDana === null || jumlahDana === undefined) {
      throw new Error("Gagal menghitung jumlah dana");
    }

    // Tentukan kategori
    let kategori;
    if (jumlahAnggota > 35 && jumlahDana > 40000000) {
      kategori = "Maju";
    } else if (jumlahAnggota >= 31 && jumlahDana > 30000000) {
      kategori = "Berkembang";
    } else {
      kategori = "Tumbuh";
    }

    // Update kategori
    await prisma.kelompokDesa.update({
      where: { id: parseInt(kelompokId) },
      data: { kategori },
    });

    return kategori;
  } catch (error) {
    console.error(`Error dalam hitungDanSimpanKategori:`, error);
    throw new Error(`Gagal menentukan kategori: ${error.message}`);
  }
};

const updateKelompokStatus = async (id, status) => {
  // Validasi ID sebagai number
  const kelompokId = Number(id);
  if (isNaN(kelompokId)) {
    throw new Error("ID kelompok harus berupa angka");
  }

  // Cek apakah kelompok ada
  const existingKelompok = await prisma.kelompokDesa.findUnique({
    where: { id: kelompokId },
  });

  if (!existingKelompok) {
    throw new Error(`Kelompok dengan ID ${id} tidak ditemukan`);
  }

  // Update status
  const updateData = { status };

  try {
    const updatedKelompok = await prisma.kelompokDesa.update({
      where: { id: kelompokId },
      data: updateData,
    });

    // Jika status berubah menjadi "disetujui", hitung dan simpan kategori
    if (status === "disetujui") {
      try {
        const kategori = await hitungDanSimpanKategori(kelompokId);

        await prisma.kelompokDesa.update({
          where: { id: kelompokId },
          data: { kategori },
        });

        updatedKelompok.kategori = kategori;
      } catch (kategoriError) {
        console.error(`Gagal menghitung kategori:`, kategoriError);
        // Tetapi tetap kembalikan update status yang berhasil
      }
    } else if (existingKelompok.status === "disetujui") {
      // Jika status sebelumnya "disetujui" dan berubah ke status lain
      await prisma.kelompokDesa.update({
        where: { id: kelompokId },
        data: { kategori: "Belum dikategorikan" },
      });
    }

    return updatedKelompok;
  } catch (error) {
    console.error(`Error updating kelompok ${id}:`, error);
    throw new Error(`Gagal memperbarui status: ${error.message}`);
  }
};

const hitungKategoriKelompok = async (kelompokId) => {
  const kelompok = await prisma.kelompokDesa.findUnique({
    where: { id: parseInt(kelompokId) },
    select: {
      status: true,
    },
  });

  if (!kelompok || kelompok.status !== "disetujui") {
    console.log(`Kelompok ${kelompokId} tidak disetujui`);
    return null;
  }

  const jumlahAnggota = await hitungJumlahAnggota(kelompokId);
  const jumlahDana = await hitungJumlahDana(kelompokId);

  console.log(`Kategori Kelompok ${kelompokId}:
      Anggota: ${jumlahAnggota},
      Dana: Rp${jumlahDana.toLocaleString()}`);

  // Tentukan kategori (hanya return, tidak simpan)
  if (jumlahAnggota > 35 && jumlahDana > 40000000) return "Maju";
  if (jumlahAnggota >= 31 && jumlahDana > 30000000) return "Berkembang";
  return "Tumbuh";
};

// Fungsi untuk update kategori semua kelompok diterima (fix data existing)
const fixKategoriSemuaKelompok = async () => {
  console.log(
    "🔧 Memperbaiki kategori untuk semua kelompok yang sudah diterima..."
  );

  const kelompokDiterima = await prisma.kelompokDesa.findMany({
    where: { status: "disetujui" },
    select: { id: true, nama: true },
  });

  console.log(
    `📋 Ditemukan ${kelompokDiterima.length} kelompok dengan status disetujui`
  );

  const results = [];
  for (const kelompok of kelompokDiterima) {
    try {
      const kategori = await hitungDanSimpanKategori(kelompok.id);
      results.push({
        id: kelompok.id,
        nama: kelompok.nama,
        kategori: kategori,
        status: "✅ Berhasil",
      });
    } catch (error) {
      console.error(`❌ Error updating kelompok ${kelompok.id}:`, error);
      results.push({
        id: kelompok.id,
        nama: kelompok.nama,
        error: error.message,
        status: "❌ Gagal",
      });
    }
  }

  console.log("🎉 Selesai memperbaiki kategori!");
  return results;
};

// Fungsi trigger untuk update kategori saat ada perubahan
const triggerUpdateKategori = async (kelompokId) => {
  try {
    const kelompok = await prisma.kelompokDesa.findUnique({
      where: { id: parseInt(kelompokId) },
      select: { status: true, nama: true },
    });

    // Hanya update jika status diterima
    if (kelompok && kelompok.status === "disetujui") {
      console.log(
        `🔄 Trigger update kategori untuk kelompok: ${kelompok.nama}`
      );
      await hitungDanSimpanKategori(kelompokId);
    }
  } catch (error) {
    console.error(
      `❌ Error trigger update kategori kelompok ${kelompokId}:`,
      error
    );
  }
};

const updateKelompokCatatan = async (id, catatan) => {
  return await prisma.kelompokDesa.update({
    where: { id: Number(id) },
    data: { catatan },
  });
};

const getKelompokById = async (id) => {
  try {
    if (isNaN(Number(id))) {
      throw new Error("ID harus berupa angka");
    }

    const kelompok = await prisma.kelompokDesa.findUnique({
      where: { id: Number(id) },
    });

    if (!kelompok) {
      return null;
    }

    // Hitung jumlah anggota dan dana secara dinamis
    const jumlahAnggota = await hitungJumlahAnggota(id);
    const jumlahDana = await hitungJumlahDana(id);
    let kategori;

    try {
      kategori = await hitungKategoriKelompok(id);
    } catch (kategoriError) {
      console.error("Error calculating kategori:", kategoriError);
      kategori = "Error"; // Default value if kategori calculation fails
    }

    // Handle date serialization
    const result = {
      ...kelompok,
      jumlah_anggota_sekarang: jumlahAnggota,
      jumlah_dana_sekarang: jumlahDana,
      kategori,
      tanggal_pembentukan: kelompok.tanggal_pembentukan?.toISOString(), // Convert Date to string
    };

    return result;
  } catch (error) {
    console.error("Error in getKelompokById:", error);
    throw error; // Re-throw for the route handler
  }
};

const getKelompokByKabupaten = async (kabupaten) => {
  try {
    if (!kabupaten) throw new Error("Parameter kabupaten diperlukan");
    // Decode URL dan standarisasi format
    const decodedKabupaten = decodeURIComponent(kabupaten)
      .toUpperCase()
      .replace("KAB.", "KAB. ")
      .trim();

    // Cek format kabupaten di database
    const kelompok = await prisma.kelompok.findMany({
      where: {
        OR: [
          { kabupaten_kota: decodedKabupaten },
          { kabupaten_kota: decodedKabupaten.replace("KAB. ", "KAB.") },
        ],
      },
      orderBy: {
        id: "desc",
      },
    });

    if (kelompok.length === 0) {
      throw new Error(
        `Data tidak ditemukan untuk kabupaten ${decodedKabupaten}`
      );
    }

    return kelompok;
  } catch (error) {
    console.error("[SERVICE ERROR] getKelompokByKabupaten:", error.message);
    throw new Error(`Gagal mengambil data: ${error.message}`);
  }
};

const deleteMultipleItems = async (kelompok_id, type, ids) => {
  try {
    // Validasi parameter
    if (!kelompok_id || isNaN(kelompok_id)) {
      throw new Error("ID kelompok tidak valid");
    }

    if (!Array.isArray(ids)) {
      throw new Error("Parameter ids harus berupa array");
    }

    if (ids.length === 0) {
      throw new Error("Tidak ada ID yang diberikan");
    }

    // Konversi semua ID ke number
    const numericIds = ids.map((id) => parseInt(id)).filter((id) => !isNaN(id));
    if (numericIds.length !== ids.length) {
      throw new Error("Beberapa ID tidak valid");
    }

    // Pemilihan model dengan error handling
    let modelConfig;
    const normalizedType = type.toLowerCase().trim();

    switch (normalizedType) {
      case "produk":
        modelConfig = {
          model: prisma.produk,
          where: {
            id: { in: numericIds },
            kelompokId: parseInt(kelompok_id),
          },
        };
        break;
      case "anggota":
        modelConfig = {
          model: prisma.anggota,
          where: {
            id: { in: numericIds },
            kelompokId: parseInt(kelompok_id),
          },
        };
        break;
      case "laporan":
        modelConfig = {
          model: prisma.laporan,
          where: {
            id: { in: numericIds },
            kelompokId: parseInt(kelompok_id),
          },
        };
        break;
      case "kegiatan":
        // menghapus FotoKegiatan
        await prisma.fotoKegiatan.deleteMany({
          where: { kegiatanId: { in: numericIds } },
        });

        modelConfig = {
          model: prisma.kegiatan,
          where: {
            id: { in: numericIds },
            kelompokId: parseInt(kelompok_id),
          },
        };
        break;
      default:
        throw new Error(`Tipe '${type}' tidak dikenali`);
    }

    // Eksekusi penghapusan dengan Prisma
    const deleteResult = await modelConfig.model.deleteMany({
      where: modelConfig.where,
    });

    if (deleteResult.count === 0) {
      throw new Error(
        "Tidak ada dokumen yang terhapus (mungkin tidak ditemukan)"
      );
    }

    // Hapus file-file terkait jika ada
    if (["kegiatan", "anggota", "produk", "laporan"].includes(normalizedType)) {
      const fieldMap = {
        kegiatan: ["file_materi", "file_notulensi"],
        anggota: ["foto"],
        produk: ["foto"],
        laporan: ["file"],
      };

      const fieldsToSelect = fieldMap[normalizedType] || [];

      if (fieldsToSelect.length > 0) {
        const items = await modelConfig.model.findMany({
          where: { id: { in: numericIds } },
          select: fieldsToSelect.reduce((acc, field) => {
            acc[field] = true;
            return acc;
          }, {}),
        });

        for (const item of items) {
          for (const field of fieldsToSelect) {
            const filePath = item[field];
            if (filePath) {
              try {
                const fullPath = path.join(
                  __dirname,
                  "..",
                  "uploads",
                  filePath
                );
                if (fs.existsSync(fullPath)) {
                  fs.unlinkSync(fullPath);
                }
              } catch (fileError) {
                console.error(`Gagal menghapus file ${filePath}:`, fileError);
              }
            }
          }
        }
      }
    }

    return {
      success: true,
      message: `Berhasil menghapus ${deleteResult.count} item`,
      deletedCount: deleteResult.count,
    };
  } catch (error) {
    console.error("Error in deleteMultipleItems:", {
      message: error.message,
      stack: error.stack,
      inputParams: { kelompok_id, type, ids },
    });
    throw error;
  }
};

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Tidak ada file yang diunggah" });
    }

    const filePath = path.join(__dirname, "../uploads", req.file.filename);

    // Konversi Excel ke JSON
    const excelData = excelToJson({
      sourceFile: filePath,
      header: {
        rows: 1, // Baris pertama sebagai header
      },
      columnToKey: {
        "*": "{{columnHeader}}",
      },
      sheets: ["Kelompok Desa"],
    });

    // Hapus file setelah diproses
    fs.unlinkSync(filePath);

    // Kirim data preview ke frontend
    const previewData = {
      columns: Object.keys(excelData["Kelompok Desa"][0] || {}),
      data: excelData["Kelompok Desa"].slice(0, 10), // Ambil 10 data pertama untuk preview
    };

    res.status(200).json(previewData);
  } catch (error) {
    console.error("Error processing Excel:", error);
    res.status(500).json({ message: "Gagal memproses file Excel" });
  }
};

const confirmUpload = async (req, res) => {
  try {
    const { data, userId } = req.body;

    // Validasi dasar
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ message: "Data harus berupa array" });
    }

    const results = {
      successCount: 0,
      errorCount: 0,
      errors: [],
      savedData: [],
    };

    // Ambil data referensi wilayah sekali saja
    const wilayahDIY = await axios.get(
      "https://ibnux.github.io/data-indonesia/kabupaten/34.json"
    );
    const kabupatenList = wilayahDIY.data;

    // Fungsi helper
    const normalizeString = (str) => str?.toString().toLowerCase().trim() || "";
    const isWilayahValid = (nama, daftarWilayah) => {
      console.log("Checking:", normalizeString(nama));
      console.log(
        "Against:",
        daftarWilayah.map((w) => normalizeString(w.nama))
      );
      return daftarWilayah.some(
        (w) => normalizeString(w.nama) === normalizeString(nama)
      );
    };

    // Fungsi validasi tipe data
    const validateDataTypes = (item) => {
      const errors = [];

      // Validasi field string
      const stringFields = ["Nama", "Kabupaten/Kota", "Kecamatan", "Kelurahan"];
      stringFields.forEach((field) => {
        if (item[field] && typeof item[field] !== "string") {
          errors.push(`${field} harus berupa teks`);
        }
      });

      // Validasi jumlah hibah (harus number)
      if (
        item["Jumlah Hibah Diterima"] &&
        typeof item["Jumlah Hibah Diterima"] !== "number"
      ) {
        errors.push("Jumlah hibah harus berupa angka");
      }

      // Validasi jumlah anggota (harus number)
      if (
        item["Jumlah Anggota Awal"] &&
        typeof item["Jumlah Anggota Awal"] !== "number"
      ) {
        errors.push("Jumlah anggota harus berupa angka");
      }

      // Validasi koordinat (harus number)
      if (item["Latitude"] && typeof item["Latitude"] !== "number") {
        errors.push("Latitude harus berupa angka");
      }
      if (item["Longitude"] && typeof item["Longitude"] !== "number") {
        errors.push("Longitude harus berupa angka");
      }

      // Validasi tanggal
      if (
        item["Tanggal Pembentukan"] &&
        !(item["Tanggal Pembentukan"] instanceof Date) &&
        typeof item["Tanggal Pembentukan"] !== "string"
      ) {
        errors.push("Tanggal pembentukan harus berupa tanggal yang valid");
      }

      return errors;
    };

    for (const [index, item] of data.entries()) {
      const rowNumber = index + 1;
      try {
        // Validasi tipe data terlebih dahulu
        const dataTypeErrors = validateDataTypes(item);
        if (dataTypeErrors.length > 0) {
          throw new Error(dataTypeErrors.join(", "));
        }

        // Validasi wajib
        const requiredFields = [
          "Nama",
          "Kabupaten/Kota",
          "Kecamatan",
          "Kelurahan",
        ];
        const missingFields = requiredFields.filter((field) => !item[field]);
        if (missingFields.length > 0) {
          throw new Error(
            `Field wajib tidak lengkap: ${missingFields.join(", ")}`
          );
        }

        // Validasi format field string (tidak boleh kosong setelah di-trim)
        const stringFields = [
          "Nama",
          "Kabupaten/Kota",
          "Kecamatan",
          "Kelurahan",
        ];
        const emptyStringFields = stringFields.filter(
          (field) =>
            item[field] &&
            typeof item[field] === "string" &&
            item[field].trim() === ""
        );
        if (emptyStringFields.length > 0) {
          throw new Error(
            `Field tidak boleh kosong: ${emptyStringFields.join(", ")}`
          );
        }

        // Validasi unik kelurahan
        const existing = await prisma.kelompokDesa.findFirst({
          where: {
            kelurahan: item.Kelurahan,
            kecamatan: item.Kecamatan,
            kabupaten_kota: item["Kabupaten/Kota"],
          },
        });
        if (existing) {
          throw new Error("Kelompok sudah terdaftar");
        }

        // Validasi wilayah
        if (!isWilayahValid(item["Kabupaten/Kota"], kabupatenList)) {
          throw new Error("Kabupaten tidak valid");
        }

        // Validasi tanggal
        const tanggal = new Date(item["Tanggal Pembentukan"]);
        if (isNaN(tanggal.getTime())) {
          throw new Error("Format tanggal tidak valid");
        }
        if (tanggal > new Date()) {
          throw new Error("Tanggal tidak boleh lebih dari hari ini");
        }

        // Validasi jumlah hibah
        if (item["Jumlah Hibah Diterima"] < 20000000) {
          throw new Error("Jumlah hibah minimal 20 juta");
        }

        // Validasi jumlah anggota (harus positif)
        if (item["Jumlah Anggota Awal"] && item["Jumlah Anggota Awal"] <= 0) {
          throw new Error("Jumlah anggota harus lebih dari 0");
        }

        // Validasi koordinat (range yang masuk akal untuk Indonesia)
        if (
          item["Latitude"] &&
          (item["Latitude"] < -11 || item["Latitude"] > 6)
        ) {
          throw new Error("Latitude tidak valid untuk wilayah Indonesia");
        }
        if (
          item["Longitude"] &&
          (item["Longitude"] < 95 || item["Longitude"] > 141)
        ) {
          throw new Error("Longitude tidak valid untuk wilayah Indonesia");
        }

        // Simpan data - MENAMBAHKAN field nama yang missing
        const newKelompok = await prisma.kelompokDesa.create({
          data: {
            nama: item.Nama,
            kabupaten_kota: item["Kabupaten/Kota"],
            kabupatenNama: item["Kabupaten/Kota"],
            kecamatan: item.Kecamatan,
            kecamatanNama: item.Kecamatan,
            kelurahan: item.Kelurahan,
            kelurahanNama: item.Kelurahan,
            tanggal_pembentukan: tanggal,
            jumlah_hibah_diterima: item["Jumlah Hibah Diterima"],
            jumlah_anggota_awal: item["Jumlah Anggota Awal"],
            kategori: "Tumbuh",
            status: item.Status || "pending",
            latitude: item.Latitude ? parseFloat(item.Latitude) : null,
            longitude: item.Longitude ? parseFloat(item.Longitude) : null,

            // ✅ relasi ke kabupaten
            Kabupaten: {
              connect: { id: item.KabupatenId },
            },
          },
        });

        results.successCount++;
        results.savedData.push(newKelompok);
      } catch (error) {
        results.errorCount++;
        results.errors.push({
          row: rowNumber,
          error: error.message,
          data: item,
        });
        console.error(`Error baris ${rowNumber}:`, error.message);
      }
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateKategoriJikaDiterima = async (kelompokId) => {
  try {
    const kelompok = await prisma.kelompokDesa.findUnique({
      where: { id: parseInt(kelompokId) },
      select: { status: true },
    });

    if (kelompok && kelompok.status === "disetujui") {
      console.log(
        `Kelompok ${kelompokId} adalah diterima, memperbarui kategori...`
      );
      await hitungDanSimpanKategori(kelompokId);
    }
  } catch (error) {
    console.error(
      `Gagal update kategori otomatis untuk kelompok ${kelompokId}:`,
      error
    );
    throw error;
  }
};

module.exports = {
  updateKelompokCatatan,
  updateKelompokStatus,
  getAllKelompok,
  getKelompokById,
  createKelompok,
  updateKelompok,
  deleteKelompok,
  getKelompokByKabupaten,
  deleteMultipleItems,
  hitungDanSimpanKategori,
  fixKategoriSemuaKelompok,
  triggerUpdateKategori,
  hitungKategoriKelompok,
  hitungJumlahAnggota,
  hitungJumlahDana,
  uploadExcel,
  confirmUpload,
  updateKategoriJikaDiterima,
};
