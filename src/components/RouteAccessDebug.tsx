import { useAuth } from '../auth/context/AuthContext';
import { useLocation } from 'react-router-dom';
import { isAdminByRole } from '../utils/roleUtils';
import { FaCheck, FaTimes } from 'react-icons/fa';

const RouteAccessDebug = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Route Access Debug</h3>
      <div className="space-y-1">
        <div><strong>Current Route:</strong> {location.pathname}</div>
        <div><strong>Authenticated:</strong> {isAuthenticated ? (
          <span className="inline-flex items-center">
            <FaCheck className="text-green-500 mr-1" />
            Yes
          </span>
        ) : (
          <span className="inline-flex items-center">
            <FaTimes className="text-red-500 mr-1" />
            No
          </span>
        )}</div>
        <div><strong>User Role:</strong> {user?.user_type || 'None'}</div>
        <div><strong>User ID:</strong> {user?.id || 'None'}</div>
        <div><strong>Email:</strong> {user?.email || 'None'}</div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-600">
        <div className="font-bold mb-1">Access Check:</div>
        <div className="space-y-1">
          <div>
            <strong>Public Routes:</strong>
            {['/', '/login', '/signup', '/verify-email'].includes(location.pathname) ? (
              <FaCheck className="text-green-500 inline ml-1" />
            ) : (
              <FaTimes className="text-red-500 inline ml-1" />
            )}
          </div>
          <div>
            <strong>Protected Routes:</strong>
            {['/dashboard', '/profile', '/onboarding'].some(route => location.pathname.startsWith(route)) ? (
              <FaCheck className="text-green-500 inline ml-1" />
            ) : (
              <FaTimes className="text-red-500 inline ml-1" />
            )}
          </div>
          <div>
            <strong>Admin Routes:</strong>
            {location.pathname.startsWith('/admin') || location.pathname === '/users-list' ? (
              <FaCheck className="text-green-500 inline ml-1" />
            ) : (
              <FaTimes className="text-red-500 inline ml-1" />
            )}
          </div>
          <div>
            <strong>Can Access Admin:</strong>
            {isAdminByRole(user?.user_type) ? (
              <span className="inline-flex items-center ml-1">
                <FaCheck className="text-green-500 mr-1" />
                Yes
              </span>
            ) : (
              <span className="inline-flex items-center ml-1">
                <FaTimes className="text-red-500 mr-1" />
                No
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteAccessDebug;
