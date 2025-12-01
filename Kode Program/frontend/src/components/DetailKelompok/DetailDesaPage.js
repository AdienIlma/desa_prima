import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import useDesaData from "../hooks/useDesaData";
import ModalManager from "./Modal/ModalManager";
import toast from "react-hot-toast";
import { Audio } from "react-loader-spinner";
import { useModalHandlers } from "./hooks/useModalHandling";
import { useTabHandler } from "./hooks/useTabHandling";
import {
  useSelectionHandlers,
  useFileHandlers,
} from "./hooks/useSelectionHandling";
import TabPanel from "./TabPanel";
import DetailInfoSection from "./DetailInfoSection";
import PreviewContent from "./PriviewContent";
import Anggota from "./TabContent/Anggota";
import Produk from "./TabContent/Produk";
import Kas from "./TabContent/Kas";
import Laporan from "./TabContent/Laporan";
import Kegiatan from "./TabContent/Kegiatan";
import useUserData from "../hooks/useUserData";
import { API_CONFIG } from "../../config/apiConfig";

const DetailDesaPage = () => {
  const { profil } = useUserData();
  const { id } = useParams();

  // Tambahkan validasi
  useEffect(() => {
    if (!id) {
      console.error("ID parameter is missing");
      return;
    }
  }, [id]);

  const {
    desa,
    kegiatan,
    kas,
    produk,
    anggota,
    laporan,
    loading,
    error,
    fetchDesaDetail,
    fetchKegiatan,
    fetchProduk,
    fetchKas,
    fetchAnggota,
    fetchLaporan,
  } = useDesaData();

  const {
    selectedItems,
    setSelectedItems,
    visibleOptionId,
    optionsRef,
    toggleOption,
    toggleSelectItem,
    toggleSelectAll,
  } = useSelectionHandlers();

  const { downloadFile, handleDownloadMultiple, handleDeleteMultiple } =
    useFileHandlers();

  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const highlightId = searchParams.get("highlight");

  const {
    // State
    isModalOpen,
    isDeleteModalOpen,
    isDeleteItemModalOpen,
    modalType,
    selectedDesa,
    itemToDelete,
    deleteItemType,
    entityToEdit,
    selectedItem,

    // Setters
    setIsDeleteModalOpen,
    setIsDeleteItemModalOpen,
    setItemToDelete,
    setDeleteItemType,
    setSelectedItem,

    // Handlers
    openDeleteItemModal,
    handleModalClose,
    handleEdit,
    handleEditModal,
    handleAdd,
    handleDeleteModalClose,
  } = useModalHandlers("Anggota", {
    fetchKegiatan,
    fetchLaporan,
    fetchProduk,
    fetchAnggota,
    fetchDesaDetail,
    fetchKas,
  });

  const tabConfig = {
    "Detail Kelompok": ["Anggota", "Produk", "Laporan", "Kegiatan", "Kas"],
  };

  const { selectedTab, setSelectedTab, currentFiles, setCurrentFiles, tabs } =
    useTabHandler(tabConfig, "Kas", {
      fetchKegiatan,
      fetchLaporan,
      fetchProduk,
      fetchAnggota,
      fetchKas,
      kas,
      kegiatan,
      laporan,
      produk,
      anggota,
    });

  useEffect(() => {
    if (id) {
      fetchDesaDetail(id);
      fetchKegiatan(id);
      fetchProduk(id);
      fetchKas(id);
      fetchAnggota(id);
      fetchLaporan(id);
    }
  }, [id]);

  const navigate = useNavigate();
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingDeleteActivity, setLoadingDeleteActivity] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isEdit, setIsEdit] = useState(false); // Menentukan apakah mode edit aktif
  const [isDeleteMultipleModalOpen, setIsDeleteMultipleModalOpen] =
    useState(false);
  const userRole = profil?.role || "";

  // Fungsi untuk mengecek akses
  const hasCRUDAccess = () => {
    return ["Pengurus", "Pendamping"].includes(userRole);
  };

  useEffect(() => {
    if (tabParam && tabs.includes(tabParam)) {
      setSelectedTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (selectedTab === "Kegiatan") {
      setCurrentFiles(kegiatan);
    } else if (selectedTab === "Laporan") {
      setCurrentFiles(laporan);
    } else if (selectedTab === "Produk") {
      setCurrentFiles(produk);
    } else if (selectedTab === "Anggota") {
      setCurrentFiles(anggota);
    } else if (selectedTab === "Kas") {
      setCurrentFiles(kas);
    }
  }, [selectedTab]);

  if (loading || loadingDelete || loadingDeleteActivity) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Audio type="Bars" color="#542d48" height={80} width={80} />
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  const onTabChange = (tab) => {
    setSelectedTab(tab);
    setSelectedFiles([]);
    setSelectedItems([]);
    setSelectedItem(null);
    setIsEdit(false);
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
  };

  const handleDeleteDesa = async () => {
    try {
      if (!id) {
        toast.error("ID desa tidak valid");
        return;
      }

      await toast.promise(
        axios.delete(
          `https://backend-desa-prima-dev.student.stis.ac.id/kelompok/${id}`
        ),
        {
          loading: "Menghapus data desa...",
          success: "Data desa berhasil dihapus!",
          error: (err) => {
            if (err.response?.status === 404) {
              return "Desa tidak ditemukan";
            } else {
              return err.response?.data?.message || "Gagal menghapus data";
            }
          },
        }
      );

      setIsDeleteModalOpen(false);
      navigate(
        desa?.kabupatenNama
          ? `/daftar-kelompok?kabupaten=${encodeURIComponent(
              desa.kabupatenNama
            )}`
          : `/daftar-kelompok`
      );
    } catch (err) {
      console.error("Error detail:", err);
    }
  };

  const handleDeleteItem = async () => {
    try {
      if (deleteItemType === "kegiatan") {
        await axios.delete(
          `https://backend-desa-prima-dev.student.stis.ac.id/komponen-kegiatan/${id}/kegiatan/${itemToDelete.id}`
        );
        toast.success(
          `Kegiatan "${itemToDelete.nama_kegiatan || " "}" berhasil dihapus!`
        );
        fetchKegiatan();
      } else if (deleteItemType === "laporan") {
        await axios.delete(
          `https://backend-desa-prima-dev.student.stis.ac.id/komponen-laporan/${id}/laporan/${itemToDelete.id}`
        );
        toast.success(
          `Laporan "${itemToDelete.nama_laporan || " "}" berhasil dihapus!`
        );
        fetchLaporan();
      } else if (deleteItemType === "produk") {
        await axios.delete(
          `https://backend-desa-prima-dev.student.stis.ac.id/komponen-produk/${id}/produk/${itemToDelete.id}`
        );
        toast.success(
          `Produk "${
            itemToDelete.nama || itemToDelete.namaProduk || " "
          }" berhasil dihapus!`
        );
        fetchProduk();
      } else if (deleteItemType === "anggota") {
        await axios.delete(
          `https://backend-desa-prima-dev.student.stis.ac.id/komponen-anggota/${id}/anggota/${itemToDelete.id}`
        );
        toast.success(
          `Anggota "${
            itemToDelete.nama || itemToDelete.namaAnggota || " "
          }" berhasil dihapus!`
        );
        fetchAnggota();
      } else if (deleteItemType === "kas") {
        await axios.delete(
          `https://backend-desa-prima-dev.student.stis.ac.id/komponen-kas/${id}/kas/${itemToDelete.id}`
        );
        toast.success(
          `Kas "${
            itemToDelete.nama_transaksi || itemToDelete.nama_transaksi || " "
          }" berhasil dihapus!`
        );
        fetchKas();
      }

      setIsDeleteItemModalOpen(false);
    } catch (err) {
      toast.error(
        `Gagal menghapus ${deleteItemType}: ${
          err.response?.data?.message || err.message
        }`
      );
      console.error(err);
    }
  };

  const renderTabContent = () => {
    const commonProps = {
      onSelect: handleItemSelect,
      selectedItems: selectedItems,
      toggleSelectItem: toggleSelectItem,
      toggleSelectAll: () => toggleSelectAll(currentFiles),
      toggleOption: toggleOption,
      visibleOptionId: visibleOptionId,
      optionsRef: optionsRef,
      desa: desa,
      highlightId: highlightId,
      onAdd: (type, desa) => handleAdd(type, desa),
      onEdit: (item, type) => handleEditModal(item, type, desa),
      onDeleteMultiple: confirmDeleteMultiple,
      onDelete: (file, type) => {
        setItemToDelete(file);
        setDeleteItemType(type);
        setIsDeleteItemModalOpen(true);
      },
      onDownload: downloadFile,
      onDownloadMultiple: () =>
        handleDownloadMultiple(selectedItems, selectedTab),
      hasAccess: hasCRUDAccess(),
    };

    const componentProps = {
      Laporan: {
        laporan: laporan,
      },
      Kegiatan: {
        kegiatan: kegiatan,
        highlightId: highlightId,
      },
      Kas: {
        kas: Array.isArray(kas) ? kas : [],
        profil: profil,
        onDelete: (file, type) => openDeleteItemModal(file, type),
      },
      Anggota: {
        anggota: anggota,
        profil: profil,
        onDelete: (file, type) => openDeleteItemModal(file, type),
      },
      Produk: {
        produk: produk,
        profil: profil,
        highlightId: highlightId,
      },
    };

    const components = {
      Laporan,
      Kegiatan,
      Kas,
      Anggota,
      Produk,
    };

    const CurrentComponent = components[selectedTab];

    if (!CurrentComponent) return null;

    return (
      <CurrentComponent {...commonProps} {...componentProps[selectedTab]} />
    );
  };

  const confirmDeleteMultiple = () => {
    if (!selectedItems || selectedItems.length === 0) {
      toast.warning("Tidak ada item yang dipilih");
      return;
    }
    setIsDeleteMultipleModalOpen(true);
  };

  const handleDeleteMultipleConfirmed = async () => {
    try {
      const result = await handleDeleteMultiple(
        selectedItems,
        selectedTab,
        id,
        {
          fetchKegiatan,
          fetchLaporan,
          fetchProduk,
          fetchAnggota,
          fetchKas,
        }
      );

      setIsDeleteMultipleModalOpen(false);
      setSelectedItems([]);
    } catch (error) {
      console.error("Error in handleDeleteMultiple:", error);
    }
  };

  return (
    <>
      <div className="p-5">
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row space-x-0 lg:space-x-4">
          <div className="flex flex-col w-full lg:w-1/2 space-y-6">
            <DetailInfoSection
              desa={desa || {}}
              kegiatan={kegiatan || []}
              produk={produk || []}
              anggota={anggota || []}
              kas={kas || []}
              profil={profil || {}}
              onEdit={() => handleEdit(desa)}
              onDelete={() => setIsDeleteModalOpen(true)}
              hasAccess={hasCRUDAccess()}
            />

            <div className="flex-1 flex flex-col min-h-0 z-10">
              {" "}
              <TabPanel
                tabs={tabs}
                selectedTab={selectedTab}
                onTabChange={onTabChange}
                className="shadow rounded-md text-xs w-1/2"
              />
              <div className="p-2 bg-white shadow-md rounded-md border-gray flex-1 overflow-y-auto max-h-[calc(80vh)]">
                {" "}
                {renderTabContent()}
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 bg-white shadow-md rounded-md p-6 lg:mt-0 ml-0 lg:ml-4 overflow-y-auto max-h-[calc(110vh)]">
            {" "}
            {desa?.id && (
              <PreviewContent
                selectedTab={selectedTab}
                selectedItem={selectedItem}
                desa={desa}
                profil={profil}
                anggota={anggota}
                kas={kas}
                fetchAnggota={fetchAnggota}
                onAdd={handleAdd}
                onDownload={downloadFile}
                onEdit={(item, type) => handleEditModal(item, type, desa)}
                onDelete={(item, type) => openDeleteItemModal(item, type)}
                highlightId={highlightId}
                hasAccess={hasCRUDAccess()}
              />
            )}
          </div>
        </div>
      </div>

      <ModalManager
        // State modal
        isDeleteMultipleModalOpen={isDeleteMultipleModalOpen}
        isDeleteModalOpen={isDeleteModalOpen}
        isDeleteItemModalOpen={isDeleteItemModalOpen}
        isModalOpen={isModalOpen}
        modalType={modalType}
        // State data
        selectedTab={selectedTab}
        selectedItems={selectedItems}
        deleteItemType={deleteItemType}
        itemToDelete={itemToDelete}
        desa={desa}
        id={id}
        selectedDesa={selectedDesa}
        entityToEdit={entityToEdit}
        // Handlers
        setIsDeleteMultipleModalOpen={setIsDeleteMultipleModalOpen}
        setIsDeleteItemModalOpen={setIsDeleteItemModalOpen} // JANGAN LUPA INI
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        handleDeleteModalClose={handleDeleteModalClose}
        handleDeleteMultipleConfirmed={handleDeleteMultipleConfirmed}
        handleDeleteDesa={handleDeleteDesa}
        handleDeleteItem={handleDeleteItem}
        handleModalClose={handleModalClose}
        setSelectedItems={setSelectedItems}
        // Fetch functions
        fetchKegiatan={fetchKegiatan}
        fetchLaporan={fetchLaporan}
        fetchProduk={fetchProduk}
        fetchAnggota={fetchAnggota}
        fetchKas={fetchKas}
        // Loading states
        loadingDeleteActivity={loadingDeleteActivity}
        loadingDelete={loadingDelete}
        anggotaList={anggota || []}
      />
    </>
  );
};

export default DetailDesaPage;
