import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PublicRouteProps {
  children?: React.ReactNode;
}

/**
 * PublicRoute component that redirects authenticated users away from auth pages
 * (like login, signup) to their appropriate dashboard.
 *
 * Staff users are redirected to /admin
 * Regular users are redirected to /dashboard
 * 
 * Note: This component should only wrap authentication pages, not general public pages like homepage
 */
const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    // Show loading state while checking authentication
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    // Staff users go to admin dashboard
    if (user.is_staff) {
      return <Navigate to="/admin" replace />;
    }
    
    // Regular users go to user dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, render the public page
  return children ? <>{children}</> : <Outlet />;
};

export default PublicRoute;
