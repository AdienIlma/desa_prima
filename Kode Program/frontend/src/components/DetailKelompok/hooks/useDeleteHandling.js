import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const useDeleteHandlers = () => {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingDeleteActivity, setLoadingDeleteActivity] = useState(false);
  const navigate = useNavigate();

  const handleDeleteDesa = async (id, desaData) => {
    try {
      setLoadingDelete(true);

      const response = await axios.delete(
        `https://backend-desa-prima-dev.student.stis.ac.id/kelompok/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Desa berhasil dihapus");
        navigate(`/kelompok-desa?kabupaten=${desaData.kabupatenNama}`);
        return true;
      }

      throw new Error(response.data.error || "Gagal menghapus desa");
    } catch (error) {
      console.error("Delete Error:", {
        message: error.message,
        response: error.response?.data,
      });

      toast.error(error.response?.data?.error || error.message);
      return false;
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleDeleteItem = async (id, type, item, fetchFunctions) => {
    try {
      setLoadingDeleteActivity(true);

      const endpointMap = {
        galeri: `galeri/${item.id}`,
        notulensi: `notulensi/${item.id}`,
        produk: `produk/${item.id}`,
        Anggota: `anggota/${item.id}`,
        kas: `kas/${item.id}`,
      };

      const endpoint = endpointMap[type];
      if (!endpoint) throw new Error("Jenis item tidak valid");

      const response = await axios.delete(
        `https://backend-desa-prima-dev.student.stis.ac.id/kelompok/${id}/${endpoint}`
      );

      if (response.status === 200) {
        toast.success(`Item ${type} berhasil dihapus`);

        // Panggil fungsi refresh data
        const fetchFunctionName = `fetch${
          type.charAt(0).toUpperCase() + type.slice(1)
        }`;
        if (fetchFunctions[fetchFunctionName]) {
          await fetchFunctions[fetchFunctionName]();
        }

        return true;
      }
      throw new Error("Response status tidak 200");
    } catch (error) {
      console.error("Error hapus item:", {
        message: error.message,
        response: error.response,
      });
      toast.error(error.response?.data?.message || `Gagal menghapus ${type}`, {
        position: "top-center",
        autoClose: 5000,
      });
      return false;
    } finally {
      setLoadingDeleteActivity(false);
    }
  };

  return {
    loadingDelete,
    loadingDeleteActivity,
    handleDeleteDesa,
    handleDeleteItem,
  };
};
