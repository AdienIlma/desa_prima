import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";
import { Audio } from "react-loader-spinner";
import useMediaQuery from "../useMediaQuery";
import FormUser from "./Modal/FormUser";
import DeleteUserModal from "./Modal/DeleteUserModal";
import useUserData from "../hooks/useUserData";
import ModalPreviewExcel from "../Modal/ModalPreviewExcel";
import UserListUI from "./UserListUI";

const columns = [
  { id: "no", label: "No" },
  { id: "name", label: "Nama" },
  { id: "role", label: "Role" },
  { id: "email", label: "Email" },
  { id: "nip", label: "NIP" },
  { id: "akses", label: "Akses" },
];

const ListUser = () => {
  const { userList, loading, refresh } = useUserData();
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "no",
    direction: "ascending",
  });
  const [search, setSearch] = useState("");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [previewData, setPreviewData] = useState({
    columns: [],
    data: [],
  });
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);

  // State for filters
  const [showFilters, setShowFilters] = useState(false);
  const [roleFilters, setRoleFilters] = useState([]);
  const [kabupatenFilters, setKabupatenFilters] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [availableKabupatens, setAvailableKabupatens] = useState([]);

  // Extract available roles and kabupatens from userList
  useEffect(() => {
    if (userList.length > 0) {
      const roles = [...new Set(userList.map((user) => user.role))].filter(
        Boolean
      );
      setAvailableRoles(roles);

      const kabupatens = [
        ...new Set(
          userList
            .filter((user) => user.kabupatenId)
            .map((user) => user.nama_kabupaten)
        ),
      ].filter(Boolean);
      setAvailableKabupatens(kabupatens);
    }
  }, [userList]);

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const filteredUsers = useMemo(() => {
    return userList
      .filter((user) => {
        if (!user) return false;

        // Search filter
        const keyword = search.toLowerCase();
        const name = user.name ? user.name.toLowerCase() : "";
        const nip = user.nip ? user.nip.toLowerCase() : "";
        const email = user.email ? user.email.toLowerCase() : "";
        const role = user.role ? user.role.toLowerCase() : "";

        const akses = user.kabupatenId
          ? `${user.nama_kabupaten}`
          : user.kelompokId
          ? `Kelompok ${user.nama_kelompok}`
          : "-";

        // Role filter
        const roleMatch =
          roleFilters.length === 0 ||
          (user.role && roleFilters.includes(user.role));

        // Kabupaten filter
        const kabupatenMatch =
          kabupatenFilters.length === 0 ||
          (user.nama_kabupaten &&
            kabupatenFilters.includes(user.nama_kabupaten));

        return (
          (name.includes(keyword) ||
            nip.includes(keyword) ||
            email.includes(keyword) ||
            role.includes(keyword) ||
            akses.toLowerCase().includes(keyword)) &&
          roleMatch &&
          kabupatenMatch
        );
      })
      .map((user, index) => ({
        ...user,
        no: index + 1,
        akses: user.kabupatenId
          ? `${user.nama_kabupaten}`
          : user.kelompokId
          ? `Kelompok ${user.nama_kelompok}`
          : "-",
      }));
  }, [search, userList, roleFilters, kabupatenFilters]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    refresh();
  };

  const sortedData = React.useMemo(() => {
    let sortableData = [...filteredUsers];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [filteredUsers, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalType("form");
    setIsModalOpen(true);
    console.log("Edit clicked", user);
  };

  const handleDelete = async () => {
    if (!itemToDelete || !itemToDelete.id) {
      toast.error("Data yang akan dihapus tidak valid.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.delete(
        `https://backend-desa-prima-dev.student.stis.ac.id/users/list/${itemToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Response dari server:", response.data);
      toast.success(`User "${itemToDelete.name}" berhasil dihapus!`);
      setIsDeleteModalOpen(false);
      refresh();
    } catch (err) {
      console.error(
        "Error saat menghapus data:",
        err.response?.data || err.message
      );
      toast.error("Gagal menghapus data.");
    }
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const headers = [];
      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
        headers.push(cell.v);
      }

      setPreviewData({
        columns: headers,
        data: jsonData.slice(0, 10),
      });
      setFileToUpload(file);
      setShowPreviewModal(true);
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Gagal membaca file Excel");
    }
  };

  const handleConfirmUpload = async () => {
    setIsUploading(true);
    setShowPreviewModal(false);

    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("file", fileToUpload);

      const response = await axios.post(
        ` https://backend-desa-prima-dev.student.stis.ac.id/users/upload-excel`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Hanya tampilkan success jika ada yang berhasil
      if (response.data.successCount > 0) {
        toast.success(`Berhasil mengunggah ${response.data.successCount} user`);
      }

      // Tampilkan semua error yang terjadi
      if (response.data.errorCount > 0) {
        // Jika semua gagal
        if (response.data.successCount === 0) {
          toast.error("Gagal mengunggah semua data user", {
            duration: 5000,
          });
        }

        // Tampilkan detail error untuk setiap baris
        response.data.errors.forEach((error) => {
          toast.error(`${error.details || error.message}`, {
            duration: 5000,
          });
        });
      }

      refresh();
    } catch (error) {
      console.error("Error uploading file:", error);

      // Handle error dari server
      if (error.response?.data?.errors) {
        // Jika ada error spesifik dari server
        error.response.data.errors.forEach((err) => {
          toast.error(`${err.details || err.message}`, {
            duration: 5000,
          });
        });
      } else {
        // Error umum
        toast.error("Gagal mengunggah file Excel");
      }
    } finally {
      setIsUploading(false);
      setFileToUpload(null);
    }
  };

  const handleExportExcel = async () => {
    setIsDownloading(true);
    try {
      const exportData = filteredUsers.map((user) => ({
        No: user.no,
        Nama: user.name,
        Role: user.role,
        Email: user.email,
        NIP: user.nip,
        Akses: user.akses,
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, "DaftarUser");
      XLSX.writeFile(wb, "daftar_user.xlsx");

      toast.success("Data berhasil diunduh");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Gagal mengunduh data");
    } finally {
      setIsDownloading(false);
    }
  };

  // Toggle role filter
  const toggleRoleFilter = (role) => {
    setRoleFilters((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
    setPage(0); // Reset to first page when filters change
  };

  // Toggle kabupaten filter
  const toggleKabupatenFilter = (kabupaten) => {
    setKabupatenFilters((prev) =>
      prev.includes(kabupaten)
        ? prev.filter((k) => k !== kabupaten)
        : [...prev, kabupaten]
    );
    setPage(0); // Reset to first page when filters change
  };

  // Clear all filters
  const clearAllFilters = () => {
    setRoleFilters([]);
    setKabupatenFilters([]);
    setSearch("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Audio type="Bars" color="#542d48" height={80} width={80} />
      </div>
    );
  }

  return (
    <>
      <UserListUI
        // Data props
        columns={columns}
        loading={loading}
        filteredUsers={filteredUsers}
        sortedData={sortedData}
        search={search}
        roleFilters={roleFilters}
        kabupatenFilters={kabupatenFilters}
        availableRoles={availableRoles}
        availableKabupatens={availableKabupatens}
        showFilters={showFilters}
        isMobile={isMobile}
        page={page}
        rowsPerPage={rowsPerPage}
        sortConfig={sortConfig}
        previewData={previewData}
        showPreviewModal={showPreviewModal}
        isUploading={isUploading}
        // Handler props
        setSearch={setSearch}
        toggleRoleFilter={toggleRoleFilter}
        toggleKabupatenFilter={toggleKabupatenFilter}
        clearAllFilters={clearAllFilters}
        setShowFilters={setShowFilters}
        requestSort={requestSort}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        handleEdit={handleEdit}
        setItemToDelete={setItemToDelete}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        handleFileUpload={handleFileUpload}
        handleExportExcel={handleExportExcel}
        handleConfirmUpload={handleConfirmUpload}
        onClosePreviewModal={() => {
          setShowPreviewModal(false);
          setFileToUpload(null);
        }}
        onOpenAddUserModal={() => {
          setSelectedUser(null);
          setIsModalOpen(true);
        }}
      />

      {/* Modal Components */}
      {isModalOpen && (
        <FormUser
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
            refresh();
          }}
          selectedUser={selectedUser}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteUserModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          itemToDelete={itemToDelete}
        />
      )}

      {showPreviewModal && (
        <ModalPreviewExcel
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setFileToUpload(null);
          }}
          previewData={previewData}
          onConfirmUpload={handleConfirmUpload}
          isLoading={isUploading}
        />
      )}
    </>
  );
};

export default ListUser;
