import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { API_CONFIG } from "../../../config/apiConfig";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { utils, write } from "xlsx";
import ExcelJS from "exceljs";

export const useSelectionHandlers = (initialSelectedItems = []) => {
  const [selectedItems, setSelectedItems] = useState(initialSelectedItems);
  const [visibleOptionId, setVisibleOptionId] = useState(null);
  const optionsRef = useRef({});

  // Handle click outside dropdown
  const handleClickOutside = (event) => {
    if (
      visibleOptionId &&
      optionsRef.current[visibleOptionId] &&
      !optionsRef.current[visibleOptionId].contains(event.target)
    ) {
      setVisibleOptionId(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visibleOptionId]);

  const toggleOption = (id) => {
    setVisibleOptionId(visibleOptionId === id ? null : id);
  };

  const toggleSelectItem = (item) => {
    if (Array.isArray(item)) {
      setSelectedItems([]);
      return;
    }
    setSelectedItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const toggleSelectAll = (currentFiles) => {
    if (selectedItems.length === currentFiles.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...currentFiles]);
    }
  };

  return {
    selectedItems,
    setSelectedItems,
    visibleOptionId,
    optionsRef,
    toggleOption,
    toggleSelectItem,
    toggleSelectAll,
  };
};

export const useFileHandlers = () => {
  const constructFileUrl = (url) => {
    if (!url) return null;

    if (url.startsWith("http") || url.startsWith("blob:")) {
      return url;
    }

    const cleanUrl = url.startsWith("/") ? url : `/${url}`;

    if (cleanUrl.includes("uploads/")) {
      return `https://backend-desa-prima-dev.student.stis.ac.id${cleanUrl}`;
    }

    return `https://backend-desa-prima-dev.student.stis.ac.id/uploads${cleanUrl}`;
  };

  const downloadFile = async (url, filename) => {
    try {
      if (!url) {
        throw new Error("URL file tidak tersedia");
      }

      const fullUrl = constructFileUrl(url);
      const token = localStorage.getItem("authToken");

      const response = await fetch(fullUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error(`File tidak ditemukan (${response.status})`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename || `download_${Date.now()}`;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);

      return true;
    } catch (error) {
      console.error("Download error:", error);
      throw error;
    }
  };

  const resolveFileUrl = (input) => {
    if (!input) return null;
    if (typeof input === "string") return input;
    if (typeof input === "object" && input.url) return input.url;
    return null;
  };

  const getSafeFilename = (url, defaultName = "file") => {
    if (!url || typeof url !== "string") return `${defaultName}_${Date.now()}`;

    try {
      const urlObj = new URL(url);
      return urlObj.pathname.split("/").pop() || `${defaultName}_${Date.now()}`;
    } catch {
      return url.split("/").pop() || `${defaultName}_${Date.now()}`;
    }
  };

  const generateExcel = (data, columns, fileName) => {
    // Buat worksheet data dengan format yang benar
    const wsData = [
      columns, // Header
      ...data.map((item) =>
        columns.map((col) => {
          // Handle format tanggal khusus
          if (col === "Tanggal" && item[col] && !isNaN(new Date(item[col]))) {
            return new Date(item[col]).toLocaleDateString("id-ID");
          }
          return item[col] || "-";
        })
      ),
    ];

    // Buat worksheet
    const ws = utils.aoa_to_sheet(wsData);

    // Atur lebar kolom
    const wscols = [
      { wch: 25 }, // Nama Kegiatan
      { wch: 15 }, // Tanggal
      { wch: 40 }, // Deskripsi
      { wch: 20 }, // Lokasi
      { wch: 20 }, // Peserta
      { wch: 12 }, // File Materi
      { wch: 12 }, // File Notulen
      { wch: 15 }, // Foto
    ];
    ws["!cols"] = wscols;

    // Buat workbook
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Kegiatan");

    // Generate file Excel
    const excelBuffer = write(wb, { bookType: "xlsx", type: "array" });
    return new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  };

  const downloadAndAddToZip = async (url, folder, filename) => {
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const blob = await response.blob();
      folder.file(filename, blob);
    } catch (error) {
      console.error(`Gagal download file ${filename}:`, error);
      throw error;
    }
  };

  const downloadAllData = async (selectedItems, selectedTab) => {
    try {
      if (!selectedItems || !Array.isArray(selectedItems)) {
        throw new Error("Data item tidak valid");
      }

      if (selectedItems.length === 0) {
        throw new Error("Tidak ada item yang dipilih");
      }

      let excelData, excelColumns, zipFilename;
      const zip = new JSZip();
      const imgFolder = zip.folder("images");
      const docFolder = zip.folder("documents");

      if (selectedTab === "Produk") {
        excelData = selectedItems.map((item) => {
          const fotoUrl = resolveFileUrl(item.foto);
          return {
            "Nama Produk": item.nama || "-",
            Harga:
              item.harga_awal && item.harga_akhir
                ? `${item.harga_awal} - ${item.harga_akhir}`
                : item.harga_awal || item.harga || "-",
            "Pelaku Usaha": item.pelaku_usaha || item.Anggota?.nama || "-",
            Deskripsi: item.deskripsi || "-",
            Foto: fotoUrl ? `images/${getSafeFilename(fotoUrl, "foto")}` : "-",
          };
        });

        excelColumns = [
          "Nama Produk",
          "Harga",
          "Pelaku Usaha",
          "Deskripsi",
          "Foto",
        ];
        zipFilename = `produk_${new Date().toISOString().slice(0, 10)}.zip`;

        await Promise.all(
          selectedItems.map(async (item) => {
            const fotoUrl = resolveFileUrl(item.foto);
            if (fotoUrl) {
              try {
                const fullUrl = constructFileUrl(fotoUrl);
                const response = await fetch(fullUrl);
                if (!response.ok)
                  throw new Error(`HTTP error! status: ${response.status}`);

                const blob = await response.blob();
                const filename = getSafeFilename(fotoUrl, "foto");
                imgFolder.file(filename, blob);
              } catch (error) {
                console.error(`Gagal download foto produk ${item.id}:`, error);
              }
            }
          })
        );
      } else if (selectedTab === "Kegiatan") {
        excelData = selectedItems.map((item) => ({
          "Nama Kegiatan": item["Nama Kegiatan"] || item.nama_kegiatan || "-",
          Tanggal: item.Tanggal || item.tanggal || "-",
          Uraian: item.Uraian || item.uraian || "-",
          Lokasi: item.lokasi || "-",
          Peserta: item.peserta || "-",
          "File Materi":
            item["File Materi"] ||
            (item.file_materi
              ? `documents/${getSafeFilename(item.file_materi)}`
              : "-"),
          "File Notulen":
            item["File Notulen"] ||
            (item.file_notulensi
              ? `documents/${getSafeFilename(item.file_notulensi)}`
              : "-"),
          "Foto Kegiatan":
            item.FotoKegiatan?.length > 0
              ? `${item.FotoKegiatan.length} foto - lihat di folder images`
              : "-",
        }));

        excelColumns = [
          "Nama Kegiatan",
          "Tanggal",
          "Uraian",
          "File Materi",
          "File Notulen",
          "Foto",
        ];
        zipFilename = `kegiatan_${new Date().toISOString().slice(0, 10)}.zip`;

        await Promise.all(
          selectedItems.flatMap((item) => {
            const downloads = [];

            // Download file materi jika ada
            if (item.file_materi) {
              downloads.push(
                downloadAndAddToZip(
                  constructFileUrl(item.file_materi),
                  docFolder,
                  getSafeFilename(item.file_materi, "materi")
                )
              );
            }

            // Download file notulen jika ada
            if (item.file_notulensi) {
              downloads.push(
                downloadAndAddToZip(
                  constructFileUrl(item.file_notulensi),
                  docFolder,
                  getSafeFilename(item.file_notulensi, "notulen")
                )
              );
            }

            // Download semua foto kegiatan
            if (item.FotoKegiatan?.length > 0) {
              item.FotoKegiatan.forEach((foto, index) => {
                if (foto.gambar) {
                  downloads.push(
                    downloadAndAddToZip(
                      constructFileUrl(foto.gambar),
                      imgFolder,
                      `kegiatan_${item.id}_foto_${index + 1}.${foto.gambar
                        .split(".")
                        .pop()}`
                    )
                  );
                }
              });
            }

            return downloads;
          })
        );
      } else {
        throw new Error(`Jenis tab ${selectedTab} tidak didukung`);
      }

      // Generate Excel file
      const excelBlob = generateExcel(
        excelData,
        excelColumns,
        `${selectedTab}.xlsx`
      );
      zip.file(`${selectedTab}.xlsx`, excelBlob);

      // Generate ZIP file
      const zipContent = await zip.generateAsync({ type: "blob" });
      saveAs(zipContent, zipFilename);

      return true;
    } catch (error) {
      console.error("Error in downloadAllData:", error);
      throw error;
    }
  };

  const handleDownloadMultiple = async (selectedItems, selectedTab) => {
    if (!selectedItems?.length) {
      toast.error("Tidak ada item yang dipilih");
      return;
    }

    // Tentukan properti file berdasarkan jenis konten
    const getFileProps = (type) => {
      switch (type) {
        case "Produk":
          return ["gambar", "foto", "file"];
        case "Kegiatan":
          return ["file_materi", "file_notulensi", "dokumen"];
        default:
          return ["file", "dokumen", "lampiran"];
      }
    };

    const downloadPromises = selectedItems.flatMap((item) => {
      const fileProps = getFileProps(selectedTab);
      const filesToDownload = [];

      // Cari semua file yang ada di item
      fileProps.forEach((prop) => {
        if (item[prop]) {
          filesToDownload.push({
            url: item[prop],
            name: `${item.nama_kegiatan || item.nama}_${prop}`,
          });
        }
      });

      if (filesToDownload.length === 0) {
        console.warn("Item tidak memiliki file yang dapat diunduh:", item);
        return [
          {
            success: false,
            item,
            error: "No downloadable files found",
          },
        ];
      }

      return filesToDownload.map(async (file) => {
        try {
          await downloadFile(file.url, file.name);
          return { success: true, item, file };
        } catch (error) {
          console.error(`Gagal mengunduh file ${file.name}:`, error);
          return { success: false, item, file, error: error.message };
        }
      });
    });

    const results = await Promise.all(downloadPromises.flat());
    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    // Tampilkan notifikasi hasil
    if (failures.length > 0) {
      toast.error(`${failures.length} file gagal diunduh`);
      console.error("Detail kegagalan:", failures);
    }

    if (successes.length > 0) {
      toast.success(`${successes.length} file berhasil diunduh`);
    }
  };

  const handleDeleteMultiple = async (
    selectedItems,
    selectedTab,
    desaId,
    fetchFunctions
  ) => {
    const toastId = toast.loading("Memproses penghapusan...");

    try {
      // Validasi input lebih ketat
      if (!selectedItems || !Array.isArray(selectedItems)) {
        toast.dismiss(toastId);
        return toast.error("Data item tidak valid");
      }

      if (selectedItems.length === 0) {
        toast.dismiss(toastId);
        return toast.error("Tidak ada item yang dipilih");
      }

      // Mapping endpoint ke type dengan validasi
      const endpointMap = {
        Produk: "produk",
        Anggota: "anggota",
        Laporan: "laporan",
        Kegiatan: "kegiatan",
        KasDesa: "kas",
      };

      const type = endpointMap[selectedTab];
      if (!type) {
        toast.dismiss(toastId);
        return toast.error(`Jenis konten '${selectedTab}' tidak valid`);
      }

      // Validasi ID
      const invalidIds = selectedItems
        .filter((item) => !item.id)
        .map((item) => item.id);
      if (invalidIds.length > 0) {
        toast.dismiss(toastId);
        return toast.error(`Beberapa ID tidak valid`);
      }

      // Siapkan payload dengan validasi
      const payload = {
        ids: selectedItems.map((item) => item.id),
        type,
      };

      // Kirim request dengan timeout
      const response = await axios.post(
        `https://backend-desa-prima-dev.student.stis.ac.id/kelompok/${desaId}/delete-multiple`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 detik timeout
        }
      );

      // Handle response lebih robust
      if (!response.data) {
        throw new Error("Tidak ada data response dari server");
      }

      if (response.data.success) {
        toast.success(`${selectedItems.length} item berhasil dihapus`);

        // Refresh data dengan error handling
        try {
          await Promise.allSettled([
            fetchFunctions.fetchDesaDetail(),
            fetchFunctions[`fetch${selectedTab.replace(/ /g, "")}`](),
          ]);
        } catch (fetchError) {
          // console.error("Gagal refresh data:", fetchError);
          // toast("Item berhasil dihapus tetapi gagal refresh data", {
          //   icon: '⚠️', // Emoji warning
          //   style: {
          //     background: '#ffcc00',
          //     color: '#000'
          //   }
          // });
        }
      } else {
        throw new Error(response.data.message || "Gagal menghapus item");
      }
    } catch (error) {
      console.error("Delete error details:", {
        message: error.message,
        response: error.response?.data,
        config: error.config,
        stack: error.stack,
      });

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan server";

      toast.error(`Gagal menghapus: ${errorMessage}`);
    } finally {
      toast.dismiss(toastId);
    }
  };

  return {
    downloadFile,
    downloadAllData,
    handleDownloadMultiple,
    handleDeleteMultiple,
  };
};
