const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const kelompokRoutes = require("./routes/kelompokRoutes");
const kegiatanRoutes = require("./routes/kegiatanRoutes")
const kabupatenRoutes = require("./routes/kabupatenRoutes");
const produkRoutes = require("./routes/produkRoutes");
const pelaporanRoutes = require("./routes/pelaporanRoutes");
const laporanRoutes = require("./routes/laporanRoutes");
const anggotaRoutes = require("./routes/anggotaRoutes");
const kasRoutes = require("./routes/kasRoutes")
const path = require("path");

const app = express();

app.use(
  cors({
    origin: ["https://frontend-desa-prima-dev.student.stis.ac.id", "http://localhost:3000", "https://backend-desa-prima-dev.student.stis.ac.id"],
    methods: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.options("*", cors()); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require("dotenv").config();

app.get("/", (req, res) => {
  res.send("API berjalan dengan baik");
});

// Routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/users", userRoutes);
app.use("/komponen-produk", produkRoutes);
app.use("/pelaporan", pelaporanRoutes);
app.use("/kelompok", kelompokRoutes);
app.use("/komponen-kegiatan", kegiatanRoutes);
app.use("/komponen-laporan", laporanRoutes);
app.use("/komponen-anggota", anggotaRoutes);
app.use("/komponen-kas", kasRoutes);
app.use("/kabupaten", kabupatenRoutes);

const PORT = 5010;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on PORT: ${PORT}`);
});
