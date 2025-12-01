import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import useUserData from "../hooks/useUserData";
import StatusModal from "./Modal/StatusModal";
import NoteModal from "./Modal/NoteModal";
import useHighlightScroll from "../hooks/useHighlightScroll";
import TableDesktop from "./TableDesktop";
import TableMobile from "./TableMobile";

const Table = ({
  columns = [],
  initialData = [],
  isMobile,
  onUpdate,
  highlightedId,
}) => {
  const [data, setData] = useState(initialData);
  const { profil } = useUserData();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "no",
    direction: "ascending",
  });
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const { highlightedRef, isHighlighted, highlightedClassName } =
    useHighlightScroll(highlightedId, data);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const sortedData = React.useMemo(() => {
    let sortableData = [...initialData];
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
  }, [initialData, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Modal handlers untuk Status
  const openStatusModal = (row, status) => {
    setSelectedRow(row);
    setNewStatus(status);
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setSelectedRow(null);
    setNewStatus("");
  };

const confirmStatusChange = async () => {
  try {
    if (!selectedRow?.id || !newStatus) {
      toast.error("Data tidak lengkap untuk mengubah status");
      return;
    }

    setUpdating(true);
    
    // Perbaikan: Gunakan try-catch untuk menangkap error dengan lebih baik
    const response = await axios.patch(
      `https://backend-desa-prima-dev.student.stis.ac.id/kelompok/${selectedRow.id}/status`,
      { status: newStatus.toLowerCase() }, 
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      }
    );

    if (response.data.success === false) {
      throw new Error(response.data.error || "Gagal mengubah status");
    }

    if (onUpdate) {
      await onUpdate();
    }

    // Perbaikan: Handle response dengan lebih baik
    const successMessage = newStatus === "disetujui" && response.data.data?.kategori 
      ? `Status ${selectedRow.nama} berhasil diubah menjadi ${newStatus} dengan kategori ${response.data.data.kategori}`
      : `Status ${selectedRow.nama} berhasil diubah menjadi ${newStatus}`;

    toast.success(successMessage);
    closeStatusModal();
  } catch (error) {
    console.error("Gagal mengubah status:", error);
    const errorMessage = error.response?.data?.error 
      || error.response?.data?.message 
      || error.message 
      || "Terjadi kesalahan pada server";
    
    toast.error(`Gagal mengubah status: ${errorMessage}`);
  } finally {
    setUpdating(false);
  }
};

  // Modal handlers untuk Note
  const openNoteModal = (row) => {
    setSelectedRow(row);
    setNoteInput(row.catatan || "");
    setShowNoteModal(true);
  };

  const closeNoteModal = () => {
    setShowNoteModal(false);
    setSelectedRow(null);
    setNoteInput("");
  };

  const handleNoteInputChange = (value) => {
    setNoteInput(value);
  };

  const submitNote = async () => {
    try {
      setUpdating(true);
      await axios.patch(
        `https://backend-desa-prima-dev.student.stis.ac.id/kelompok/${selectedRow.id}/catatan`,
        {
          catatan: noteInput,
        }
      );

      if (onUpdate) {
        await onUpdate();
      }

      toast.success(`Catatan untuk ${selectedRow.nama} berhasil diperbarui`);
      closeNoteModal();
    } catch (error) {
      console.error("Error updating catatan:", error);
      toast.error("Gagal memperbarui catatan.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      {isMobile ? (
        <TableMobile
          sortedData={sortedData}
          page={page}
          rowsPerPage={rowsPerPage}
          profil={profil}
          openStatusModal={openStatusModal}
          openNoteModal={openNoteModal}
          isHighlighted={isHighlighted}
          highlightedRef={highlightedRef}
          highlightedId={highlightedId}
          highlightedClassName={highlightedClassName}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          data={data}
        />
      ) : (
        <TableDesktop
          columns={columns}
          sortedData={sortedData}
          page={page}
          rowsPerPage={rowsPerPage}
          sortConfig={sortConfig}
          requestSort={requestSort}
          profil={profil}
          openStatusModal={openStatusModal}
          openNoteModal={openNoteModal}
          isHighlighted={isHighlighted}
          highlightedRef={highlightedRef}
          highlightedId={highlightedId}
          highlightedClassName={highlightedClassName}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          data={data}
        />
      )}

      {/* Modals */}
      <StatusModal
        isVisible={showStatusModal}
        selectedRow={selectedRow}
        newStatus={newStatus}
        updating={updating}
        onClose={closeStatusModal}
        onConfirm={confirmStatusChange}
      />

      <NoteModal
        isVisible={showNoteModal}
        selectedRow={selectedRow}
        noteInput={noteInput}
        updating={updating}
        onClose={closeNoteModal}
        onSubmit={submitNote}
        onNoteChange={handleNoteInputChange}
      />
    </div>
  );
};

export default Table;
