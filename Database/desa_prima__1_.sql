-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 16, 2025 at 08:38 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `desa_prima`
--

-- --------------------------------------------------------

--
-- Table structure for table `anggota`
--

CREATE TABLE `anggota` (
  `id` int(11) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `jabatan` enum('Ketua','Sekretaris','Bendahara','Anggota') NOT NULL,
  `nohp` varchar(191) DEFAULT NULL,
  `sertifikasi` varchar(191) DEFAULT NULL,
  `kelompokId` int(11) NOT NULL,
  `catatan` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fotokegiatan`
--

CREATE TABLE `fotokegiatan` (
  `id` int(11) NOT NULL,
  `gambar` varchar(191) NOT NULL,
  `kegiatanId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kabupaten`
--

CREATE TABLE `kabupaten` (
  `id` int(11) NOT NULL,
  `nama_kabupaten` varchar(191) NOT NULL,
  `jumlah_desa` int(11) NOT NULL,
  `pendampingId` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kabupaten`
--

INSERT INTO `kabupaten` (`id`, `nama_kabupaten`, `jumlah_desa`, `pendampingId`, `createdAt`, `updatedAt`) VALUES
(1, 'Bantul', 75, NULL, '2024-12-11 00:00:00.000', '2025-06-19 07:49:33.910'),
(2, 'Sleman', 86, NULL, '2025-01-02 00:00:00.000', '2024-10-31 00:00:00.000'),
(3, 'Kulon Progo', 89, NULL, '2024-12-20 00:00:00.000', '2025-06-19 08:28:20.912'),
(4, 'Gunungkidul', 144, NULL, '2024-12-07 00:00:00.000', '2024-12-13 00:00:00.000'),
(5, 'Kota Yogyakarta', 45, NULL, '2024-12-26 00:00:00.000', '2024-12-18 00:00:00.000');

-- --------------------------------------------------------

--
-- Table structure for table `kas`
--

CREATE TABLE `kas` (
  `id` int(11) NOT NULL,
  `tgl_transaksi` datetime NOT NULL,
  `jenis_transaksi` enum('Pemasukan','Pengeluaran') NOT NULL,
  `nama_transaksi` varchar(191) NOT NULL,
  `total_transaksi` int(11) NOT NULL,
  `kelompokId` int(11) NOT NULL,
  `file` varchar(191) NOT NULL,
  `catatan` varchar(191) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kegiatan`
--

CREATE TABLE `kegiatan` (
  `id` int(11) NOT NULL,
  `nama_kegiatan` varchar(191) NOT NULL,
  `uraian` varchar(191) DEFAULT NULL,
  `file_materi` varchar(191) DEFAULT NULL,
  `file_notulensi` varchar(191) DEFAULT NULL,
  `tanggal` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `catatan` varchar(191) DEFAULT NULL,
  `kelompokId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kelompokdesa`
--

CREATE TABLE `kelompokdesa` (
  `id` int(11) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `kabupaten_kota` varchar(191) NOT NULL,
  `kecamatan` varchar(191) NOT NULL,
  `kelurahan` varchar(191) NOT NULL,
  `kabupatenNama` varchar(191) DEFAULT NULL,
  `kecamatanNama` varchar(191) DEFAULT NULL,
  `kelurahanNama` varchar(191) NOT NULL,
  `tanggal_pembentukan` datetime(3) NOT NULL,
  `jumlah_anggota_awal` int(11) NOT NULL,
  `kategori` varchar(191) DEFAULT NULL,
  `jumlah_hibah_diterima` int(11) NOT NULL,
  `status` varchar(191) DEFAULT NULL,
  `catatan` varchar(191) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `kabupatenId` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kelompokdesa`
--

INSERT INTO `kelompokdesa` (`id`, `nama`, `kabupaten_kota`, `kecamatan`, `kelurahan`, `kabupatenNama`, `kecamatanNama`, `kelurahanNama`, `tanggal_pembentukan`, `jumlah_anggota_awal`, `kategori`, `jumlah_hibah_diterima`, `status`, `catatan`, `latitude`, `longitude`, `kabupatenId`, `createdAt`, `updatedAt`) VALUES
(91, 'Mulya Maju', 'KAB. SLEMAN', 'Seyegan', 'Margomulyo', 'KAB. SLEMAN', 'Seyegan', 'Margomulyo', '2009-01-01 00:00:00.000', 25, '', 37000000, 'Pending', NULL, -7.7182657, 110.314849, 2, '2025-07-10 01:25:11.858', '2025-07-10 01:25:11.858'),
(92, 'Desa Mandiri', 'KOTA YOGYAKARTA', 'Danurejan', 'Tegalpanggung', 'KOTA YOGYAKARTA', 'Danurejan', 'Tegalpanggung', '2018-01-08 00:00:00.000', 20, '', 35000000, 'Pending', NULL, -7.7934268, 110.3711352, 5, '2025-07-10 04:44:48.434', '2025-07-10 04:44:48.434'),
(93, 'Dahlia', 'KOTA YOGYAKARTA', 'Jetis', 'Bumijo', 'KOTA YOGYAKARTA', 'Jetis', 'Bumijo', '2013-05-06 00:00:00.000', 25, '', 37000000, 'Pending', NULL, -7.7848352, 110.3594767, 5, '2025-07-10 04:46:03.814', '2025-07-10 04:46:03.814'),
(94, 'Anyelir', 'KOTA YOGYAKARTA', 'Umbulharjo', 'Sorosutan', 'KOTA YOGYAKARTA', 'Umbulharjo', 'Sorosutan', '2013-02-04 00:00:00.000', 25, '', 37000000, 'Pending', NULL, -7.8224141, 110.380925, 5, '2025-07-10 04:47:21.212', '2025-07-10 04:47:21.212'),
(95, 'Teguh Makaryo', 'KOTA YOGYAKARTA', 'Mergangsan', 'Brontokusuman', 'KOTA YOGYAKARTA', 'Mergangsan', 'Brontokusuman', '2009-03-09 00:00:00.000', 25, '', 37500000, 'Pending', NULL, -7.8216755, 110.3720775, 5, '2025-07-10 04:48:36.623', '2025-07-10 04:48:36.623'),
(96, 'Tirtosari', 'KAB. KULON PROGO', 'Samigaluh', 'Gerbosari', 'KAB. KULON PROGO', 'Samigaluh', 'Gerbosari', '2013-03-04 00:00:00.000', 25, '', 37000000, 'Pending', NULL, -7.6733276, 110.1704282, 3, '2025-07-10 04:49:52.256', '2025-07-10 04:49:52.256'),
(97, 'Tri Manunggal', 'KAB. KULON PROGO', 'Kokap', 'Hargorejo', 'KAB. KULON PROGO', 'Kokap', 'Hargorejo', '2016-03-09 00:00:00.000', 20, '', 37500000, 'Pending', NULL, -7.8541081, 110.107428, 3, '2025-07-10 04:50:51.242', '2025-07-10 04:50:51.242'),
(98, 'Amrih Makmur', 'KAB. KULON PROGO', 'Sentolo', 'Demangrejo', 'KAB. KULON PROGO', 'Sentolo', 'Demangrejo', '2016-02-03 00:00:00.000', 25, '', 37000000, 'Pending', NULL, -7.8834701, 110.2046898, 3, '2025-07-10 04:51:58.722', '2025-07-10 04:51:58.722'),
(99, 'Mandiri', 'KAB. BANTUL', 'Imogiri', 'Wukirsari', 'KAB. BANTUL', 'Imogiri', 'Wukirsari', '2017-01-31 00:00:00.000', 15, '', 37000000, 'Pending', NULL, -7.9106899, 110.4014119, 1, '2025-07-10 04:53:27.749', '2025-07-10 04:53:27.749'),
(101, 'Guwosari Makmur', 'KAB. BANTUL', 'Pajangan', 'Guwosari', 'KAB. BANTUL', 'Pajangan', 'Guwosari', '2023-03-06 00:00:00.000', 15, '', 20000000, 'Pending', NULL, -7.8735822, 110.3150504, 1, '2025-07-10 05:01:01.532', '2025-07-10 05:01:01.532'),
(102, 'Melati', 'KAB. SLEMAN', 'Ngemplak', 'Bimomartani', 'KAB. SLEMAN', 'Ngemplak', 'Bimomartani', '2012-01-01 00:00:00.000', 20, '', 34500000, 'Pending', NULL, -7.699915, 110.4616274, 2, '2025-07-10 05:01:47.623', '2025-07-10 05:01:47.623'),
(103, 'Merapi Bangkit', 'KAB. SLEMAN', 'Cangkringan', 'Kepuharjo', 'KAB. SLEMAN', 'Cangkringan', 'Kepuharjo', '2012-01-01 00:00:00.000', 20, '', 34250000, 'Pending', NULL, -7.6254265, 110.437933, 2, '2025-07-10 05:03:16.303', '2025-07-10 05:03:16.303'),
(104, 'Melati', 'KAB. SLEMAN', 'Kalasan', 'Tirtomartani', 'KAB. SLEMAN', 'Kalasan', 'Tirtomartani', '2011-01-01 00:00:00.000', 14, '', 34250000, 'Pending', NULL, -7.7543766, 110.4707167, 2, '2025-07-10 05:04:32.123', '2025-07-10 05:04:32.123'),
(105, 'Lestari', 'KAB. SLEMAN', 'Minggir', 'Sendangmulyo', 'KAB. SLEMAN', 'Minggir', 'Sendangmulyo', '2010-01-01 00:00:00.000', 15, '', 37000000, 'Pending', NULL, -7.7426899, 110.2353842, 2, '2025-07-10 05:05:31.949', '2025-07-10 05:05:31.949');

-- --------------------------------------------------------

--
-- Table structure for table `laporan`
--

CREATE TABLE `laporan` (
  `id` int(11) NOT NULL,
  `nama_laporan` varchar(191) DEFAULT NULL,
  `file` varchar(191) NOT NULL,
  `deskripsi` varchar(191) NOT NULL,
  `catatan` varchar(191) DEFAULT NULL,
  `kelompokId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pelaporan`
--

CREATE TABLE `pelaporan` (
  `id` int(11) NOT NULL,
  `tgl_lapor` datetime NOT NULL,
  `deskripsi` varchar(191) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `kelompokId` int(11) NOT NULL,
  `laporanId` int(11) DEFAULT NULL,
  `kegiatanId` int(11) DEFAULT NULL,
  `produkId` int(11) DEFAULT NULL,
  `kasId` int(11) DEFAULT NULL,
  `anggotaId` int(11) DEFAULT NULL,
  `isBatchUpload` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `produk`
--

CREATE TABLE `produk` (
  `id` int(11) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `harga_awal` int(11) NOT NULL,
  `harga_akhir` int(11) NOT NULL,
  `foto` varchar(191) NOT NULL,
  `deskripsi` varchar(191) NOT NULL,
  `catatan` varchar(191) DEFAULT NULL,
  `kelompokId` int(11) NOT NULL,
  `anggotaId` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` enum('Admin','Pegawai','Pengurus','Pendamping') NOT NULL,
  `nip` varchar(191) DEFAULT NULL,
  `kabupatenId` int(11) DEFAULT NULL,
  `kelompokId` int(11) DEFAULT NULL,
  `anggotaId` int(11) DEFAULT NULL,
  `sendEmail` tinyint(1) NOT NULL DEFAULT 0,
  `resetPasswordToken` varchar(191) DEFAULT NULL,
  `resetPasswordExpires` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `name`, `email`, `password`, `role`, `nip`, `kabupatenId`, `kelompokId`, `anggotaId`, `sendEmail`, `resetPasswordToken`, `resetPasswordExpires`, `createdAt`, `updatedAt`) VALUES
(1, 'Adien Mutafaila', 'ilmaadien@gmail.com', '$2b$08$oSqWceqzV34at17BhCGQT.1Qy05fMyCu0DxSP4a0AHx781aQ20kV.', 'Admin', '212121', NULL, NULL, NULL, 1, 'ffa96b6edee5ea21f8420e0ea3bf8f55fa9669bc', '2025-07-10 03:16:15.625', '2025-05-07 05:41:32.914', '2025-07-10 02:16:15.626'),
(24, 'Frinanda', 'nandanindya2025@gmail.com', '$2b$08$z8bWOMmfnWuJZSZLDWvO.OroLmFax.vX6Q3sah3LblBKO4rGmHl0a', 'Admin', '222111841222111841', NULL, NULL, NULL, 1, NULL, NULL, '2025-07-09 09:02:15.688', '2025-07-09 09:02:15.688'),
(25, 'Diah Puspita', 'puspitadiah345@gmail.com', '$2b$08$YLYPv3aEhvZ78fh40TY9sePULCzvZ2sYtk3MF/yOUWLmawxksET46', 'Admin', NULL, NULL, NULL, NULL, 1, NULL, NULL, '2025-07-10 02:09:01.245', '2025-07-10 02:09:01.245'),
(26, 'Setya Hadi', 'setyahadinugroho3@gmail.com', '$2b$08$rrv8eDiitGLvGOSZKsSPP.B/6LGowsnfmZqYG9rT87MibMME4b8Ti', 'Admin', NULL, NULL, NULL, NULL, 1, NULL, NULL, '2025-07-10 04:42:29.240', '2025-07-10 04:42:29.240'),
(35, 'Adien Mutafaila', 'adienmutafaila@gmail.com', '$2b$10$M.gKfKwJsU53kSATDbrQV.4qiztmQ3C7nNHB6EIblCFnnKWXBec6y', 'Pendamping', NULL, 2, NULL, NULL, 1, NULL, NULL, '2025-07-10 17:02:59.319', '2025-07-10 17:02:59.319'),
(36, 'Ilma', '222111841@stis.ac.id', '$2b$08$44hFvOmI3dBAYk37NipO5.oNAOi1zoWu284h/G0WO1sBpEmbB7yuu', 'Pengurus', NULL, NULL, NULL, NULL, 1, NULL, NULL, '2025-07-11 15:28:09.253', '2025-07-13 15:50:01.841'),
(37, 'Ilma', 'friskaamaliahi@gmail.com', '$2b$08$W6X9Xx8JNxoih.Vm5qpBROW1ONekeP9/VjjbBl/Tem.AXDmgzVDiC', 'Pegawai', NULL, NULL, NULL, NULL, 1, NULL, NULL, '2025-07-11 15:29:11.506', '2025-07-11 15:29:11.506');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('133eca5e-0c41-4238-872c-e41610502ebe', '62dac1ad90931a8e8cf4c791b578d8d9303dcf1cad6ec7b1d70c5c6297b46244', '2025-07-10 08:28:36.912', '20250710082835_init', NULL, NULL, '2025-07-10 08:28:35.530', 1),
('192eab64-9d78-42fe-90f4-85ae24bf042a', 'e592621d87cf4891dc5b12fc00bc8be04e1e53068940a2b64a248efa5dd077ad', '2025-08-05 04:14:38.094', '20250805041437_perubahan_kategori', NULL, NULL, '2025-08-05 04:14:38.021', 1),
('a923d61b-7eb4-4c21-b14f-53c4df2c2c47', '4d68dbcf1a127a58aa84ad52aad607f05dac63db0b0b93dd2098f6f98dcc2e23', '2025-08-12 04:18:37.983', '20250812041837_ubah_string_ke_enum', NULL, NULL, '2025-08-12 04:18:37.798', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `anggota`
--
ALTER TABLE `anggota`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Anggota_kelompokId_idx` (`kelompokId`);

--
-- Indexes for table `fotokegiatan`
--
ALTER TABLE `fotokegiatan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FotoKegiatan_kegiatanId_idx` (`kegiatanId`);

--
-- Indexes for table `kabupaten`
--
ALTER TABLE `kabupaten`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Kabupaten_pendampingId_key` (`pendampingId`);

--
-- Indexes for table `kas`
--
ALTER TABLE `kas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Kas_kelompokId_idx` (`kelompokId`);

--
-- Indexes for table `kegiatan`
--
ALTER TABLE `kegiatan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Kegiatan_kelompokId_idx` (`kelompokId`);

--
-- Indexes for table `kelompokdesa`
--
ALTER TABLE `kelompokdesa`
  ADD PRIMARY KEY (`id`),
  ADD KEY `KelompokDesa_kabupatenId_idx` (`kabupatenId`);

--
-- Indexes for table `laporan`
--
ALTER TABLE `laporan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Laporan_kelompokId_idx` (`kelompokId`);

--
-- Indexes for table `pelaporan`
--
ALTER TABLE `pelaporan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Pelaporan_kelompokId_idx` (`kelompokId`),
  ADD KEY `Pelaporan_laporanId_idx` (`laporanId`),
  ADD KEY `Pelaporan_kegiatanId_idx` (`kegiatanId`),
  ADD KEY `Pelaporan_produkId_idx` (`produkId`),
  ADD KEY `Pelaporan_kasId_idx` (`kasId`),
  ADD KEY `Pelaporan_anggotaId_idx` (`anggotaId`),
  ADD KEY `Pelaporan_userId_fkey` (`userId`);

--
-- Indexes for table `produk`
--
ALTER TABLE `produk`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Produk_kelompokId_idx` (`kelompokId`),
  ADD KEY `Produk_anggotaId_fkey` (`anggotaId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`),
  ADD UNIQUE KEY `User_nip_key` (`nip`),
  ADD UNIQUE KEY `User_anggotaId_key` (`anggotaId`),
  ADD KEY `User_kabupatenId_fkey` (`kabupatenId`),
  ADD KEY `User_kelompokId_fkey` (`kelompokId`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `anggota`
--
ALTER TABLE `anggota`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=122;

--
-- AUTO_INCREMENT for table `fotokegiatan`
--
ALTER TABLE `fotokegiatan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `kabupaten`
--
ALTER TABLE `kabupaten`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `kas`
--
ALTER TABLE `kas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `kegiatan`
--
ALTER TABLE `kegiatan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `kelompokdesa`
--
ALTER TABLE `kelompokdesa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=112;

--
-- AUTO_INCREMENT for table `laporan`
--
ALTER TABLE `laporan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pelaporan`
--
ALTER TABLE `pelaporan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=130;

--
-- AUTO_INCREMENT for table `produk`
--
ALTER TABLE `produk`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `anggota`
--
ALTER TABLE `anggota`
  ADD CONSTRAINT `Anggota_kelompokId_fkey` FOREIGN KEY (`kelompokId`) REFERENCES `kelompokdesa` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `fotokegiatan`
--
ALTER TABLE `fotokegiatan`
  ADD CONSTRAINT `FotoKegiatan_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `kegiatan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `kabupaten`
--
ALTER TABLE `kabupaten`
  ADD CONSTRAINT `Kabupaten_pendampingId_fkey` FOREIGN KEY (`pendampingId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `kas`
--
ALTER TABLE `kas`
  ADD CONSTRAINT `Kas_kelompokId_fkey` FOREIGN KEY (`kelompokId`) REFERENCES `kelompokdesa` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `kegiatan`
--
ALTER TABLE `kegiatan`
  ADD CONSTRAINT `Kegiatan_kelompokId_fkey` FOREIGN KEY (`kelompokId`) REFERENCES `kelompokdesa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `kelompokdesa`
--
ALTER TABLE `kelompokdesa`
  ADD CONSTRAINT `KelompokDesa_kabupatenId_fkey` FOREIGN KEY (`kabupatenId`) REFERENCES `kabupaten` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `laporan`
--
ALTER TABLE `laporan`
  ADD CONSTRAINT `Laporan_kelompokId_fkey` FOREIGN KEY (`kelompokId`) REFERENCES `kelompokdesa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pelaporan`
--
ALTER TABLE `pelaporan`
  ADD CONSTRAINT `Pelaporan_anggotaId_fkey` FOREIGN KEY (`anggotaId`) REFERENCES `anggota` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Pelaporan_kasId_fkey` FOREIGN KEY (`kasId`) REFERENCES `kas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Pelaporan_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `kegiatan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Pelaporan_kelompokId_fkey` FOREIGN KEY (`kelompokId`) REFERENCES `kelompokdesa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Pelaporan_laporanId_fkey` FOREIGN KEY (`laporanId`) REFERENCES `laporan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Pelaporan_produkId_fkey` FOREIGN KEY (`produkId`) REFERENCES `produk` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Pelaporan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `produk`
--
ALTER TABLE `produk`
  ADD CONSTRAINT `Produk_anggotaId_fkey` FOREIGN KEY (`anggotaId`) REFERENCES `anggota` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Produk_kelompokId_fkey` FOREIGN KEY (`kelompokId`) REFERENCES `kelompokdesa` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `User_anggotaId_fkey` FOREIGN KEY (`anggotaId`) REFERENCES `anggota` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `User_kabupatenId_fkey` FOREIGN KEY (`kabupatenId`) REFERENCES `kabupaten` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `User_kelompokId_fkey` FOREIGN KEY (`kelompokId`) REFERENCES `kelompokdesa` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
