import { useState, useEffect } from "react";
import axios from "axios";
import { formatNamaWilayah } from "../utils/format";

const useUserData = () => {
  const [state, setState] = useState({
    profil: {
      nip: "",
      email: "",
      name: "",
      role: "",
      kabupatenId: null,
      nama_kabupaten: "",
    },
    userList: [],
    loading: true,
    error: null,
    kabupatenList: [],
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Token tidak ditemukan");

      // Ambil data kabupaten
      const kabupatenResponse = await axios.get(
        `https://backend-desa-prima-dev.student.stis.ac.id/kabupaten`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const kabupatenList = kabupatenResponse.data || [];
      const kabupatenMapping = {};
      kabupatenList.forEach((kab) => {
        kabupatenMapping[kab.id] = formatNamaWilayah(kab.nama_kabupaten);
      });

      const [profileRes, usersRes] = await Promise.all([
        axios.get(
          `https://backend-desa-prima-dev.student.stis.ac.id/users/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        axios.get(
          `https://backend-desa-prima-dev.student.stis.ac.id/users/list`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      setState({
        profil: {
          ...profileRes.data,
          nama_kabupaten: kabupatenMapping[profileRes.data.kabupatenId] || "",
        },
        userList: usersRes.data.map((user) => ({
          ...user,
          nama_kabupaten: kabupatenMapping[user.kabupatenId] || "",
        })),
        kabupatenList,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    ...state,
    refresh: fetchData,
  };
};

export default useUserData;
