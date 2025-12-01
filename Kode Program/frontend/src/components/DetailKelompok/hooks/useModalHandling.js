import { useState } from "react";

export const useModalHandlers = (defaultTab, fetchFunctions) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteItemModalOpen, setIsDeleteItemModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedDesa, setSelectedDesa] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteItemType, setDeleteItemType] = useState(null);
  const [entityToEdit, setEntityToEdit] = useState(null);
  const [editEntityType, setEditEntityType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const openDeleteItemModal = (item, type) => {
    setItemToDelete(item);
    setDeleteItemType(type);
    setIsDeleteItemModalOpen(true);
  };

  const handleModalClose = (isSuccess, selectedTab) => {
    setIsModalOpen(false);
    setSelectedDesa(null);
    setModalType(null);
    setSelectedItem(null);

    if (isSuccess) {
      switch (selectedTab) {
        case "Kegiatan":
          fetchFunctions.fetchKegiatan();
          break;
        case "Laporan":
          fetchFunctions.fetchLaporan();
          break;
        case "Produk":
          fetchFunctions.fetchProduk();
          break;
        case "Anggota":
          fetchFunctions.fetchAnggota();
          break;
        case "Kas":
          fetchFunctions.fetchKas();
          break;
        default:
          break;
      }
      fetchFunctions.fetchDesaDetail();
    }
  };

  const handleEdit = (desa) => {
    setSelectedDesa(desa);
    setModalType("form");
    setIsModalOpen(true);
  };

  const handleEditModal = (item, type, desa = null) => {
  setEntityToEdit(item);
  setEditEntityType(type);
  setModalType(type);
  setSelectedDesa(desa); 
  setIsModalOpen(true);
};

  const handleAdd = (type, desa) => {
    setSelectedDesa(desa);
    setEntityToEdit(null);
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
  };

  return {
    // State
    isModalOpen,
    isDeleteModalOpen,
    isDeleteItemModalOpen,
    modalType,
    selectedDesa,
    itemToDelete,
    deleteItemType,
    entityToEdit,
    editEntityType,
    selectedItem,
    // Setters
    setIsModalOpen,
    setIsDeleteModalOpen,
    setIsDeleteItemModalOpen,
    setModalType,
    setSelectedDesa,
    setItemToDelete,
    setDeleteItemType,
    setEntityToEdit,
    setEditEntityType,
    setSelectedItem,
    // Handlers
    openDeleteItemModal,
    handleModalClose,
    handleEdit,
    handleEditModal,
    handleAdd,
    handleDeleteModalClose,
  };
};
