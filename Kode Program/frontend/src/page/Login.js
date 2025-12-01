import React from "react";

const Login = ({ children }) => {
  return (
    <div className="flex h-screen flex-col justify-center items-center px-6 py-12">
      <div className="p-8 rounded-lg border-2 shadow-sm w-full max-w-sm">
        {children}
      </div>
    </div>
  );
};

export default Login;
