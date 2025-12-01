import React from "react";
import BerandaLayout from "../../layouts/beranda/BerandaLayout";
import BerandaPage from "../../layouts/beranda/BerandaPage";

const Beranda = () => {
  return (
    <div className="flex h-screen flex-col justify-center">
      <BerandaLayout>
        <BerandaPage />
      </BerandaLayout>
    </div>
  );
};

export default Beranda;
