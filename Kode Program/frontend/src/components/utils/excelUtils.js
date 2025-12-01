import React, { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";
import axios from "axios";
import { API_CONFIG } from "../../config/apiConfig";

export const exportDesaToExcel = (filteredDesa) => {
  const dataToExport = Array.isArray(filteredDesa) ? filteredDesa : [];
  // Data yang akan diekspor
  const data = filteredDesa.flatMap((desa) => {
    // Data utama desa
    const desaRow = {
      No: desa.no,
      Nama: desa.nama,
      Kabupaten: desa.kabupaten_kota,
      Kecamatan: desa.kecamatan,
      Kelurahan: desa.kelurahan,
      "Tanggal Pembentukan": desa.tanggal_pembentukan,
      "Jumlah Hibah Diterima": desa.jumlah_hibah_diterima,
      "Jumlah Dana Sekarang": desa.jumlah_dana_sekarang,
      "Jumlah Anggota Sekarang": desa.jumlah_anggota_sekarang,
      "Jumlah Anggota Awal": desa.jumlah_anggota_awal,
      Kategori: desa.kategori,
    };

    // Jika tidak ada produk dan anggota, buat satu baris dengan nilai "-"
    if (desa.produk.length === 0 && desa.anggota.length === 0) {
      return [
        {
          ...desaRow,
          "Nama Produk": "-",
          "Harga Produk": "-",
          "Nama anggota": "-",
          "Jabatan anggota": "-",
          "No HP anggota": "-",
        },
      ];
    }

    const firstRow = {
      ...desaRow,
      "Nama Produk": desa.produk.length > 0 ? desa.produk[0].nama : "-",
      "Harga Produk":
        desa.produk.length > 0
          ? `Rp ${desa.produk[0].harga_awal.toLocaleString(
              "id-ID"
            )} - Rp ${desa.produk[0].harga_akhir.toLocaleString("id-ID")}`
          : "-",
      "Nama anggota": desa.anggota.length > 0 ? desa.anggota[0].nama : "-",
      "Jabatan anggota":
        desa.anggota.length > 0 ? desa.anggota[0].jabatan : "-",
      "No HP anggota": desa.anggota.length > 0 ? desa.anggota[0].nohp : "-",
    };

    const produkRows = desa.produk.slice(1).map((produk) => ({
      No: "",
      Nama: "",
      Alamat: "",
      "Tanggal Pembentukan": "",
      "Jumlah Hibah Diterima": "",
      "Jumlah Dana Sekarang": "",
      "Jumlah Anggota Sekarang": "",
      "Jumlah Anggota Awal": "",
      Kategori: "",
      "Nama Produk": produk.nama,
      "Harga Produk": `Rp ${produk.harga_awal.toLocaleString(
        "id-ID"
      )} - Rp ${produk.harga_akhir.toLocaleString("id-ID")}`,
      "Nama anggota": "",
      "Jabatan anggota": "",
      "No HP anggota": "",
    }));

    const anggotaRows = desa.anggota.slice(1).map((anggota) => ({
      No: "",
      Nama: "",
      Alamat: "",
      "Tanggal Pembentukan": "",
      "Jumlah Hibah Diterima": "",
      "Jumlah Dana Sekarang": "",
      "Jumlah Anggota Sekarang": "",
      "Jumlah Anggota Awal": "",
      Kategori: "",
      "Nama Produk": "",
      "Harga Produk": "",
      "Nama anggota": anggota.nama,
      "Jabatan anggota": anggota.jabatan,
      "No HP anggota": anggota.nohp,
    }));

    return [firstRow, ...produkRows, ...anggotaRows];
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Kelompok Desa");

  XLSX.writeFile(workbook, "KelompokDesa.xlsx");
};

export const importDesaFromExcel = async (
  file,
  setPreviewData,
  setFileToUpload,
  setShowPreviewModal
) => {
  if (!file) return;

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const requiredColumns = [
      "Nama",
      "Kabupaten/Kota",
      "Kecamatan",
      "Kelurahan",
    ];
    const missingColumns = requiredColumns.filter(
      (col) => !Object.keys(jsonData[0] || {}).includes(col)
    );

    if (missingColumns.length > 0) {
      throw new Error(
        `Kolom wajib tidak ditemukan: ${missingColumns.join(", ")}`
      );
    }

    setPreviewData({
      columns: Object.keys(jsonData[0] || {}),
      data: jsonData.slice(0, 10),
    });
    setFileToUpload(file);
    setShowPreviewModal(true);
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
};

export const previewExcelAnggota = async (file) => {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Validasi kolom wajib
    const requiredColumns = ["Nama", "Jabatan"];
    const missingColumns = requiredColumns.filter(
      (col) => !Object.keys(jsonData[0] || {}).includes(col)
    );

    if (missingColumns.length > 0) {
      throw new Error(
        `Kolom wajib tidak ditemukan: ${missingColumns.join(", ")}`
      );
    }

    // Validasi setiap baris data
    const validationResults = jsonData.map((row, index) => {
      const errors = [];

      // Validasi nama
      if (!row.Nama || typeof row.Nama !== "string" || row.Nama.trim() === "") {
        errors.push("Nama wajib diisi");
      }

      // Validasi jabatan
      if (
        !row.Jabatan ||
        typeof row.Jabatan !== "string" ||
        row.Jabatan.trim() === ""
      ) {
        errors.push("Jabatan wajib diisi");
      } else {
        const jabatan = row.Jabatan.toLowerCase();
        const validJabatan = [
          "ketua",
          "sekretaris",
          "bendahara",
          "anggota",
        ].some((valid) => jabatan.includes(valid));

        if (!validJabatan) {
          errors.push(
            "Jabatan harus mengandung: Ketua, Sekretaris, Bendahara, atau Anggota"
          );
        }
      }

      // Validasi no HP (jika ada)
      if (row.Nohp && !/^[0-9+]+$/.test(row.Nohp)) {
        errors.push("No HP harus berupa angka atau tanda +");
      }

      return {
        ...row,
        _rowNumber: index + 2, // +2 karena header di row 1 dan index mulai dari 0
        _isValid: errors.length === 0,
        _errors: errors,
      };
    });

    const invalidRows = validationResults.filter((row) => !row._isValid);

    return {
      columns: Object.keys(jsonData[0] || {}),
      data: validationResults,
      totalRows: jsonData.length,
      validRows: validationResults.filter((row) => row._isValid).length,
      invalidRows: invalidRows.length,
      sampleErrors: invalidRows.slice(0, 3), // Ambil 3 contoh error pertama
    };
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
};

export const handleExcelUploadAnggota = async (file, desaId, fetchAnggota) => {
  try {
    // Lakukan preview dan validasi terlebih dahulu
    const preview = await previewExcelAnggota(file);

    // Jika ada baris yang tidak valid, throw error
    if (preview.invalidRows > 0) {
      const errorMessages = preview.sampleErrors.map(
        (row) => `Baris ${row._rowNumber}: ${row._errors.join(", ")}`
      );

      if (preview.invalidRows > 3) {
        errorMessages.push(`...dan ${preview.invalidRows - 3} error lainnya`);
      }

      throw new Error(`Data tidak valid:\n${errorMessages.join("\n")}`);
    }

    // Jika semua valid, lanjutkan upload
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("authToken");
    const url = `https://backend-desa-prima-dev.student.stis.ac.id/komponen-anggota/${desaId}/anggota/upload-excel`;

    const response = await axios.post(url, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      toast.success(`Berhasil mengupload ${response.data.count} anggota`);
      fetchAnggota(); // Refresh data
      return response.data;
    } else {
      throw new Error(response.data.message || "Upload gagal");
    }
  } catch (error) {
    console.error("Upload error:", {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    });

    let errorMessage = "Upload gagal";
    if (error.response) {
      if (error.response.status === 413) {
        errorMessage = "File terlalu besar";
      } else if (error.response.status === 400) {
        errorMessage = error.response.data.message || "Format file tidak valid";
      }
    } else if (error.message.startsWith("Data tidak valid")) {
      errorMessage = error.message;
    }

    toast.error(errorMessage);
    throw error;
  }
};
