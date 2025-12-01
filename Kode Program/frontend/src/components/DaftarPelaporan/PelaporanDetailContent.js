// PelaporanDetailContent.js
import React from "react";
import { Box, Typography, Button, Divider } from "@mui/material";
import { formatTanggal } from "../utils/format";

const PelaporanDetailContent = ({ item }) => {
  const renderDetailRow = (label, value) => (
    <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
      <Typography
        variant="body1"
        sx={{ fontWeight: "bold", minWidth: "150px" }}
      >
        {label}
      </Typography>
      <Typography variant="body1">: {value}</Typography>
    </Box>
  );

  const renderFileButton = (label, filePath) => (
    <Button
      variant="contained"
      size="small"
      onClick={() =>
        window.open(
          `https://backend-desa-prima-dev.student.stis.ac.id/all/uploads/${filePath}`,
          "_blank"
        )
      }
      sx={{ mt: 1 }}
    >
      {label}
    </Button>
  );

  if (item.Produk) {
    return (
      <Box sx={{ pt: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: "1.1rem" }}>
          Detail Produk
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {renderDetailRow("Nama Produk", item.Produk.nama)}
        {renderDetailRow(
          "Harga Awal",
          `Rp ${item.Produk.harga_awal?.toLocaleString()}`
        )}
        {renderDetailRow(
          "Harga Akhir",
          `Rp ${item.Produk.harga_akhir?.toLocaleString()}`
        )}
        {renderDetailRow("Pelaku Usaha", item.Produk.pelaku_usaha)}
        {renderDetailRow("Deskripsi", item.Produk.deskripsi)}
      </Box>
    );
  } else if (item.Anggota) {
    return (
      <Box sx={{ pt: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: "1.1rem" }}>
          Detail Anggota
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {renderDetailRow("Nama", item.Anggota.nama)}
        {renderDetailRow("Jabatan", item.Anggota.jabatan)}
        {renderDetailRow("No. HP", item.Anggota.nohp)}
        {renderDetailRow("Usaha", item.Anggota.usaha)}
      </Box>
    );
  } else if (item.kas) {
    return (
      <Box sx={{ pt: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: "1.1rem" }}>
          Detail Transaksi Kas
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {renderDetailRow("Nama Transaksi", item.kas.nama_transaksi)}
        {renderDetailRow("Jenis", item.kas.jenis_transaksi)}
        {renderDetailRow(
          "Total",
          `Rp ${item.kas.total_transaksi?.toLocaleString()}`
        )}
        {renderDetailRow("Tanggal", formatTanggal(item.kas.tgl_transaksi))}
      </Box>
    );
  } else if (item.Laporan) {
    return (
      <Box sx={{ pt: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: "1.1rem" }}>
          Detail Laporan
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {renderDetailRow(
          "Nama Laporan",
          item.Laporan.nama_laporan || "Tanpa catatan"
        )}
        {item.Laporan.file &&
          renderFileButton("Lihat Dokumen", item.Laporan.file)}
      </Box>
    );
  } else if (item.Kegiatan) {
    return (
      <Box sx={{ pt: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: "1.1rem" }}>
          Detail Kegiatan
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {renderDetailRow("Tanggal", formatTanggal(item.Kegiatan.tanggal))}
        {renderDetailRow("Uraian Kegiatan", item.Kegiatan.uraian)}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          {item.Kegiatan.file_materi &&
            renderFileButton("File Materi", item.Kegiatan.file_materi)}
          {item.Kegiatan.file_notulensi &&
            renderFileButton("File Notulensi", item.Kegiatan.file_notulensi)}
        </Box>
      </Box>
    );
  } else if (item.KelompokDesa) {
    return (
      <Box sx={{ pt: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: "1.1rem" }}>
          Detail Kelompok Desa
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "max-content 1fr",
            gap: "8px 16px",
            alignItems: "baseline",
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            Nama Kelompok
          </Typography>
          <Typography variant="body1">: {item.KelompokDesa.nama}</Typography>

          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            Lokasi
          </Typography>
          <Typography variant="body1">
            : {item.KelompokDesa.kecamatanNama},{" "}
            {item.KelompokDesa.kabupaten_kota}
          </Typography>

          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            Tanggal Pembentukan
          </Typography>
          <Typography variant="body1">
            : {formatTanggal(item.KelompokDesa.tanggal_pembentukan)}
          </Typography>

          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            Jumlah Anggota
          </Typography>
          <Typography variant="body1">
            : {item.KelompokDesa.jumlah_anggota_awal}
          </Typography>

          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            Jumlah Hibah Diterima
          </Typography>
          <Typography variant="body1">
            : Rp {item.KelompokDesa.jumlah_hibah_diterima?.toLocaleString()}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 1 }}>
      <Typography variant="body1">Informasi pelaporan</Typography>
    </Box>
  );
};

export default PelaporanDetailContent;
