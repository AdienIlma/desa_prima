/*
  Warnings:

  - You are about to alter the column `jabatan` on the `anggota` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - You are about to alter the column `jenis_transaksi` on the `kas` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `anggota` MODIFY `jabatan` ENUM('Ketua', 'Sekretaris', 'Bendahara', 'Anggota') NOT NULL;

-- AlterTable
ALTER TABLE `kas` MODIFY `jenis_transaksi` ENUM('Pemasukan', 'Pengeluaran') NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('Admin', 'Pegawai', 'Pengurus', 'Pendamping') NOT NULL;
