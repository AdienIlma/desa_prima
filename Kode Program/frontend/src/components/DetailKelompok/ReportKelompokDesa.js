import React from "react";
import {
  Text,
  View,
  Page,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const ReportKelompokDesa = ({
  desa,
  profil,
  kegiatan = [],
  produk = [],
  anggota = [],
  kas = [],
}) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const styles = StyleSheet.create({
    page: {
      fontSize: 11,
      paddingTop: 50,
      paddingBottom: 50,
      paddingLeft: 60,
      paddingRight: 60,
      lineHeight: 1.5,
      flexDirection: "column",
    },
    titleContainer: {
      textAlign: "center",
      marginBottom: 20,
    },
    reportTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 10,
    },
    underline: {
      width: "100%",
      height: 2,
      backgroundColor: "#000",
    },
    contentContainer: {
      flexDirection: "column",
    },
    DetailsContainer: {
      marginBottom: 10,
    },
    detailRow: {
      flexDirection: "row",
      marginBottom: 4,
    },
    detailTitle: {
      marginLeft: 10,
      marginBottom: 4,
      fontSize: 11,
      fontWeight: "bold",
      width: 150,
    },
    detailText: {
      fontSize: 11,
      marginBottom: 8,
      color: "#3E3E3E",
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "bold",
      marginTop: 20,
      marginBottom: 10,
    },
    table: {
      display: "table",
      width: "auto",
      borderStyle: "solid",
      borderColor: "#000",
      borderWidth: 1,
      borderRightWidth: 0,
      borderBottomWidth: 0,
    },
    tableTitle: {
      fontSize: 12,
      fontWeight: "bold",
      marginTop: 0,
      marginBottom: 6,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#DEDEDE",
      borderBottomWidth: 1,
      borderBottomColor: "#000",
      marginBottom: 0,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#000",
      margin: 0,
    },
    tableColHeader: {
      flex: 1,
      textAlign: "center",
      justifyContent: "center",
      padding: 4,
      borderTopWidth: 1,
      borderTopColor: "#000",
      margin: 0,
    },
    tableCol: {
      flex: 1,
      textAlign: "center",
      padding: 4,
      justifyContent: "center",
      margin: 0,
    },
    productContainer: {
      flexDirection: "row",
      border: "1px solid #ddd",
      padding: 8,
    },
    productImageColumn: {
      width: "30%",
      paddingRight: 8,
    },
    productInfoColumn: {
      width: "70%",
    },
    productImage: {
      width: "100%",
      height: 120,
      objectFit: "contain",
    },
    image: {
      width: 100,
      height: 100,
    },
    galleryContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 10,
      gap: 12,
    },
    galleryItem: {
      width: "45%",
      display: "flex",
      flexDirection: "column",
      minHeight: 150,
      justifyContent: "space-between",
    },
    captionText: {
      fontSize: 11,
      textAlign: "center",
      paddingTop: 8,
    },
    imageWrapper: {
      height: 150,
      justifyContent: "center",
      alignItems: "center",
    },
    footerContainer: {
      alignSelf: "flex-end",
      textAlign: "center",
      marginTop: 40,
      breakInside: "avoid",
    },
    footerText: {
      fontSize: 11,
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
    },
    kasRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#000",
      paddingVertical: 4,
    },
    kasType: {
      width: 100,
      padding: 4,
      textAlign: "center",
    },
    kasAmount: {
      width: 100,
      padding: 4,
      textAlign: "right",
    },
    kasDescription: {
      flex: 1,
      padding: 4,
    },
    kasDate: {
      width: 80,
      padding: 4,
      textAlign: "center",
    },
  });

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "Tidak tersedia";

    try {
      const date = new Date(tanggal);
      if (isNaN(date.getTime())) return "Tanggal tidak valid";

      const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];
      return `${date.getDate()} ${
        months[date.getMonth()]
      } ${date.getFullYear()}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Format tanggal tidak valid";
    }
  };

  const ReportTitle = () => (
    <View style={styles.titleContainer}>
      <Text style={styles.reportTitle}>
        Laporan Kegiatan Kelompok Desa {desa.nama}
      </Text>
      <View style={styles.underline} />
    </View>
  );

  const KelompokDetails = () => (
    <View style={styles.DetailsContainer}>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>Nama Petugas</Text>
        <Text style={styles.detailText}>: {profil.name}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>NIP</Text>
        <Text style={styles.detailText}>: {profil.nip || "-"}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>Jabatan</Text>
        <Text style={styles.detailText}>: {profil.role}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>Nama Kelompok Desa</Text>
        <Text style={styles.detailText}>
          : {desa.kabupatenNama}, Kec. {desa.kecamatanNama}, Kel.{" "}
          {desa.kelurahanNama}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>Tanggal Pembentukan</Text>
        <Text style={styles.detailText}>
          : {formatTanggal(desa.tanggal_pembentukan)}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>Jumlah Hibah Diterima</Text>
        <Text style={styles.detailText}>
          : {formatRupiah(desa.jumlah_hibah_diterima)}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>Jumlah Dana Sekarang</Text>
        <Text style={styles.detailText}>
          : {formatRupiah(desa.jumlah_dana_sekarang)}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>Jumlah Anggota Awal</Text>
        <Text style={styles.detailText}>: {desa.jumlah_anggota_awal}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>Jumlah Anggota Sekarang</Text>
        <Text style={styles.detailText}>: {desa.jumlah_anggota_sekarang}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>Kategori</Text>
        <Text style={styles.detailText}>: {desa.kategori}</Text>
      </View>
    </View>
  );

  const AnggotaTable = () => (
    <View>
      <Text style={styles.sectionTitle}>I. Rincian Anggota Kelompok Desa</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableColHeader, { flex: 0.5 }]}>No</Text>
        <Text style={[styles.tableColHeader, { flex: 2 }]}>Nama</Text>
        <Text style={[styles.tableColHeader, { flex: 1.5 }]}>Jabatan</Text>
        <Text style={[styles.tableColHeader, { flex: 1.5 }]}>No HP</Text>
        <Text style={[styles.tableColHeader, { flex: 2 }]}>Usaha</Text>
        <Text style={[styles.tableColHeader, { flex: 1.5 }]}>Sertifikasi</Text>
      </View>
      {anggota.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCol, { flex: 0.5 }]}>{index + 1}</Text>
          <Text style={[styles.tableCol, { flex: 2 }]}>{item.nama}</Text>
          <Text style={[styles.tableCol, { flex: 1.5 }]}>{item.jabatan}</Text>
          <Text style={[styles.tableCol, { flex: 1.5 }]}>{item.nohp}</Text>
          <Text style={[styles.tableCol, { flex: 2 }]}>{item.usaha}</Text>
          <Text style={[styles.tableCol, { flex: 1.5 }]}>
            {item.sertifikasi || "Tidak Ada"}
          </Text>
        </View>
      ))}
    </View>
  );

  const ProdukSection = () => (
    <View>
      <Text style={styles.sectionTitle}>II. Produk</Text>
      {produk.length > 0 ? (
        produk.map((item) => (
          <View key={item.id} style={styles.productContainer} wrap={false}>
            <View style={styles.productImageColumn}>
              <Image
                src={`https://backend-desa-prima-dev.student.stis.ac.id${item.foto}`}
                style={styles.productImage}
              />
            </View>
            <View style={styles.productInfoColumn}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailTitle, { width: 80 }]}>
                  Nama Produk
                </Text>
                <Text style={styles.detailText}>: {item.nama}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailTitle, { width: 80 }]}>Harga</Text>
                <Text style={styles.detailText}>
                  : {formatRupiah(item.harga_awal)} -{" "}
                  {formatRupiah(item.harga_akhir)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailTitle, { width: 80 }]}>
                  Deskripsi
                </Text>
                <Text style={styles.detailText}>: {item.deskripsi}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailTitle, { width: 80 }]}>
                  Pelaku Usaha
                </Text>
                <Text style={styles.detailText}>: {item.pelaku_usaha}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailTitle, { width: 80 }]}>No. HP</Text>
                <Text style={styles.detailText}>: {item.nohp}</Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.detailText}>Tidak ada data produk</Text>
      )}
    </View>
  );

  const KasSection = () => (
    <View>
      <Text style={styles.sectionTitle}>III. Catatan Keuangan (Kas)</Text>

      {/* Kas Header */}
      <View style={[styles.tableRow, { backgroundColor: "#DEDEDE" }]}>
        <Text style={[styles.tableColHeader, { width: 80 }]}>Tanggal</Text>
        <Text style={[styles.tableColHeader, { width: 100 }]}>Jenis</Text>
        <Text style={[styles.tableColHeader, { flex: 1 }]}>Keterangan</Text>
        <Text style={[styles.tableColHeader, { width: 100 }]}>Jumlah</Text>
      </View>

      {/* Kas Items */}
      {kas
        .filter((item) => item.tgl_transaksi)
        .map((item, index) => (
          <View key={index} style={styles.kasRow}>
            <Text style={styles.kasDate}>
              {formatTanggal(item.tgl_transaksi)}
            </Text>
            <Text
              style={[
                styles.kasType,
                {
                  color:
                    item.jenis_transaksi === "Pemasukan"
                      ? "#15803d"
                      : "#b91c1c",
                },
              ]}
            >
              {item.jenis_transaksi}
            </Text>
            <Text style={styles.kasDescription}>{item.nama_transaksi}</Text>
            <Text
              style={[
                styles.kasAmount,
                {
                  color:
                    item.jenis_transaksi === "Pemasukan"
                      ? "#15803d"
                      : "#b91c1c",
                },
              ]}
            >
              {formatRupiah(item.total_transaksi || 0)}
            </Text>
          </View>
        ))}

      {/* Total Summary */}
      <View
        style={[styles.kasRow, { backgroundColor: "#f5f5f5", marginTop: 10 }]}
      >
        <Text style={[styles.kasDate, { fontWeight: "bold" }]}>Total</Text>
        <Text style={[styles.kasType, { fontWeight: "bold" }]}></Text>
        <Text style={[styles.kasDescription, { fontWeight: "bold" }]}></Text>
        <Text style={[styles.kasAmount, { fontWeight: "bold" }]}>
          {formatRupiah(
            kas.reduce((sum, item) => {
              const amount = item.total_transaksi || 0;
              return item.jenis_transaksi === "Pemasukan"
                ? sum + amount
                : sum - amount;
            }, 0)
          )}
        </Text>
      </View>
    </View>
  );

  const KegiatanSection = () => (
    <View>
      <Text style={styles.sectionTitle}>IV. Kegiatan</Text>

      {kegiatan.map((item) => (
        <View key={item.id} style={{ marginBottom: 20 }}>
          {/* Informasi Kegiatan */}
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: "bold" }}>{item.nama_kegiatan}</Text>
            <Text>Tanggal: {formatTanggal(item.tanggal)}</Text>
            <Text>Uraian: {item.uraian || "-"}</Text>

            {/* File Materi dan Notulensi */}
            {item.file_materi && (
              <Text style={{ color: "blue" }}>
                File Materi: {item.file_materi}
              </Text>
            )}
            {item.file_notulensi && (
              <Text style={{ color: "blue" }}>
                File Notulensi: {item.file_notulensi}
              </Text>
            )}
          </View>

          {/* Galeri Foto */}
          {item.FotoKegiatan?.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
                Dokumentasi Kegiatan:
              </Text>
              <View style={styles.galleryContainer}>
                {item.FotoKegiatan.map((foto, index) => {
                  const width = foto.width || 1;
                  const height = foto.height || 1;
                  const aspectRatio = width / height;
                  const calculatedHeight = Math.min(100 / aspectRatio, 150);

                  return (
                    <View key={index} style={styles.galleryItem}>
                      <View style={styles.imageWrapper}>
                        <Image
                          src={`https://backend-desa-prima-dev.student.stis.ac.id/uploads/${foto.gambar}`}
                          style={{
                            width: "90%",
                            height: calculatedHeight,
                            objectFit: "contain",
                          }}
                          cache={false}
                        />
                      </View>
                      <Text style={styles.captionText}>
                        {formatTanggal(foto.createdAt)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <Text style={{ fontSize: 10, color: "#888", marginTop: 5 }}>
            Diunggah pada {formatTanggal(item.createdAt)}
          </Text>
        </View>
      ))}
    </View>
  );

  const Footer = () => (
    <View style={styles.footerContainer} wrap={false}>
      <Text style={styles.footerText}>Yogyakarta, {formattedDate},</Text>
      <Text style={styles.footerText}>{profil.role}</Text>
      <Text style={[styles.footerText, { marginTop: 70 }]}>{profil.name}</Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ReportTitle />
        <View style={styles.contentContainer}>
          <KelompokDetails />

          {anggota.length > 0 ? (
            <AnggotaTable />
          ) : (
            <Text style={styles.detailText}>Tidak ada data anggota</Text>
          )}

          {produk.length > 0 && <ProdukSection />}

          {kas.length > 0 && <KasSection />}

          {kegiatan.length > 0 && <KegiatanSection />}
        </View>

        <Footer />
      </Page>
    </Document>
  );
};

export default ReportKelompokDesa;
