-- CreateTable
CREATE TABLE `Kabupaten` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_kabupaten` VARCHAR(191) NOT NULL,
    `jumlah_desa` INTEGER NOT NULL,
    `pendampingId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Kabupaten_pendampingId_key`(`pendampingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KelompokDesa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `kabupaten_kota` VARCHAR(191) NOT NULL,
    `kecamatan` VARCHAR(191) NOT NULL,
    `kelurahan` VARCHAR(191) NOT NULL,
    `kabupatenNama` VARCHAR(191) NULL,
    `kecamatanNama` VARCHAR(191) NULL,
    `kelurahanNama` VARCHAR(191) NOT NULL,
    `tanggal_pembentukan` DATETIME(3) NOT NULL,
    `jumlah_anggota_awal` INTEGER NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `jumlah_hibah_diterima` INTEGER NOT NULL,
    `status` VARCHAR(191) NULL,
    `catatan` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `kabupatenId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `KelompokDesa_kabupatenId_idx`(`kabupatenId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kegiatan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_kegiatan` VARCHAR(191) NOT NULL,
    `uraian` VARCHAR(191) NULL,
    `file_materi` VARCHAR(191) NULL,
    `file_notulensi` VARCHAR(191) NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `catatan` VARCHAR(191) NULL,
    `kelompokId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Kegiatan_kelompokId_idx`(`kelompokId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FotoKegiatan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gambar` VARCHAR(191) NOT NULL,
    `kegiatanId` INTEGER NOT NULL,

    INDEX `FotoKegiatan_kegiatanId_idx`(`kegiatanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Laporan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_laporan` VARCHAR(191) NULL,
    `file` VARCHAR(191) NOT NULL,
    `deskripsi` VARCHAR(191) NOT NULL,
    `catatan` VARCHAR(191) NULL,
    `kelompokId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Laporan_kelompokId_idx`(`kelompokId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Produk` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `harga_awal` INTEGER NOT NULL,
    `harga_akhir` INTEGER NOT NULL,
    `foto` VARCHAR(191) NOT NULL,
    `deskripsi` VARCHAR(191) NOT NULL,
    `catatan` VARCHAR(191) NULL,
    `kelompokId` INTEGER NOT NULL,
    `anggotaId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Produk_kelompokId_idx`(`kelompokId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Anggota` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `jabatan` VARCHAR(191) NOT NULL,
    `nohp` VARCHAR(191) NULL,
    `sertifikasi` VARCHAR(191) NULL,
    `kelompokId` INTEGER NOT NULL,
    `catatan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Anggota_kelompokId_idx`(`kelompokId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tgl_transaksi` DATETIME(0) NOT NULL,
    `jenis_transaksi` VARCHAR(191) NOT NULL,
    `nama_transaksi` VARCHAR(191) NOT NULL,
    `total_transaksi` INTEGER NOT NULL,
    `kelompokId` INTEGER NOT NULL,
    `file` VARCHAR(191) NOT NULL,
    `catatan` VARCHAR(191) NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `Kas_kelompokId_idx`(`kelompokId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `nip` VARCHAR(191) NULL,
    `kabupatenId` INTEGER NULL,
    `kelompokId` INTEGER NULL,
    `anggotaId` INTEGER NULL,
    `sendEmail` BOOLEAN NOT NULL DEFAULT false,
    `resetPasswordToken` VARCHAR(191) NULL,
    `resetPasswordExpires` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_nip_key`(`nip`),
    UNIQUE INDEX `User_anggotaId_key`(`anggotaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pelaporan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tgl_lapor` DATETIME(0) NOT NULL,
    `deskripsi` VARCHAR(191) NULL,
    `userId` INTEGER NULL,
    `kelompokId` INTEGER NOT NULL,
    `laporanId` INTEGER NULL,
    `kegiatanId` INTEGER NULL,
    `produkId` INTEGER NULL,
    `kasId` INTEGER NULL,
    `anggotaId` INTEGER NULL,
    `isBatchUpload` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Pelaporan_kelompokId_idx`(`kelompokId`),
    INDEX `Pelaporan_laporanId_idx`(`laporanId`),
    INDEX `Pelaporan_kegiatanId_idx`(`kegiatanId`),
    INDEX `Pelaporan_produkId_idx`(`produkId`),
    INDEX `Pelaporan_kasId_idx`(`kasId`),
    INDEX `Pelaporan_anggotaId_idx`(`anggotaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Kabupaten` ADD CONSTRAINT `Kabupaten_pendampingId_fkey` FOREIGN KEY (`pendampingId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KelompokDesa` ADD CONSTRAINT `KelompokDesa_kabupatenId_fkey` FOREIGN KEY (`kabupatenId`) REFERENCES `Kabupaten`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kegiatan` ADD CONSTRAINT `Kegiatan_kelompokId_fkey` FOREIGN KEY (`kelompokId`) REFERENCES `KelompokDesa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FotoKegiatan` ADD CONSTRAINT `FotoKegiatan_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `Kegiatan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Laporan` ADD CONSTRAINT `Laporan_kelompokId_fkey` FOREIGN KEY (`kelompokId`) REFERENCES `KelompokDesa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Produk` ADD CONSTRAINT `Produk_kelompokId_fkey` FOREIGN KEY (`kelompokId`) REFERENCES `KelompokDesa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Produk` ADD CONSTRAINT `Produk_anggotaId_fkey` FOREIGN KEY (`anggotaId`) REFERENCES `Anggota`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Anggota` ADD CONSTRAINT `Anggota_kelompokId_fkey` FOREIGN KEY (`kelompokId`) REFERENCES `KelompokDesa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kas` ADD CONSTRAINT `Kas_kelompokId_fkey` FOREIGN KEY (`kelompokId`) REFERENCES `KelompokDesa`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_anggotaId_fkey` FOREIGN KEY (`anggotaId`) REFERENCES `Anggota`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_kabupatenId_fkey` FOREIGN KEY (`kabupatenId`) REFERENCES `Kabupaten`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_kelompokId_fkey` FOREIGN KEY (`kelompokId`) REFERENCES `KelompokDesa`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pelaporan` ADD CONSTRAINT `Pelaporan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pelaporan` ADD CONSTRAINT `Pelaporan_kelompokId_fkey` FOREIGN KEY (`kelompokId`) REFERENCES `KelompokDesa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pelaporan` ADD CONSTRAINT `Pelaporan_laporanId_fkey` FOREIGN KEY (`laporanId`) REFERENCES `Laporan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pelaporan` ADD CONSTRAINT `Pelaporan_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `Kegiatan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pelaporan` ADD CONSTRAINT `Pelaporan_produkId_fkey` FOREIGN KEY (`produkId`) REFERENCES `Produk`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pelaporan` ADD CONSTRAINT `Pelaporan_kasId_fkey` FOREIGN KEY (`kasId`) REFERENCES `kas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pelaporan` ADD CONSTRAINT `Pelaporan_anggotaId_fkey` FOREIGN KEY (`anggotaId`) REFERENCES `Anggota`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
