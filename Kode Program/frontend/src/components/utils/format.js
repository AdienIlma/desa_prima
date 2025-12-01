  export const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  export const formatKabupatenDaftar = (kabupatenName) => {
    return kabupatenName
      .replace("Kota", "")
      .replace(/\s+/g, "")
      .replace(/^(\w)/, (match) => match.toUpperCase());
  };

  export const formatKabupatenName = (name) => {
      if (!name) return name;
      const lowerName = name.toLowerCase();
      if (lowerName.includes("kab.")) {
        return (
          "Kab." +
          lowerName
            .split("kab.")[1]
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        );
      }
      if (lowerName.includes("kota")) {
        return (
          "Kota " +
          lowerName
            .split("kota")[1]
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        );
      }
      return lowerName
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    export const formatDaftarKabupaten = (nama) => {
      if (!nama) return "-";
      return nama === "Kota Yogyakarta" 
        ? `Kota Yogyakarta` 
        : `Kabupaten ${nama}`;
    };
  
    export const formatKabupatenForAPI = (name) => {
      if (name.toLowerCase().includes('yogyakarta')) {
        return 'yogyakarta'; // atau 'kota-yogyakarta' sesuai kebutuhan backend
      }
      return name.replace(/KAB\.?\s*/i, '').replace(/\s+/g, '-').toLowerCase();
    };

    export const formatKabupatenModal = (name) => {
      if (!name) return '';
      
      // Standarisasi format: "KAB. SLEMAN" -> "Sleman"
      return name.toString()
        .replace(/KAB\.?\s*/i, '')  // Hapus "KAB." atau "KAB"
        .replace(/\s+/g, ' ')       // Hapus spasi berlebih
        .trim()
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    export const formatKabupatenPendek = (name) => {
  if (!name) return '';
  
  // Hilangkan 'KAB.', 'KOTA', dan whitespace berlebih
  return name.toString()
    .replace(/^KAB\.?\s*/i, '')
    .replace(/^KOTA\s*/i, '')
    .trim()
    .toLowerCase();
};
    
    export const formatKabupatenNameForDatabase = (name) => {
      return name.toString()
        .replace(/KAB\.?\s*/i, '')
        .trim()
        .toLowerCase();
    };

    export const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

export const formatAlamat = (kelurahan, kecamatan, kabupaten) => {
  const parts = [];
  if (kelurahan) parts.push(kelurahan);
  if (kecamatan) parts.push(kecamatan);
  if (kabupaten) parts.push(kabupaten);
  return parts.join(", ") || "Alamat tidak tersedia";
};

export const formatTanggal = (dateString) => {
  if (!dateString) return "Tanggal tidak tersedia";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  } catch (e) {
    return "Format tanggal tidak valid";
  }
};

export  const truncateText = (text, maxLength) => {
    if (text === null || text === undefined) return "";
    const textStr = String(text);
    if (textStr.length > maxLength) {
      return textStr.substring(0, maxLength) + "...";
    }
    return textStr;
  };

export const formattedPeriode = (kabupaten) => {
  return kabupaten?.tanggal_awal && kabupaten?.tanggal_akhir
    ? `${formatTanggal(kabupaten.tanggal_awal)} - ${formatTanggal(
        kabupaten.tanggal_akhir
      )}`
    : "Periode tidak tersedia";
};

export const formatNamaWilayah = (nama) => {
    if (!nama) return '';
    
    const namaUpper = nama.toUpperCase();
    const isKota = namaUpper.includes('KOTA');
    
    // Jika sudah mengandung "KOTA", kembalikan langsung
    if (isKota) return namaUpper;
    
    // Jika tidak, tambahkan "KAB."
    return `KAB. ${namaUpper}`;
  };