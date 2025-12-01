import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Audio } from 'react-loader-spinner';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth(); 
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Audio
          height="80"
          width="80"
          radius="9"
          color="purple"
          ariaLabel="loading"
          wrapperStyle
          wrapperClass
        />
      </div>
    );
  }

  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.role) {
    console.log("User has no role, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    console.log(`Role ${user.role} not in allowed roles [${allowedRoles.join(', ')}]`);
    return <Navigate to="/unauthorized" replace />;
  }

  if (user.role === 'Pendamping' && !user.kabupatenId) {
    console.error("Pendamping needs kabupaten!");
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Error: Invalid user configuration - Missing kabupaten</div>
      </div>
    );
  }

  if (user.role === 'Pengurus' && !user.kelompokId) {
    console.error("Pengurus needs kelompok!");
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Error: Invalid user configuration - Missing kelompok</div>
      </div>
    );
  }
  
  return children || <Outlet />;
};

export default ProtectedRoute;