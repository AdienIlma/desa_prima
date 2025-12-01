export const API_CONFIG = {
  BASE_URL: "https://backend-desa-prima-dev.student.stis.ac.id",
  ENDPOINTS: {
    DESA: "/kelompok",
    USERS: "/users",
    UPLOAD: "/uploads",
    PRODUK: "/komponen-produk",
    KEGIATAN: "/komponen-kegiatan",
    ANGGOTA: "/komponen-anggota",
    KAS: "/komponen-kas",
    LAPORAN: "/komponen-laporan",
    KABUPATEN: "/kabupaten",
    PELAPORAN: "/pelaporan",
  },
  getFullUrl: (endpoint, path = "") => {
    return `${API_CONFIG.BASE_URL}${endpoint}/${path.replace(/^\/+/, "")}`;
  },
};
