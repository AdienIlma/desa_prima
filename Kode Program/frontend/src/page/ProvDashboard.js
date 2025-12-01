// src/page/ProvDashboard.js - Versi Debug
import React, { useEffect } from "react";
import ProvinsiDashboard from '../components/ProvinsiDashboard';
import BerandaLayout from '../layouts/BerandaLayout';
import { useAuth } from '../context/AuthContext';

const ProvDashboard = () => {
  const { user } = useAuth();

  useEffect(() => {
    console.log("=== ProvDashboard Debug ===");
    console.log("ProvDashboard mounted");
    console.log("Current user:", user);
    console.log("========================");
  }, [user]);

  // Error boundary untuk menangkap error
  try {
    return (
      <div>
        <BerandaLayout>
          <ProvinsiDashboard />
        </BerandaLayout>
      </div>
    );
  } catch (error) {
    console.error("Error in ProvDashboard:", error);
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">
          <h2>Error in ProvDashboard:</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }
};

export default ProvDashboard;