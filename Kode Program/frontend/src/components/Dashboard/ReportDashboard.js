import React from "react";
import {
  Text,
  View,
  Page,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Fungsi helper untuk handling string
const safeString = (str) => str || "";
const safeUpperCase = (str) => safeString(str).toUpperCase();

const ReportDashboard = ({
  page,
  profil,
  data,
  barChartImage,
  doughnutChartImage,
  barChartVerticalImage,
  barChartAnggotaImage,
  barChartProdukImage,
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
      paddingTop: 30,
      paddingBottom: 50,
      paddingLeft: 40,
      paddingRight: 40,
      lineHeight: 1.5,
      flexDirection: "column",
    },
    titleContainer: {
      textAlign: "center",
      marginBottom: 15,
    },
    reportTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 5,
    },
    underline: {
      width: "100%",
      height: 2,
      backgroundColor: "#000",
      marginBottom: 15,
    },
    contentContainer: {
      flexDirection: "column",
    },
    detailsContainer: {
      marginBottom: 15,
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
      width: 180,
    },
    detailText: {
      fontSize: 11,
      marginBottom: 8,
      color: "#3E3E3E",
    },
    chartContainer: {
      marginBottom: 20,
      alignItems: "center",
      pageBreakInside: "avoid",
      width: "100%",
    },
    chartTitle: {
      fontSize: 12,
      fontWeight: "bold",
      marginBottom: 10,
      textAlign: "center",
    },
    twoColumnContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 15,
    },
    barChartColumn: {
      flex: 2,
      marginRight: 10,
    },
    doughnutChartColumn: {
      flex: 1,
    },
    chartImage: {
      width: "auto",
      height: 200,
      resizeMode: "contain",
      maxWidth: "100%",
      margin: "0 auto"
    },
    doughnutChartImage: {
      width: "100%",
      height: 200,
      resizeMode: "contain",
    },
    doughnutCenterContainer: {
      position: "absolute",
      top: "57%",
      left: "30%",
      transform: "translate(-50%, -50%)",
      textAlign: "center",
      width: "100%",
    },
    doughnutCenterPercentage: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 4,
    },
    doughnutCenterLabel: {
      fontSize: 10,
    },
    column: {
      width: "48%",
    },
    footerContainer: {
      alignSelf: "flex-end",
      textAlign: "center",
      marginTop: 30,
      breakInside: "avoid",
    },
    footerText: {
      fontSize: 11,
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
    },
    signatureSpace: {
      height: 70,
    },
  });

  const persentaseKelompokDesa = data.jumlah_desa
    ? (
        ((data.desaMaju + data.desaBerkembang + data.desaTumbuh) /
          data.jumlah_desa) *
        100
      ).toFixed(1)
    : 0;

  const getLingkupLaporan = () => {
    if (page === "provinsi") {
      return "PROVINSI DAERAH ISTIMEWA YOGYAKARTA";
    }
    if (page === "kabupaten") {
      const namaKabupaten = safeUpperCase(data.nama_kabupaten);
      return namaKabupaten === "YOGYAKARTA"
        ? "KOTA YOGYAKARTA"
        : `KABUPATEN ${namaKabupaten}`;
    }
    return "";
  };

  const lingkupLaporan = getLingkupLaporan();

  const ReportTitle = () => (
    <View style={styles.titleContainer}>
      <Text style={styles.reportTitle}>
        LAPORAN MONITORING PROGRAM DESA PRIMA
      </Text>
      <Text style={styles.reportTitle}>{lingkupLaporan}</Text>
      <View style={styles.underline} />
    </View>
  );

  const ProgramDetails = () => (
    <View style={styles.detailsContainer}>
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
        <Text style={styles.detailTitle}>Tanggal Laporan</Text>
        <Text style={styles.detailText}>: {formattedDate}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>Total Desa</Text>
        <Text style={styles.detailText}>: {data.jumlah_desa}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>Desa Terkategori</Text>
        <Text style={styles.detailText}>: {data.totalJumlahKelompok}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>Persentase Desa Terkategori</Text>
        <Text style={styles.detailText}>: {persentaseKelompokDesa}%</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>Desa Maju</Text>
        <Text style={styles.detailText}>: {data.desaMaju}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>Desa Berkembang</Text>
        <Text style={styles.detailText}>: {data.desaBerkembang}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>Desa Tumbuh</Text>
        <Text style={styles.detailText}>: {data.desaTumbuh}</Text>
      </View>
    </View>
  );

  const ChartWithTitle = ({ title, chartImage, chartStyle }) => {
    return (
      <View style={styles.chartContainer} wrap={false}>
        <Text style={styles.chartTitle}>{title}</Text>
        <Image src={chartImage} style={chartStyle} />
      </View>
    );
  };

  const ChartWithTitleDoughnut = ({ title, chartImage, centerText }) => {
    return (
      <View style={styles.chartContainer} wrap={false}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={{ position: "relative", width: "100%", height: 200 }}>
          <Image src={chartImage} style={styles.doughnutChartImage} />
          {centerText && (
            <View style={styles.doughnutCenterContainer}>
              <Text style={styles.doughnutCenterPercentage}>
                {centerText.percentage}%
              </Text>
              <Text style={styles.doughnutCenterLabel}>{centerText.label}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const Footer = () => (
    <View style={styles.footerContainer} wrap={false}>
      <Text style={styles.footerText}>Yogyakarta, {formattedDate}</Text>
      <View style={styles.signatureSpace} />
      <Text style={styles.footerText}>{profil.name}</Text>
      <Text style={styles.footerText}>{profil.role}</Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page} debug={false}>
        <ReportTitle />
        <View style={styles.contentContainer}>
          <ProgramDetails />

          <View style={styles.twoColumnContainer}>
            <View style={styles.barChartColumn}>
              <ChartWithTitle
                title="Jumlah Kelompok Ekonomi per Kategori"
                chartImage={barChartImage}
                chartStyle={styles.chartImage}
              />
            </View>

            <View style={styles.doughnutChartColumn}>
              <ChartWithTitleDoughnut
                title="Distribusi Kategori Kelompok Ekonomi"
                chartImage={doughnutChartImage}
                centerText={{
                  percentage: persentaseKelompokDesa,
                  label: "Desa Terkategori",
                }}
              />
            </View>
          </View>

          <ChartWithTitle
            title="Perkembangan Jumlah Kelompok Ekonomi"
            chartImage={barChartVerticalImage}
            chartStyle={styles.chartImage}
          />

          <ChartWithTitle
            title="Perkembangan Kumulatif Jumlah Anggota"
            chartImage={barChartAnggotaImage}
            chartStyle={styles.chartImage}
          />

          <ChartWithTitle
            title="Perkembangan Kumulatif Jumlah Produk"
            chartImage={barChartProdukImage}
            chartStyle={styles.chartImage}
          />
        </View>

        <Footer />
      </Page>
    </Document>
  );
};

export default ReportDashboard;
