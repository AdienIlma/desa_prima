import React from "react";
import DeleteDetailModal from "./DeleteDetailModal";
import KelompokModal from "../../Modal/KelompokModal";
import TabDetailModal from "./TabDetailModal";

const ModalManager = ({
  // State modal
  isDeleteMultipleModalOpen,
  isDeleteModalOpen,
  isDeleteItemModalOpen,
  isModalOpen,
  setIsDeleteItemModalOpen,
  // State data
  selectedTab,
  selectedItems,
  deleteItemType,
  itemToDelete,
  desa,
  id,
  selectedDesa,
  modalType,
  entityToEdit,
  // Handlers
  setSelectedItems,
  setIsDeleteMultipleModalOpen,
  setIsDeleteModalOpen,
  handleDeleteModalClose,
  handleDeleteMultipleConfirmed,
  handleDeleteDesa,
  handleDeleteItem,
  handleModalClose,
  // Fetch functions
  fetchGaleri,
  fetchNotulensi,
  fetchProduk,
  fetchAnggota,
  fetchKas,

  // Loading states
  loadingDeleteActivity,
  loadingDelete,

  //Data
  anggotaList,
}) => {
  const handleDeleteItemConfirmed = async () => {
    try {
      const success = await handleDeleteItem(id, deleteItemType, itemToDelete, {
        fetchGaleri,
        fetchNotulensi,
        fetchProduk,
        fetchAnggota,
        fetchKas,
      });

      if (success) {
        setIsDeleteItemModalOpen(false);
        setSelectedItems([]);
      }
    } catch (error) {
      console.error("Error dalam handleDeleteItemConfirmed:", error);
    }
  };

  const handleDeleteDesaConfirmed = async () => {
    try {
      const success = await handleDeleteDesa(id, desa);
      if (success) {
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      console.error("Error dalam handleDeleteDesaConfirmed:", error);
    }
  };

  return (
    <>
      {/* Delete Multiple Modal */}
      {isDeleteMultipleModalOpen && (
        <DeleteDetailModal
          isOpen={isDeleteMultipleModalOpen}
          onClose={() => setIsDeleteMultipleModalOpen(false)}
          onConfirm={handleDeleteMultipleConfirmed}
          itemType={selectedTab.toLowerCase()}
          itemName={`${selectedItems?.length || 0} item`}
          isLoading={loadingDeleteActivity}
        />
      )}

      {/* Delete Desa Modal */}
      {isDeleteModalOpen && (
        <DeleteDetailModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteModalClose}
          onConfirm={handleDeleteDesa}
          itemType="desa"
          itemName={desa?.namaDesa}
          isLoading={loadingDelete}
        />
      )}

      {/* Delete Item Modal */}
      {isDeleteItemModalOpen && (
        <DeleteDetailModal
          isOpen={isDeleteItemModalOpen}
          onClose={() => setIsDeleteItemModalOpen(false)}
          onConfirm={handleDeleteItem}
          itemType={deleteItemType}
          itemName={
            deleteItemType === "kegiatan"
              ? itemToDelete?.nama_kegiatan
              : deleteItemType === "laporan"
              ? itemToDelete?.nama_laporan
              : deleteItemType === "produk"
              ? itemToDelete?.nama || itemToDelete?.namaProduk
              : deleteItemType === "kas"
              ? itemToDelete?.nama_transaksi || itemToDelete?.nama_transaksi
              : itemToDelete?.nama || itemToDelete?.namaAnggota
          }
        />
      )}

      {/* Form Modal */}
      {isModalOpen && modalType === "form" && (
        <KelompokModal
          onClose={handleModalClose}
          selectedDesa={selectedDesa}
          isEdit={!!selectedDesa}
        />
      )}

      {/* Tab Detail Modal */}
      {isModalOpen &&
        (modalType === "anggota" ||
          modalType === "produk" ||
          modalType === "laporan" ||
          modalType === "kegiatan" ||
          modalType === "kas") && (
          <TabDetailModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            selectedDesa={selectedDesa}
            activeTab={
              modalType === "laporan"
                ? "laporan"
                : modalType === "kegiatan"
                ? "kegiatan"
                : modalType === "produk"
                ? "uraianProduk"
                : modalType === "kas"
                ? "kasDesa"
                : "anggotaDesa"
            }
            initialData={
              ["produk", "anggota", "kas", "kegiatan", "laporan"].includes(
                modalType
              )
                ? entityToEdit
                : undefined
            }
            anggotaList={anggotaList || []}
          />
        )}
    </>
  );
};

export default ModalManager;
