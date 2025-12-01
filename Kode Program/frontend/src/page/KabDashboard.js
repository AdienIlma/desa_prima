import React from "react";
import KabupatenDashboard from "../components/Kabupaten/KabupatenDashboard";
import Beranda from "../layouts/BerandaLayout";

const KabDashboard = () => {
  return (
    <Beranda>
      <KabupatenDashboard />
    </Beranda>
  );
};

export default KabDashboard;
