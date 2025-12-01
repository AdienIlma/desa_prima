import { useState, useEffect } from "react";

export const useTabHandler = (tabConfig, defaultTab, fetchFunctions) => {
  const [selectedTab, setSelectedTab] = useState(() => {
    const storedTab = localStorage.getItem("selectedTab");
    const validTabs = tabConfig["Detail Kelompok"] || [];
    return validTabs.includes(storedTab) ? storedTab : defaultTab;
  });

  const [currentFiles, setCurrentFiles] = useState([]);

  useEffect(() => {
    const validTabs = tabConfig["Detail Kelompok"] || [];
    if (validTabs.includes(selectedTab)) {
      localStorage.setItem("selectedTab", selectedTab);
    } else {
      if (selectedTab !== defaultTab) {
        setSelectedTab(defaultTab);
      }
      localStorage.setItem("selectedTab", defaultTab);
    }
  }, [selectedTab, tabConfig, defaultTab]);

  useEffect(() => {
    const loadData = async () => {
      switch (selectedTab) {
        case "Kegiatan":
          await fetchFunctions.fetchKegiatan();
          setCurrentFiles(fetchFunctions.kegiatan);
          break;
        case "Laporan":
          await fetchFunctions.fetchLaporan();
          setCurrentFiles(fetchFunctions.laporan);
          break;
        case "Produk":
          await fetchFunctions.fetchProduk();
          setCurrentFiles(fetchFunctions.produk);
          break;
        case "Anggota":
          await fetchFunctions.fetchAnggota();
          setCurrentFiles(fetchFunctions.anggota);
          break;
        case "Kas":
          await fetchFunctions.fetchKas();
          setCurrentFiles(fetchFunctions.kas);
          break;
        default:
          break;
      }
    };

    loadData();
  }, [selectedTab, fetchFunctions]);

  return {
    selectedTab,
    setSelectedTab,
    currentFiles,
    setCurrentFiles,
    tabs: tabConfig["Detail Kelompok"] || [],
  };
};
