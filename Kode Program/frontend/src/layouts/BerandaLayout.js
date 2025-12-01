import React from "react";
import BerandaHeader from "./sections/BerandaHeader";
import BerandaFooter from "./sections/BerandaFooter";

const BerandaLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-base">
      <BerandaHeader />
      <main className="flex-1 mt-16">{children}</main>
      <BerandaFooter />
    </div>
  );
};

export default BerandaLayout;
