import React from "react";
import ListKelompokDesa from '../components/DaftarKelompok/ListKelompokDesa';
import Beranda from '../layouts/BerandaLayout';

const DaftarKelompokDesa = () => {
  return (
    <Beranda>
      <ListKelompokDesa />
    </Beranda>
  );
};

export default DaftarKelompokDesa;